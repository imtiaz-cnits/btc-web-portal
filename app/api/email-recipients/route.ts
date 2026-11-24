import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import {
  MAIN_SENDER_EMAIL,
  sanitizeEmailList,
} from "@/lib/defaultEmailRecipients";
import {
  StoredEmailConfig,
  readStoredEmailConfig,
  writeStoredEmailConfig,
  toPublicDirectory,
  syncEmailSettingsToEnv,
} from "@/lib/emailDirectoryStore";

export const dynamic = "force-dynamic";

const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  const config = await readStoredEmailConfig();
  const envPass = (
    process.env.GMAIL_APP_PASSWORD ||
    process.env.SMTP_PASS ||
    ""
  ).trim();
  const smtpConfigured = Boolean(config.customAppPassword || envPass);

  return NextResponse.json({
    success: true,
    directory: toPublicDirectory(config),
    smtpConfigured,
    hasCustomAppPassword: Boolean(config.customAppPassword),
  });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const body = await request.json();
    const current = await readStoredEmailConfig();
    const action = body?.action as string | undefined;

    if (action === "updateMainEmail") {
      const nextEmail = String(body?.mainEmail || "").trim().toLowerCase();
      if (!isValidEmail(nextEmail)) {
        return NextResponse.json(
          { success: false, message: "সঠিক Main Email অ্যাড্রেস লিখুন।" },
          { status: 400 },
        );
      }

      const incomingPass =
        typeof body?.appPassword === "string"
          ? body.appPassword.replace(/\s+/g, "").trim()
          : "";

      const resolvedPass = incomingPass || current.customAppPassword || "";

      const updated: StoredEmailConfig = {
        ...current,
        mainEmail: nextEmail,
        customAppPassword: resolvedPass,
      };
      await writeStoredEmailConfig(updated);
      await syncEmailSettingsToEnv(nextEmail, incomingPass || undefined);

      const envPass = (
        process.env.GMAIL_APP_PASSWORD ||
        process.env.SMTP_PASS ||
        ""
      ).trim();

      return NextResponse.json({
        success: true,
        directory: toPublicDirectory(updated),
        smtpConfigured: Boolean(updated.customAppPassword || envPass),
        hasCustomAppPassword: Boolean(updated.customAppPassword),
      });
    }

    if (action === "add") {
      const category = body?.category === "BANK" ? "BANK" : "TENDERER";
      const incoming = sanitizeEmailList(body?.emails);
      if (incoming.length === 0) {
        return NextResponse.json(
          { success: false, message: "No valid email addresses provided." },
          { status: 400 },
        );
      }

      const targetKey = category === "BANK" ? "bank" : "tenderer";
      const existingSet = new Set(current[targetKey]);
      const added: string[] = [];
      for (const email of incoming) {
        if (!existingSet.has(email)) {
          existingSet.add(email);
          added.push(email);
        }
      }

      const updated: StoredEmailConfig = {
        ...current,
        [targetKey]: [...added, ...current[targetKey]],
      };
      await writeStoredEmailConfig(updated);
      return NextResponse.json({
        success: true,
        directory: toPublicDirectory(updated),
        added,
      });
    }

    if (action === "remove") {
      const category = body?.category === "BANK" ? "BANK" : "TENDERER";
      const emailToRemove = String(body?.email || "").trim().toLowerCase();
      if (!emailToRemove) {
        return NextResponse.json(
          { success: false, message: "Email is required." },
          { status: 400 },
        );
      }

      const targetKey = category === "BANK" ? "bank" : "tenderer";
      const updated: StoredEmailConfig = {
        ...current,
        [targetKey]: current[targetKey].filter((e) => e !== emailToRemove),
      };
      await writeStoredEmailConfig(updated);
      return NextResponse.json({
        success: true,
        directory: toPublicDirectory(updated),
      });
    }

    const updated: StoredEmailConfig = {
      ...current,
      mainEmail:
        typeof body?.mainEmail === "string" && isValidEmail(body.mainEmail)
          ? body.mainEmail.trim().toLowerCase()
          : current.mainEmail,
      bank: Array.isArray(body?.bank)
        ? sanitizeEmailList(body.bank)
        : current.bank,
      tenderer: Array.isArray(body?.tenderer)
        ? sanitizeEmailList(body.tenderer)
        : current.tenderer,
    };
    await writeStoredEmailConfig(updated);
    return NextResponse.json({
      success: true,
      directory: toPublicDirectory(updated),
    });
  } catch (error: any) {
    console.error("Failed to update email recipients:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to update recipients" },
      { status: 500 },
    );
  }
}
