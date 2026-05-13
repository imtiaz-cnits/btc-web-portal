"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { uploadFile } from "@/lib/upload";

export async function createNotice(formData: FormData) {
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const category = formData.get("category") as any;
  const status = formData.get("status") as any;
  const publishDate = formData.get("publishDate") as string;
  const lastDate = formData.get("lastDate") as string;
  const authorId = formData.get("authorId") as string;
  
  // Handle file upload
  const file = formData.get("file") as File;
  const filePath = await uploadFile(file);

  try {
    await prisma.notice.create({
      data: {
        title,
        content,
        category,
        status,
        publishDate: publishDate ? new Date(publishDate) : null,
        lastDate: lastDate ? new Date(lastDate) : null,
        authorId,
        filePath,
      },
    });

    revalidatePath("/admin/egp-notices");
    revalidatePath("/");
    return { success: true, message: "Notice created successfully" };
  } catch (error) {
    console.error("Create notice error:", error);
    return { success: false, message: "Failed to create notice" };
  }
}

export async function deleteNotice(id: string) {
  try {
    await prisma.notice.delete({ where: { id } });
    revalidatePath("/admin/egp-notices");
    revalidatePath("/");
    return { success: true, message: "Notice deleted successfully" };
  } catch (error) {
    console.error("Delete notice error:", error);
    return { success: false, message: "Failed to delete notice" };
  }
}

export async function updateNotice(id: string, formData: FormData) {
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const category = formData.get("category") as any;
  const status = formData.get("status") as any;
  const publishDate = formData.get("publishDate") as string;
  const lastDate = formData.get("lastDate") as string;
  
  // Handle file upload if a new one is provided
  const file = formData.get("file") as File;
  let filePath = formData.get("existingFilePath") as string;
  
  if (file && file.size > 0) {
    const newPath = await uploadFile(file);
    if (newPath) filePath = newPath;
  }

  try {
    await prisma.notice.update({
      where: { id },
      data: {
        title,
        content,
        category,
        status,
        publishDate: publishDate ? new Date(publishDate) : null,
        lastDate: lastDate ? new Date(lastDate) : null,
        filePath,
      },
    });

    revalidatePath("/admin/egp-notices");
    revalidatePath(`/egp-notice/${id}`);
    revalidatePath("/");
    return { success: true, message: "Notice updated successfully" };
  } catch (error) {
    console.error("Update notice error:", error);
    return { success: false, message: "Failed to update notice" };
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
