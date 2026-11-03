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
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { success: false, message: "Unauthorized. Please login again." };
  }

  let authorId: string | null = null;
  const sessionUserId = (session.user as any)?.id;

  // 1. Check if session user ID exists in the database
  if (sessionUserId) {
    const userExists = await prisma.user.findUnique({
      where: { id: sessionUserId },
      select: { id: true },
    });
    if (userExists) {
      authorId = userExists.id;
    }
  }

  // 2. If authorId not found by ID, try finding by session user email
  if (!authorId && session.user?.email) {
    const userByEmail = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    if (userByEmail) {
      authorId = userByEmail.id;
    }
  }

  // 3. Fallback to active ADMIN user or first available user in DB
  if (!authorId) {
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
  }

  if (!authorId) {
    return { success: false, message: "No valid author found in the system. Please login or register an admin user." };
  }

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const category = formData.get("category") as any;
  const status = formData.get("status") as any;
  const type = formData.get("type") as any;
  const tableData = formData.get("tableData") as string;
  const year = formData.get("year") as string;
  const publishDate = formData.get("publishDate") as string;
  const lastDate = formData.get("lastDate") as string;
  const lotteryDate = formData.get("lotteryDate") as string;
  
  if (!title || !category) {
    return { success: false, message: "Title and Category are required." };
  }

  if (lastDate && lotteryDate) {
    if (isDateBeforeDhaka(lotteryDate, lastDate)) {
      return { success: false, message: "Lottery Date cannot be before the Last Date of submission." };
    }
  }

  let filePath = null;
  const file = formData.get("file") as File;
  if (file && file.size > 0) {
    filePath = await uploadFile(file);
  }

  try {
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

    revalidatePath("/admin/egp-notices");
    revalidatePath("/");
    revalidatePath("/egp-notice");
    return { success: true, message: "Notice created successfully" };
  } catch (error: any) {
    console.error("Create notice error:", error);
    return { success: false, message: error?.message || "Failed to create notice" };
  }
}

export async function updateNotice(id: string, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { success: false, message: "Unauthorized. Please login again." };
  }

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const category = formData.get("category") as any;
  const status = formData.get("status") as any;
  const type = formData.get("type") as any;
  const tableData = formData.get("tableData") as string;
  const year = formData.get("year") as string;
  const publishDate = formData.get("publishDate") as string;
  const lastDate = formData.get("lastDate") as string;
  const lotteryDate = formData.get("lotteryDate") as string;
  
  if (!title || !category) {
    return { success: false, message: "Title and Category are required." };
  }

  if (lastDate && lotteryDate) {
    if (isDateBeforeDhaka(lotteryDate, lastDate)) {
      return { success: false, message: "Lottery Date cannot be before the Last Date of submission." };
    }
  }

  // Handle file upload if a new one is provided
  let filePath = formData.get("existingFilePath") as string;
  const file = formData.get("file") as File;
  if (file && file.size > 0) {
    const newPath = await uploadFile(file);
    if (newPath) filePath = newPath;
  }

  const clearFile = formData.get("clearFile") as string;
  if (clearFile === "true") {
    filePath = "";
  }

  try {
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

    revalidatePath("/admin/egp-notices");
    revalidatePath(`/egp-notice/${id}`);
    revalidatePath("/egp-notice");
    revalidatePath("/");
    return { success: true, message: "Notice updated successfully" };
  } catch (error: any) {
    console.error("Update notice error:", error);
    return { success: false, message: error?.message || "Failed to update notice" };
  }
}

export async function deleteNotice(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { success: false, message: "Unauthorized." };
  }

  try {
    await prisma.notice.delete({ where: { id } });
    revalidatePath("/admin/egp-notices");
    revalidatePath("/egp-notice");
    revalidatePath("/");
    return { success: true, message: "Notice deleted successfully" };
  } catch (error) {
    console.error("Delete notice error:", error);
    return { success: false, message: "Failed to delete notice" };
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
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { success: false, message: "Unauthorized. Please login again." };
  }

  try {
    await prisma.notice.update({
      where: { id },
      data: {
        category: "LOTTERY_RESULT",
        tableData: tableData,
        filePath: null,
      }
    });

    revalidatePath("/admin/egp-notices");
    revalidatePath(`/egp-notice/${id}`);
    revalidatePath("/egp-notice");
    revalidatePath("/");
    return { success: true, message: "Winner list saved, and notice category updated to Lottery Result." };
  } catch (error: any) {
    console.error("Save notice winners error:", error);
    return { success: false, message: `Failed to save winners: ${error?.message || error}` };
  }
}

export async function uploadNoticePdf(id: string, pdfBase64: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { success: false, message: "Unauthorized. Please login again." };
  }

  try {
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
    
    revalidatePath("/admin/egp-notices");
    revalidatePath(`/egp-notice/${id}`);
    revalidatePath("/egp-notice");
    revalidatePath("/");

    return { success: true, filePath };
  } catch (error: any) {
    console.error("Upload notice PDF error:", error);
    return { success: false, message: `Failed to upload PDF: ${error?.message || error}` };
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
