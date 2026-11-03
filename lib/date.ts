export function parseDateSafe(dateInput: Date | string | null | undefined): Date | null {
  if (!dateInput) return null;
  if (dateInput instanceof Date) {
    return isNaN(dateInput.getTime()) ? null : dateInput;
  }
  const trimmed = String(dateInput).trim();
  if (!trimmed) return null;

  // Handle DD-MM-YYYY or DD-MM-YYYY HH:mm or DD-MM-YYYY hh:mm AM/PM (common Bangladesh / Flatpickr format)
  const dmyMatch = trimmed.match(
    /^(\d{2})-(\d{2})-(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?)?$/i,
  );
  if (dmyMatch) {
    const [_, d, m, y, hStr, minStr, secStr, ampm] = dmyMatch;
    let hours = hStr ? parseInt(hStr, 10) : 0;
    const minutes = minStr ? parseInt(minStr, 10) : 0;
    const seconds = secStr ? parseInt(secStr, 10) : 0;
    if (ampm) {
      const upper = ampm.toUpperCase();
      if (upper === "PM" && hours < 12) hours += 12;
      else if (upper === "AM" && hours === 12) hours = 0;
    }
    const result = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10), hours, minutes, seconds);
    return isNaN(result.getTime()) ? null : result;
  }

  // Standard Date parse (for ISO strings like 2026-11-02T12:00:00.000Z or standard formats)
  const parsed = new Date(trimmed);
  return isNaN(parsed.getTime()) ? null : parsed;
}

export function getEndOfDayDhaka(dateInput: Date | string | null | undefined): Date | null {
  if (!dateInput) return null;
  const date = parseDateSafe(dateInput);
  if (!date || isNaN(date.getTime())) return null;

  // Extract YYYY-MM-DD in Asia/Dhaka timezone
  const formatOptions: Intl.DateTimeFormatOptions = {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  };
  const dhakaDateStr = new Intl.DateTimeFormat("en-CA", formatOptions).format(date);
  const [year, month, day] = dhakaDateStr.split("-").map(Number);

  // Return a Date representing 23:59:59.999 in Dhaka (UTC+6)
  // 23:59:59.999 Dhaka time is 17:59:59.999 UTC of that day.
  return new Date(Date.UTC(year, month - 1, day, 17, 59, 59, 999));
}

export function formatDateDhaka(dateInput: Date | string | null | undefined): string {
  if (!dateInput) return "N/A";
  const date = parseDateSafe(dateInput);
  if (!date || isNaN(date.getTime())) return "N/A";

  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Dhaka",
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(date).replace(/\//g, "-");
}

export function isDateBeforeDhaka(dateA: Date | string, dateB: Date | string): boolean {
  const dA = parseDateSafe(dateA);
  const dB = parseDateSafe(dateB);
  if (!dA || !dB || isNaN(dA.getTime()) || isNaN(dB.getTime())) return false;

  const formatOptions: Intl.DateTimeFormatOptions = {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  };
  const strA = new Intl.DateTimeFormat("en-CA", formatOptions).format(dA);
  const strB = new Intl.DateTimeFormat("en-CA", formatOptions).format(dB);

  return strA < strB;
}

export function isNoticeExpired(lastDate: Date | string | null | undefined, now?: Date | string): boolean {
  if (!lastDate) return false;
  const ld = parseDateSafe(lastDate);
  if (!ld || isNaN(ld.getTime())) return false;

  const nowDate = now ? (parseDateSafe(now) || new Date()) : new Date();

  const formatOptions: Intl.DateTimeFormatOptions = {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  };
  const todayStr = new Intl.DateTimeFormat("en-CA", formatOptions).format(nowDate);
  const lastDateStr = new Intl.DateTimeFormat("en-CA", formatOptions).format(ld);

  return todayStr > lastDateStr;
}
