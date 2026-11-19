import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export function getProjectRoot(): string {
  const cwd = process.cwd();
  const normalized = cwd.replace(/\\/g, "/");
  if (normalized.endsWith("/.next/standalone")) {
    return path.resolve(cwd, "..", "..");
  }
  return cwd;
}

export async function uploadFile(file: File | null): Promise<string | null> {
  if (!file || file.size === 0) return null;

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const fileExtension = path.extname(file.name);
    const fileName = `${uuidv4()}${fileExtension}`;

    // Always save to persistent <projectRoot>/public/assets/img (even in .next/standalone mode)
    const uploadDir = path.join(getProjectRoot(), "public", "assets", "img");
    const filePath = path.join(uploadDir, fileName);

    // Ensure directory exists
    await mkdir(uploadDir, { recursive: true });

    // Write file
    await writeFile(filePath, buffer);

    // Return the dynamic API URL path so runtime uploads never 404 in standalone/production
    return `/api/files/assets/img/${fileName}`;
  } catch (error) {
    console.error("Upload Error:", error);
    return null;
  }
}
