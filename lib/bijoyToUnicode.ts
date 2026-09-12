import {
  convertBijoyToUnicode as rawConvertBijoyToUnicode,
  shouldConvertAsBijoy,
  hasBengaliUnicode,
  looksLikeBijoy,
} from "bijoy2unicode";

/**
 * Pre-processes Sutonny / Bijoy text to normalize common word-processor and web artifacts
 */
function preProcessSutonny(text: string): string {
  if (!text) return "";
  return text
    .replace(/\u00A0/g, " ")       // Non-breaking space to regular space
    .replace(/[\u200B-\u200D\uFEFF]/g, "") // Zero-width characters
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&");
}

/**
 * Converts SutonnyMJ / SutonnyOMJ / Bijoy text to standard Unicode Bengali.
 */
export function convertSutonnyToUnicode(text: string): string {
  if (!text) return "";
  try {
    const cleaned = preProcessSutonny(text);
    return rawConvertBijoyToUnicode(cleaned);
  } catch (err) {
    console.error("Sutonny to Unicode conversion error:", err);
    return text;
  }
}

/**
 * Alias for convertSutonnyToUnicode (Bijoy and SutonnyMJ use the same encoding)
 */
export const convertBijoyToUnicode = convertSutonnyToUnicode;

/**
 * Checks if a string contains standard Unicode Bengali characters (\u0980-\u09FF).
 */
export function isUnicodeBengali(text: string): boolean {
  if (!text) return false;
  return hasBengaliUnicode(text);
}

/**
 * Checks whether the text is truly encoded in SutonnyMJ / Bijoy rather than plain English or Unicode.
 * Uses font-aware statistical character distribution to strictly avoid false positives on English text.
 */
export function isSutonny(text: string): boolean {
  if (!text || typeof text !== "string") return false;
  // If it already has Bengali Unicode, never treat as Sutonny/Bijoy
  if (hasBengaliUnicode(text)) return false;

  // Strict font-aware detection: protects English words like "Development", "Location", etc.
  return shouldConvertAsBijoy(text);
}

/**
 * Alias for isSutonny
 */
export const isBijoy = isSutonny;

/**
 * Automatically converts text if it is detected as SutonnyMJ or Bijoy.
 * Leaves standard English and existing Unicode Bengali completely untouched.
 */
export function autoConvertSutonny(text: string): string {
  if (!text || typeof text !== "string") return text;
  if (isSutonny(text)) {
    return convertSutonnyToUnicode(text);
  }
  return text;
}

/**
 * Alias for autoConvertSutonny
 */
export const autoConvertBijoy = autoConvertSutonny;

/**
 * Recursively sanitizes any strings in an object or array, converting Sutonny/Bijoy text to Unicode.
 */
export function sanitizeSutonnyDeep<T>(data: T): T {
  if (data === null || data === undefined) return data;

  if (typeof data === "string") {
    return autoConvertSutonny(data) as unknown as T;
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeSutonnyDeep(item)) as unknown as T;
  }

  if (typeof data === "object") {
    const result: Record<string, any> = {};
    for (const key of Object.keys(data as Record<string, any>)) {
      result[key] = sanitizeSutonnyDeep((data as Record<string, any>)[key]);
    }
    return result as T;
  }

  return data;
}

/**
 * Alias for sanitizeSutonnyDeep
 */
export const sanitizeBijoyDeep = sanitizeSutonnyDeep;

/**
 * React clipboard onPaste handler to automatically convert pasted SutonnyMJ / Bijoy text to Unicode.
 */
export function handleSutonnyPaste(
  e: React.ClipboardEvent<HTMLInputElement | HTMLTextAreaElement>,
  setValue: (value: string) => void
) {
  const pastedText = e.clipboardData?.getData("text") || "";
  if (isSutonny(pastedText)) {
    e.preventDefault();
    const converted = convertSutonnyToUnicode(pastedText);

    const target = e.target as HTMLInputElement | HTMLTextAreaElement;
    const start = target.selectionStart ?? target.value.length;
    const end = target.selectionEnd ?? target.value.length;

    const newValue =
      target.value.substring(0, start) +
      converted +
      target.value.substring(end);

    setValue(newValue);
  }
}

/**
 * Alias for handleSutonnyPaste
 */
export const handleBijoyPaste = handleSutonnyPaste;

export { shouldConvertAsBijoy, hasBengaliUnicode, looksLikeBijoy };
