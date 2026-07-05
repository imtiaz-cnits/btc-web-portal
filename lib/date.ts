export function getEndOfDayDhaka(dateInput: Date | string | null | undefined): Date | null {
  if (!dateInput) return null;
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return null;

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
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "N/A";

  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Dhaka",
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(date).replace(/\//g, "-");
}

export function isDateBeforeDhaka(dateA: Date | string, dateB: Date | string): boolean {
  const dA = new Date(dateA);
  const dB = new Date(dateB);
  if (isNaN(dA.getTime()) || isNaN(dB.getTime())) return false;

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
  const ld = new Date(lastDate);
  if (isNaN(ld.getTime())) return false;

  const nowDate = now ? new Date(now) : new Date();

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
