"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { uploadFile } from "@/lib/upload";

export async function createWinner(formData: FormData) {
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const status = formData.get("status") as any;
  const publishDate = formData.get("publishDate") as string;
  const authorId = formData.get("authorId") as string;
  
  // Handle file upload
  const file = formData.get("file") as File;
  const filePath = await uploadFile(file);

  try {
    await prisma.winnerList.create({
      data: {
        title,
        content,
        status,
        publishDate: publishDate ? new Date(publishDate) : null,
        authorId,
        filePath,
      },
    });

    revalidatePath("/admin/winner-list");
    revalidatePath("/");
    return { success: true, message: "Winner added successfully" };
  } catch (error) {
    console.error("Create winner error:", error);
    return { success: false, message: "Failed to add winner" };
  }
}

export async function deleteWinner(id: string) {
  try {
    await prisma.winnerList.delete({ where: { id } });
    revalidatePath("/admin/winner-list");
    revalidatePath("/");
    return { success: true, message: "Winner deleted successfully" };
  } catch (error) {
    console.error("Delete winner error:", error);
    return { success: false, message: "Failed to delete winner" };
  }
}

export async function getWinners() {
  try {
    return await prisma.winnerList.findMany({
      orderBy: { createdAt: "desc" },
      include: { createdBy: { select: { name: true } } }
    });
  } catch (error) {
    console.error("Get winners error:", error);
    return [];
  }
}

export async function updateWinner(id: string, formData: FormData) {
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const status = formData.get("status") as any;
  const publishDate = formData.get("publishDate") as string;
  
  // Handle file upload if a new one is provided
  const file = formData.get("file") as File;
  let filePath = formData.get("existingFilePath") as string;
  
  if (file && file.size > 0) {
    const newPath = await uploadFile(file);
    if (newPath) filePath = newPath;
  }

  try {
    await prisma.winnerList.update({
      where: { id },
      data: {
        title,
        content,
        status,
        publishDate: publishDate ? new Date(publishDate) : null,
        filePath,
      },
    });

    revalidatePath("/admin/winner-list");
    revalidatePath(`/winner-list/${id}`);
    revalidatePath("/");
    return { success: true, message: "Winner updated successfully" };
  } catch (error) {
    console.error("Update winner error:", error);
    return { success: false, message: "Failed to update winner" };
  }
}

export async function getWinnerById(id: string) {
  try {
    return await prisma.winnerList.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error("Get winner by id error:", error);
    return null;
  }
}

