import { NextRequest, NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import path from "path";
import { getProjectRoot } from "@/lib/upload";

export const dynamic = "force-dynamic";

const MIME_TYPES: Record<string, string> = {
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".bmp": "image/bmp",
};

async function findExistingFile(candidates: string[]): Promise<string | null> {
  for (const candidate of candidates) {
    try {
      const fileStat = await stat(candidate);
      if (fileStat.isFile()) return candidate;
    } catch {
      // continue checking other candidate paths
    }
  }
  return null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const segments = params?.path || [];
    if (!segments.length) {
      return NextResponse.json({ error: "File path is required" }, { status: 400 });
    }

    // Prevent path traversal attacks
    const safeSegments = segments.filter(
      (seg) => seg && seg !== "." && seg !== ".." && !seg.includes("\\")
    );
    if (safeSegments.length !== segments.length) {
      return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
    }

    const projectRoot = getProjectRoot();
    const cwd = process.cwd();

    // Serve PDF.js worker directly so standalone deployments never 404 on /pdf.worker.min.js
    if (safeSegments.length === 1 && safeSegments[0] === "pdf-worker") {
      const workerCandidates = Array.from(
        new Set([
          path.resolve(projectRoot, "public", "pdf.worker.min.js"),
          path.resolve(cwd, "public", "pdf.worker.min.js"),
          path.resolve(projectRoot, "node_modules", "pdfjs-dist", "build", "pdf.worker.min.js"),
          path.resolve(cwd, "node_modules", "pdfjs-dist", "build", "pdf.worker.min.js"),
        ])
      );
      const workerPath = await findExistingFile(workerCandidates);
      if (!workerPath) {
        return NextResponse.json({ error: "PDF worker not found" }, { status: 404 });
      }
      const workerBuf = await readFile(workerPath);
      return new NextResponse(workerBuf, {
        status: 200,
        headers: {
          "Content-Type": "application/javascript; charset=utf-8",
          "Content-Length": String(workerBuf.length),
          "Cache-Control": "public, max-age=86400",
        },
      });
    }

    const baseRoots = Array.from(new Set([projectRoot, cwd]));
    const candidatePaths: string[] = [];

    for (const root of baseRoots) {
      const publicRoot = path.resolve(root, "public");
      const publicAssetsRoot = path.resolve(root, "public", "assets");

      let resolved = path.resolve(publicRoot, ...safeSegments);
      if (!resolved.startsWith(publicAssetsRoot + path.sep) && resolved !== publicAssetsRoot) {
        resolved = path.resolve(publicAssetsRoot, ...safeSegments);
      }

      if (resolved.startsWith(publicAssetsRoot + path.sep)) {
        candidatePaths.push(resolved);
      }
    }

    if (candidatePaths.length === 0) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const targetPath = await findExistingFile(candidatePaths);
    if (!targetPath) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const fileBuffer = await readFile(targetPath);
    const ext = path.extname(targetPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    const { searchParams } = new URL(request.url);
    const shouldDownload = searchParams.get("download") === "1";
    const requestedFilename = searchParams.get("filename");

    const headers = new Headers();
    headers.set("Content-Type", contentType);
    headers.set("Content-Length", String(fileBuffer.length));
    headers.set("Cache-Control", "public, max-age=3600");

    if (shouldDownload) {
      const rawName = (requestedFilename || path.basename(targetPath))
        .replace(/[\r\n"]/g, "")
        .trim();
      const finalName = rawName.toLowerCase().endsWith(ext) || !ext ? rawName : `${rawName}${ext}`;
      const asciiFallback = finalName.replace(/[^\x20-\x7E]/g, "_").replace(/"/g, "") || `notice${ext}`;
      const encodedName = encodeURIComponent(finalName);
      headers.set(
        "Content-Disposition",
        `attachment; filename="${asciiFallback}"; filename*=UTF-8''${encodedName}`
      );
    } else {
      const baseName = path.basename(targetPath).replace(/"/g, "");
      headers.set("Content-Disposition", `inline; filename="${baseName}"`);
    }

    return new NextResponse(fileBuffer, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("File serving error:", error);
    return NextResponse.json({ error: "Failed to load file" }, { status: 500 });
  }
}
