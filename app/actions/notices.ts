"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { uploadFile } from "@/lib/upload";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import fs from "fs/promises";
import path from "path";
import { getEndOfDayDhaka, isDateBeforeDhaka, parseDateSafe } from "@/lib/date";

export async function createNotice(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return {
        success: false,
        message: "Unauthorized. Please login again.",
        error: "Unauthorized. Please login again."
      };
    }

    let authorId: string | null = null;
    const sessionUserId = (session.user as any)?.id;

    // 1. Check if session user ID exists in the database
    if (sessionUserId) {
      try {
        const userExists = await prisma.user.findUnique({
          where: { id: sessionUserId },
          select: { id: true },
        });
        if (userExists) {
          authorId = userExists.id;
        }
      } catch (err) {
        console.warn("User ID lookup warning:", err);
      }
    }

    // 2. If authorId not found by ID, try finding by session user email
    if (!authorId && session.user?.email) {
      try {
        const email = session.user.email.trim();
        const userByEmail = await prisma.user.findFirst({
          where: {
            OR: [
              { email: email },
              { email: email.toLowerCase() },
              { email: email.toUpperCase() }
            ]
          },
          select: { id: true },
        });
        if (userByEmail) {
          authorId = userByEmail.id;
        }
      } catch (err) {
        console.warn("User email lookup warning:", err);
      }
    }

    // 3. Fallback to active ADMIN user or first available user in DB
    if (!authorId) {
      try {
        const adminUser = await prisma.user.findFirst({
          where: { role: "ADMIN" },
          select: { id: true },
        });
        if (adminUser) {
          authorId = adminUser.id;
        } else {
          const anyUser = await prisma.user.findFirst({
            select: { id: true },
          });
          if (anyUser) {
            authorId = anyUser.id;
          }
        }
      } catch (err) {
        console.warn("User fallback lookup warning:", err);
      }
    }

    if (!authorId) {
      return {
        success: false,
        message: "No valid author found in the system. Please login or register an admin user.",
        error: "No valid author found in the system. Please login or register an admin user."
      };
    }

    const title = (formData.get("title") as string) || "";
    const content = (formData.get("content") as string) || "";
    const rawCategory = (formData.get("category") as string) || "LTM";
    const rawStatus = (formData.get("status") as string) || "active";
    const rawType = (formData.get("type") as string) || "TABLE";
    const tableData = (formData.get("tableData") as string) || null;
    const year = (formData.get("year") as string) || null;
    const publishDate = (formData.get("publishDate") as string) || null;
    const lastDate = (formData.get("lastDate") as string) || null;
    const lotteryDate = (formData.get("lotteryDate") as string) || null;

    if (!title.trim()) {
      return {
        success: false,
        message: "Notice title is required.",
        error: "Notice title is required."
      };
    }

    // Normalize category enum
    let category: any = "LTM";
    const upperCat = rawCategory.toUpperCase().trim();
    if (["LTM", "OTM", "LOTTERY_PENDING", "LOTTERY_RESULT"].includes(upperCat)) {
      category = upperCat;
    }

    // Normalize status enum
    let status: any = "active";
    const lowerStatus = rawStatus.toLowerCase().trim();
    if (["active", "inactive"].includes(lowerStatus)) {
      status = lowerStatus;
    }

    // Normalize type enum
    let type: any = "TABLE";
    const upperType = rawType.toUpperCase().trim();
    if (["FILE", "TEXT", "TABLE"].includes(upperType)) {
      type = upperType;
    }

    if (lastDate && lotteryDate) {
      if (isDateBeforeDhaka(lotteryDate, lastDate)) {
        return {
          success: false,
          message: "Lottery Date cannot be before the Last Date of submission.",
          error: "Lottery Date cannot be before the Last Date of submission."
        };
      }
    }

    let filePath = null;
    const file = formData.get("file") as File;
    if (file && typeof file === "object" && "size" in file && file.size > 0) {
      filePath = await uploadFile(file);
    }

    await prisma.notice.create({
      data: {
        title,
        content: content || null,
        type,
        tableData: tableData || null,
        year,
        category,
        status,
        publishDate: publishDate ? parseDateSafe(publishDate) : null,
        lastDate: lastDate ? getEndOfDayDhaka(lastDate) : null,
        lotteryDate: lotteryDate ? parseDateSafe(lotteryDate) : null,
        authorId,
        filePath: filePath || null,
      },
    });

    try {
      revalidatePath("/admin/egp-notices");
      revalidatePath("/");
      revalidatePath("/egp-notice");
    } catch (revalErr) {
      console.warn("createNotice revalidatePath warning (non-fatal):", revalErr);
    }

    return {
      success: true,
      message: "Notice created successfully"
    };
  } catch (error: any) {
    console.error("Create notice error:", error);
    const errorMsg = error?.message || String(error) || "Failed to create notice";
    return {
      success: false,
      message: errorMsg,
      error: errorMsg
    };
  }
}

export async function updateNotice(id: string, formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return {
        success: false,
        message: "Unauthorized. Please login again.",
        error: "Unauthorized. Please login again."
      };
    }

    const title = (formData.get("title") as string) || "";
    const content = (formData.get("content") as string) || "";
    const rawCategory = (formData.get("category") as string) || "LTM";
    const rawStatus = (formData.get("status") as string) || "active";
    const rawType = (formData.get("type") as string) || "TABLE";
    const tableData = (formData.get("tableData") as string) || null;
    const year = (formData.get("year") as string) || null;
    const publishDate = (formData.get("publishDate") as string) || null;
    const lastDate = (formData.get("lastDate") as string) || null;
    const lotteryDate = (formData.get("lotteryDate") as string) || null;

    if (!title.trim()) {
      return {
        success: false,
        message: "Notice title is required.",
        error: "Notice title is required."
      };
    }

    // Normalize category enum
    let category: any = "LTM";
    const upperCat = rawCategory.toUpperCase().trim();
    if (["LTM", "OTM", "LOTTERY_PENDING", "LOTTERY_RESULT"].includes(upperCat)) {
      category = upperCat;
    }

    // Normalize status enum
    let status: any = "active";
    const lowerStatus = rawStatus.toLowerCase().trim();
    if (["active", "inactive"].includes(lowerStatus)) {
      status = lowerStatus;
    }

    // Normalize type enum
    let type: any = "TABLE";
    const upperType = rawType.toUpperCase().trim();
    if (["FILE", "TEXT", "TABLE"].includes(upperType)) {
      type = upperType;
    }

    if (lastDate && lotteryDate) {
      if (isDateBeforeDhaka(lotteryDate, lastDate)) {
        return {
          success: false,
          message: "Lottery Date cannot be before the Last Date of submission.",
          error: "Lottery Date cannot be before the Last Date of submission."
        };
      }
    }

    // Handle file upload if a new one is provided
    let filePath = formData.get("existingFilePath") as string;
    const file = formData.get("file") as File;
    if (file && typeof file === "object" && "size" in file && file.size > 0) {
      const newPath = await uploadFile(file);
      if (newPath) filePath = newPath;
    }

    const clearFile = formData.get("clearFile") as string;
    if (clearFile === "true") {
      filePath = "";
    }

    await prisma.notice.update({
      where: { id },
      data: {
        title,
        content: content || null,
        type,
        tableData: tableData || null,
        year,
        category,
        status,
        publishDate: publishDate ? parseDateSafe(publishDate) : null,
        lastDate: lastDate ? getEndOfDayDhaka(lastDate) : null,
        lotteryDate: lotteryDate ? parseDateSafe(lotteryDate) : null,
        filePath: filePath || null,
      },
    });

    try {
      revalidatePath("/admin/egp-notices");
      revalidatePath(`/egp-notice/${id}`);
      revalidatePath("/egp-notice");
      revalidatePath("/");
    } catch (revalErr) {
      console.warn("updateNotice revalidatePath warning (non-fatal):", revalErr);
    }

    return {
      success: true,
      message: "Notice updated successfully"
    };
  } catch (error: any) {
    console.error("Update notice error:", error);
    const errorMsg = error?.message || String(error) || "Failed to update notice";
    return {
      success: false,
      message: errorMsg,
      error: errorMsg
    };
  }
}

export async function deleteNotice(id: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return {
        success: false,
        message: "Unauthorized.",
        error: "Unauthorized."
      };
    }

    await prisma.notice.delete({ where: { id } });

    try {
      revalidatePath("/admin/egp-notices");
      revalidatePath("/egp-notice");
      revalidatePath("/");
    } catch (revalErr) {
      console.warn("deleteNotice revalidatePath warning (non-fatal):", revalErr);
    }

    return { success: true, message: "Notice deleted successfully" };
  } catch (error: any) {
    console.error("Delete notice error:", error);
    const errorMsg = error?.message || String(error) || "Failed to delete notice";
    return {
      success: false,
      message: errorMsg,
      error: errorMsg
    };
  }
}

export async function getNotices() {
  try {
    return await prisma.notice.findMany({
      orderBy: { createdAt: "desc" },
      include: { createdBy: { select: { name: true } } }
    });
  } catch (error) {
    console.error("Get notices error:", error);
    return [];
  }
}

export async function getNoticeById(id: string) {
  try {
    return await prisma.notice.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error("Get notice by id error:", error);
    return null;
  }
}

export async function getRecentNotices() {
  try {
    return await prisma.notice.findMany({
      orderBy: { createdAt: "desc" },
      take: 4,
      select: {
        id: true,
        title: true,
        category: true,
        createdAt: true,
        type: true
      }
    });
  } catch (error) {
    console.error("Get recent notices error:", error);
    return [];
  }
}

export async function saveNoticeWinners(id: string, tableData: string, pdfBase64?: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return {
        success: false,
        message: "Unauthorized. Please login again.",
        error: "Unauthorized. Please login again."
      };
    }

    await prisma.notice.update({
      where: { id },
      data: {
        category: "LOTTERY_RESULT",
        tableData: tableData,
        filePath: null,
      }
    });

    try {
      revalidatePath("/admin/egp-notices");
      revalidatePath(`/egp-notice/${id}`);
      revalidatePath("/egp-notice");
      revalidatePath("/");
    } catch (revalErr) {
      console.warn("saveNoticeWinners revalidatePath warning (non-fatal):", revalErr);
    }

    return {
      success: true,
      message: "Winner list saved, and notice category updated to Lottery Result."
    };
  } catch (error: any) {
    console.error("Save notice winners error:", error);
    const errorMsg = `Failed to save winners: ${error?.message || error}`;
    return {
      success: false,
      message: errorMsg,
      error: errorMsg
    };
  }
}

export async function uploadNoticePdf(id: string, pdfBase64: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return {
        success: false,
        message: "Unauthorized. Please login again.",
        error: "Unauthorized. Please login again."
      };
    }

    const buffer = Buffer.from(pdfBase64, "base64");
    const uploadDir = path.join(process.cwd(), "public", "assets", "pdf");
    await fs.mkdir(uploadDir, { recursive: true });
    const fileName = `${id}-details.pdf`;
    const fullPath = path.join(uploadDir, fileName);
    await fs.writeFile(fullPath, buffer);
    const filePath = `/assets/pdf/${fileName}`;

    await prisma.notice.update({
      where: { id },
      data: { filePath }
    });

    try {
      revalidatePath("/admin/egp-notices");
      revalidatePath(`/egp-notice/${id}`);
      revalidatePath("/egp-notice");
      revalidatePath("/");
    } catch (revalErr) {
      console.warn("uploadNoticePdf revalidatePath warning (non-fatal):", revalErr);
    }

    return { success: true, filePath };
  } catch (error: any) {
    console.error("Upload notice PDF error:", error);
    const errorMsg = `Failed to upload PDF: ${error?.message || error}`;
    return {
      success: false,
      message: errorMsg,
      error: errorMsg
    };
  }
}

export async function getNoticeCountsByTitle() {
  try {
    const counts = await prisma.notice.groupBy({
      by: ["title"],
      _count: {
        id: true,
      },
    });

    const countsMap: Record<string, number> = {};
    counts.forEach((item) => {
      if (item.title) {
        countsMap[item.title] = item._count.id;
      }
    });

    return { success: true, counts: countsMap };
  } catch (error) {
    console.error("Failed to get notice counts by title:", error);
    return { success: false, counts: {} };
  }
}

export async function getSystemEmailRecipients() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, users };
  } catch (error: any) {
    console.error("Failed to fetch system emails:", error);
    return { success: false, users: [] };
  }
}
