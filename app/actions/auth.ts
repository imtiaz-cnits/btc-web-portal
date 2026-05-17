"use server";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { signJWT } from "@/lib/jwt";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { success: false, message: "All fields are required" };
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return { success: false, message: "Invalid credentials" };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return { success: false, message: "Password is incorrect" };
    }

    const token = await signJWT({ id: user.id });
    const cookieStore = await cookies();
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 1 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    return { success: true, message: "Login successful" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Internal server error" };
  }
}

export async function register(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!name || !email || !password) {
    return { success: false, message: "All fields are required" };
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return { success: false, message: "User already exists" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role: "ADMIN" },
    });

    const token = await signJWT({ id: user.id });
    const cookieStore = await cookies();
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 1 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    return { success: true, message: "User registered successfully", userId: user.id };
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, message: "Internal server error" };
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("token");
  return { success: true, message: "Logout successful" };
}

export async function updateProfile(userId: string, formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;

  if (!name || !email) {
    return { success: false, message: "All fields are required" };
  }

  try {
    const existingUser = await prisma.user.findFirst({
      where: { email, NOT: { id: userId } }
    });

    if (existingUser) {
      return { success: false, message: "Email is already taken" };
    }

    await prisma.user.update({
      where: { id: userId },
      data: { name, email }
    });

    return { success: true, message: "Profile updated successfully" };
  } catch (error) {
    console.error("Update profile error:", error);
    return { success: false, message: "Internal server error" };
  }
}

export async function updatePassword(userId: string, formData: FormData) {
  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { success: false, message: "All fields are required" };
  }

  if (newPassword !== confirmPassword) {
    return { success: false, message: "New passwords do not match" };
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return { success: false, message: "User not found" };
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return { success: false, message: "Current password is incorrect" };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    return { success: true, message: "Password updated successfully" };
  } catch (error) {
    console.error("Update password error:", error);
    return { success: false, message: "Internal server error" };
  }
}

export async function getAllUsers() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    }
  });
}

export async function updateUserRole(userId: string, role: "ADMIN" | "USER") {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return { success: false, message: "Unauthorized" };
  }

  // Prevent admin from demoting themselves!
  if ((session.user as any).id === userId) {
    return { success: false, message: "You cannot change your own role!" };
  }

  try {
    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) {
      return { success: false, message: "User not found" };
    }

    // Protect existing ADMIN role from modifications
    if (targetUser.role === "ADMIN") {
      return { success: false, message: "Protected! You cannot modify an ADMIN user's role." };
    }

    await prisma.user.update({
      where: { id: userId },
      data: { role },
    });
    revalidatePath("/admin/roles");
    return { success: true, message: "Role updated successfully" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to update role" };
  }
}

export async function resetUserPassword(userId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return { success: false, message: "Unauthorized" };
  }

  try {
    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) {
      return { success: false, message: "User not found" };
    }

    // Protect ADMIN role
    if (targetUser.role === "ADMIN" && (session.user as any).id !== userId) {
      return { success: false, message: "Protected! You cannot reset an ADMIN's password from here." };
    }

    const hashedPassword = await bcrypt.hash("12345678", 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });
    return { success: true, message: "Password reset successfully to default '12345678'" };
  } catch (error) {
    console.error("Reset password error:", error);
    return { success: false, message: "Failed to reset password" };
  }
}

export async function deleteUserAccount(userId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return { success: false, message: "Unauthorized" };
  }

  if ((session.user as any).id === userId) {
    return { success: false, message: "You cannot delete your own account!" };
  }

  try {
    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) {
      return { success: false, message: "User not found" };
    }

    // Protect ADMIN from deletion
    if (targetUser.role === "ADMIN") {
      return { success: false, message: "Protected! You cannot delete an ADMIN user." };
    }

    // Reassign notices and winnerLists to current logged in admin to prevent key constraints failure
    const currentAdminId = (session.user as any).id;
    await prisma.notice.updateMany({
      where: { authorId: userId },
      data: { authorId: currentAdminId }
    });
    await prisma.winnerList.updateMany({
      where: { authorId: userId },
      data: { authorId: currentAdminId }
    });

    await prisma.user.delete({
      where: { id: userId }
    });

    revalidatePath("/admin/roles");
    return { success: true, message: "User account deleted successfully" };
  } catch (error) {
    console.error("Delete user error:", error);
    return { success: false, message: "Failed to delete user account" };
  }
}


