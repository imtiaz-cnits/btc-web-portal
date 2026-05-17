"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { uploadFile } from "@/lib/upload";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function createNotice(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { success: false, message: "Unauthorized. Please login again." };
  }

  const authorId = (session.user as any).id;
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const category = formData.get("category") as any;
  const status = formData.get("status") as any;
  const type = formData.get("type") as any;
  const tableData = formData.get("tableData") as string;
  const year = formData.get("year") as string;
  const publishDate = formData.get("publishDate") as string;
  const lastDate = formData.get("lastDate") as string;
  
  if (!title || !category) {
    return { success: false, message: "Title and Category are required." };
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
        publishDate: publishDate ? new Date(publishDate) : null,
        lastDate: lastDate ? new Date(lastDate) : null,
        authorId,
        filePath: filePath || null,
      },
    });

    revalidatePath("/admin/egp-notices");
    revalidatePath("/");
    revalidatePath("/egp-notice");
    return { success: true, message: "Notice created successfully" };
  } catch (error) {
    console.error("Create notice error:", error);
    return { success: false, message: "Failed to create notice" };
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
  
  if (!title || !category) {
    return { success: false, message: "Title and Category are required." };
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
        publishDate: publishDate ? new Date(publishDate) : null,
        lastDate: lastDate ? new Date(lastDate) : null,
        filePath: filePath || null,
      },
    });

    revalidatePath("/admin/egp-notices");
    revalidatePath(`/egp-notice/${id}`);
    revalidatePath("/egp-notice");
    revalidatePath("/");
    return { success: true, message: "Notice updated successfully" };
  } catch (error) {
    console.error("Update notice error:", error);
    return { success: false, message: "Failed to update notice" };
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
