export function resolveNoticeFileUrl(
  filePath?: string | null,
  downloadFilename?: string
): string {
  if (!filePath) return "";
  const trimmed = String(filePath).trim();
  if (!trimmed) return "";

  // External URLs pass through unchanged
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  let normalized = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;

  // Route uploaded assets through dynamic /api/files handler so runtime uploads never 404 in standalone/production
  if (normalized.startsWith("/assets/img/") || normalized.startsWith("/assets/pdf/")) {
    normalized = `/api/files${normalized}`;
  }

  if (downloadFilename && normalized.startsWith("/api/files/")) {
    const separator = normalized.includes("?") ? "&" : "?";
    return `${normalized}${separator}download=1&filename=${encodeURIComponent(downloadFilename)}`;
  }

  return normalized;
}

export function buildNoticeDownloadFilename(opts: {
  title?: string | null;
  year?: string | null;
  date?: string | null;
  publishDate?: string | null;
  lastDate?: string | null;
  filePath?: string | null;
}): string {
  const rawTitle = (opts.title || "notice")
    .replace(/[/\\:*?"<>|]/g, "-")
    .replace(/\s+/g, " ")
    .trim();

  const rawDate = (opts.lastDate && opts.lastDate !== "N/A"
    ? opts.lastDate
    : opts.date && opts.date !== "N/A"
      ? opts.date
      : opts.publishDate && opts.publishDate !== "N/A"
        ? opts.publishDate
        : ""
  )
    .replace(/[/\\:*?"<>|]/g, "-")
    .trim();

  let cleanYear = (opts.year || "").replace(/[/\\:*?"<>|]/g, "").trim();
  if (!cleanYear && rawDate) {
    const yearMatch = rawDate.match(/\b(20\d{2})\b/);
    if (yearMatch) cleanYear = yearMatch[1];
  }

  // Extract file extension (default .pdf)
  let ext = ".pdf";
  if (opts.filePath) {
    const cleanPath = opts.filePath.split("?")[0].split("#")[0];
    const dotIdx = cleanPath.lastIndexOf(".");
    if (dotIdx !== -1) {
      const candidate = cleanPath.slice(dotIdx).toLowerCase();
      if (/^\.[a-z0-9]{2,5}$/.test(candidate)) {
        ext = candidate;
      }
    }
  }

  const parts = [rawTitle, cleanYear, rawDate].filter(Boolean);
  return `${parts.join("-")}${ext}`;
}
