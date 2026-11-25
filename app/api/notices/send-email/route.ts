import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import nodemailer from "nodemailer";
import {
  MAIN_SENDER_EMAIL,
  sanitizeEmailList,
} from "@/lib/defaultEmailRecipients";
import { readStoredEmailConfig } from "@/lib/emailDirectoryStore";

export const dynamic = "force-dynamic";

const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const MAX_TOTAL_ATTACHMENT_BYTES = 18 * 1024 * 1024; // 18MB (safe for Gmail 25MB MIME limit)

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized. Please login again." },
      { status: 401 },
    );
  }

  try {
    const contentType = request.headers.get("content-type") || "";
    let rawRecipients: unknown = [];
    let subject = "";
    let message = "";
    let rawFromEmail = "";
    const attachments: Array<{
      filename: string;
      content: Buffer;
      contentType: string;
    }> = [];

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const recipientsField = formData.get("recipients");
      if (typeof recipientsField === "string") {
        try {
          rawRecipients = JSON.parse(recipientsField);
        } catch {
          rawRecipients = recipientsField.split(/[,;\s]+/);
        }
      }
      subject = String(formData.get("subject") || "").trim();
      message = String(formData.get("body") || "").trim();
      const fromField = formData.get("fromEmail");
      rawFromEmail = typeof fromField === "string" ? fromField : "";

      const rawFiles = formData.getAll("attachments");
      let totalBytes = 0;

      for (const entry of rawFiles) {
        if (
          !entry ||
          typeof entry === "string" ||
          typeof (entry as File).arrayBuffer !== "function"
        ) {
          continue;
        }
        const file = entry as File;
        if (file.size <= 0) continue;

        const fileName = (file.name || "attachment.pdf").trim();
        const lowerName = fileName.toLowerCase();
        const mime = (file.type || "").toLowerCase();
        const isPdf =
          lowerName.endsWith(".pdf") ||
          mime === "application/pdf" ||
          mime === "application/x-pdf";

        if (!isPdf) {
          return NextResponse.json(
            {
              success: false,
              message: `শুধুমাত্র PDF ফাইল অ্যাটাচ করা যাবে ("${fileName}" গ্রহণযোগ্য নয়)।`,
            },
            { status: 400 },
          );
        }

        totalBytes += file.size;
        if (totalBytes > MAX_TOTAL_ATTACHMENT_BYTES) {
          return NextResponse.json(
            {
              success: false,
              message:
                "অ্যাটাচ করা PDF ফাইলের মোট সাইজ ১৮ MB-এর বেশি হতে পারবে না (Gmail লিমিট)।",
            },
            { status: 400 },
          );
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        attachments.push({
          filename: fileName,
          content: buffer,
          contentType: "application/pdf",
        });
      }
    } else {
      const body = await request.json();
      rawRecipients = body?.recipients;
      subject = String(body?.subject || "").trim();
      message = String(body?.body || "").trim();
      rawFromEmail = typeof body?.fromEmail === "string" ? body.fromEmail : "";
    }

    const recipients = sanitizeEmailList(rawRecipients);

    if (recipients.length === 0) {
      return NextResponse.json(
        { success: false, message: "অন্তত একটি প্রাপকের ইমেইল নির্বাচন করুন।" },
        { status: 400 },
      );
    }

    if (!subject || !message) {
      return NextResponse.json(
        { success: false, message: "Subject এবং Message খালি রাখা যাবে না।" },
        { status: 400 },
      );
    }

    const storedConfig = await readStoredEmailConfig();
    const requestedFrom =
      rawFromEmail && isValidEmail(rawFromEmail)
        ? rawFromEmail.trim().toLowerCase()
        : "";

    const activeSenderEmail =
      requestedFrom ||
      storedConfig.mainEmail ||
      (process.env.SMTP_USER || MAIN_SENDER_EMAIL).trim().toLowerCase();

    const envPass = (
      process.env.GMAIL_APP_PASSWORD ||
      process.env.SMTP_PASS ||
      ""
    )
      .replace(/\s+/g, "")
      .trim();

    const smtpPass = storedConfig.customAppPassword || envPass;

    if (!smtpPass) {
      return NextResponse.json(
        {
          success: false,
          mode: "gmail_fallback",
          message:
            "SMTP App Password configured নয়। Gmail Web Compose ব্যবহার করা হচ্ছে।",
        },
        { status: 200 },
      );
    }

    const smtpHost = (process.env.SMTP_HOST || "smtp.gmail.com").trim();
    const smtpPort = Number(process.env.SMTP_PORT || 465);
    const smtpSecure =
      process.env.SMTP_SECURE !== undefined
        ? process.env.SMTP_SECURE === "true"
        : smtpPort === 465;

    const usePool = recipients.length > 1;
    const isGmail = smtpHost.toLowerCase() === "smtp.gmail.com";
    const senderDomain = activeSenderEmail.split("@")[1] || "gmail.com";

    // Match EHLO/Message-ID domain to sender's domain (e.g. gmail.com) and use standard STARTTLS
    // submission (port 587) with clean quoted-printable plain text for highest Primary Inbox trust.
    const transporter = nodemailer.createTransport({
      name: senderDomain,
      ...(usePool
        ? {
            pool: true,
            maxConnections: 1,
            maxMessages: 250,
            rateDelta: 1000,
            rateLimit: 3,
          }
        : {}),
      ...(isGmail
        ? {
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            requireTLS: true,
          }
        : { host: smtpHost, port: smtpPort, secure: smtpSecure }),
      auth: {
        user: activeSenderEmail,
        pass: smtpPass,
      },
    });

    // Send a separate individual email sequentially to EACH selected recipient (To: recipient)
    const sentEmails: string[] = [];
    const failedEmails: string[] = [];
    let firstErrorReason = "";

    try {
      await transporter.verify();

      for (let i = 0; i < recipients.length; i++) {
        const recipientEmail = recipients[i];
        try {
          const info = await transporter.sendMail({
            from: activeSenderEmail,
            to: recipientEmail,
            subject,
            text: message,
            textEncoding: "quoted-printable",
            ...(attachments.length > 0 ? { attachments } : {}),
          });

          const acceptedList = Array.isArray(info?.accepted)
            ? info.accepted.map((a: any) => String(a).toLowerCase())
            : [];

          if (acceptedList.length > 0) {
            sentEmails.push(recipientEmail);
          } else {
            failedEmails.push(recipientEmail);
            if (!firstErrorReason) {
              firstErrorReason = `SMTP rejected recipient: ${recipientEmail}`;
            }
          }
        } catch (sendErr: any) {
          failedEmails.push(recipientEmail);
          if (!firstErrorReason) {
            firstErrorReason = sendErr?.message || String(sendErr || "");
          }
        }

        // Gentle pacing between individual emails so Gmail doesn't flag burst blasts as spam
        if (i < recipients.length - 1) {
          await sleep(150);
        }
      }
    } catch (verifyErr: any) {
      const reason = verifyErr?.message || "SMTP authentication failed";
      const isAuthErr =
        reason.includes("535") ||
        reason.toLowerCase().includes("badcredentials") ||
        reason.toLowerCase().includes("username and password not accepted");
      return NextResponse.json(
        {
          success: false,
          mode: "error",
          message: isAuthErr
            ? `Main Email (${activeSenderEmail})-এর সাথে App Password মিলছে না! এই Gmail অ্যাকাউন্টের সঠিক ১৬ অক্ষরের App Password দিয়ে Save করে আবার চেষ্টা করুন।`
            : `SMTP Error: ${reason}`,
        },
        { status: 400 },
      );
    } finally {
      if (usePool) {
        transporter.close();
      }
    }

    const sentCount = sentEmails.length;
    if (sentCount === 0) {
      return NextResponse.json(
        {
          success: false,
          mode: "error",
          message: firstErrorReason
            ? `ইমেইল পাঠানো যায়নি (${activeSenderEmail}): ${firstErrorReason}`
            : `কোনো ইমেইলে মেসেজ পাঠানো যায়নি। অনুগ্রহ করে ${activeSenderEmail}-এর সঠিক App Password চেক করুন।`,
          failedEmails,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      mode: "smtp",
      sentCount,
      sentEmails,
      failedCount: failedEmails.length,
      failedEmails,
      from: activeSenderEmail,
      message:
        failedEmails.length > 0
          ? `${sentCount}টি ইমেইলে আলাদাভাবে মেসেজ পাঠানো হয়েছে (${failedEmails.length}টি ব্যর্থ)`
          : `${sentCount}টি ইমেইলে আলাদাভাবে মেসেজ সফলভাবে পাঠানো হয়েছে`,
    });
  } catch (error: any) {
    console.error("Send notice email error:", error);
    return NextResponse.json(
      {
        success: false,
        mode: "error",
        message:
          error?.message ||
          "ইমেইল পাঠাতে সমস্যা হয়েছে। অনুগ্রহ করে SMTP / App Password চেক করুন।",
      },
      { status: 500 },
    );
  }
}
