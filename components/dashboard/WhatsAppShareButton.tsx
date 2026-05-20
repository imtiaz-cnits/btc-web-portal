"use client";

import { useState, useEffect } from "react";

interface NoticeItem {
  id: string;
  title: string;
  category: string;
  year?: string | null;
  publishDate?: Date | string | null;
  lastDate?: Date | string | null;
  tableData?: string | null;
  filePath?: string | null;
}

const toBengaliDigits = (numStr: string | number) => {
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return numStr.toString().replace(/\d/g, (d) => bengaliDigits[parseInt(d)]);
};

const formatBengaliDate = (dateVal: any) => {
  if (!dateVal) return "";
  
  // If it already has Bengali digits, return it directly
  if (typeof dateVal === "string" && /[০-৯]/.test(dateVal)) {
    return dateVal;
  }
  
  try {
    const date = new Date(dateVal);
    if (isNaN(date.getTime())) {
      return toBengaliDigits(dateVal.toString());
    }
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear());
    return `${toBengaliDigits(day)}/${toBengaliDigits(month)}/${toBengaliDigits(year)}ইং`;
  } catch (e) {
    return toBengaliDigits(dateVal.toString());
  }
};

export default function WhatsAppShareButton({ notice }: { notice: NoticeItem }) {
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    const origin = window.location.origin;
    
    let officeName = "";
    let groupCount = 1;
    let finalLastDate = notice.lastDate;

    // Parse officeName and group counts from tableData if it exists
    if (notice.tableData) {
      try {
        const parsed = JSON.parse(notice.tableData);
        let parsedTables: any[] = [];
        if (parsed.version === "v2" && Array.isArray(parsed.tables)) {
          parsedTables = parsed.tables;
        } else {
          if (parsed.isPwdTemplate) {
            parsedTables = [
              {
                officeName: parsed.officeName || "",
                rows: parsed.rows || [],
                lastDateBlock: parsed.lastDateBlock || "",
              },
            ];
          } else if (parsed.headers && parsed.rows) {
            parsedTables = [
              {
                rows: parsed.rows || [],
              },
            ];
          }
        }

        if (parsedTables.length > 0) {
          const firstTable = parsedTables[0];
          officeName = firstTable.officeName || "";
          
          // Sum up rows as groups
          groupCount = parsedTables.reduce((acc, t) => acc + (t.rows?.length || 0), 0) || 1;
          
          if (firstTable.lastDateBlock) {
            finalLastDate = firstTable.lastDateBlock;
          }
        }
      } catch (e) {
        console.error("Error parsing tableData for WhatsApp share", e);
      }
    }

    // Constructing the exact message format:
    // টেন্ডার নোটিশ | [গ্রুপ সংখ্যা] গ্রুপ
    // [অফিসের নাম (বাংলা)]
    // [ শিরোনাম / বিবরণ ]
    // শেষ তারিখ: [তারিখ]ইং
    // [নোটিশ লিঙ্ক]
    const msgLines: string[] = [];
    msgLines.push(`টেন্ডার নোটিশ । ${toBengaliDigits(groupCount)} গ্রুপ`);
    
    if (officeName) {
      msgLines.push(officeName);
    }
    
    msgLines.push(notice.title);
    
    if (finalLastDate) {
      msgLines.push(`শেষ তারিখ: ${formatBengaliDate(finalLastDate)}`);
    }
    
    msgLines.push(`${origin}/egp-notice/${notice.id}`);

    // If a PDF or file is attached, add the direct file download link
    if (notice.filePath) {
      const fileUrl = `${origin}${notice.filePath}`;
      msgLines.push(`\n📄 সংযুক্ত ফাইল ডাউনলোড লিঙ্ক:\n${fileUrl}`);
    }

    const message = msgLines.join("\n");
    const encodedMessage = encodeURIComponent(message);
    setShareUrl(`https://wa.me/?text=${encodedMessage}`);
  }, [notice]);

  const handleShareClick = (e: React.MouseEvent) => {
    // If a file is attached, trigger its download or open in a new tab simultaneously 
    // so the client has the file ready to drag-and-drop / select in WhatsApp.
    if (notice.filePath) {
      const fileUrl = `${window.location.origin}${notice.filePath}`;
      window.open(fileUrl, "_blank");
    }
  };

  return (
    <a
      href={shareUrl || "#"}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleShareClick}
      className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition inline-flex items-center justify-center border-0 active:scale-95 shadow-sm cursor-pointer"
      title="Share to WhatsApp"
    >
      <svg
        className="w-4 h-4 fill-current text-white"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.713-1.455L0 24zm6.59-4.846c1.66.986 3.284 1.447 4.908 1.448 5.41-.001 9.812-4.417 9.815-9.83.002-2.623-1.01-5.086-2.854-6.93C16.671 1.997 14.213 1.002 11.6 1.002c-5.418 0-9.825 4.414-9.828 9.828-.001 1.706.46 3.376 1.34 4.872l-.99 3.619 3.716-.975c1.472.805 2.923 1.157 4.219 1.157zm11.233-6.993c-.3-.15-1.776-.876-2.05-.976-.275-.1-.475-.15-.675.15-.2.3-.775.976-.95 1.176-.175.2-.35.225-.65.075-.3-.15-1.267-.467-2.414-1.492-.892-.796-1.494-1.78-1.669-2.08-.175-.3-.018-.462.13-.61.135-.133.3-.35.45-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.675-1.625-.925-2.225-.244-.589-.493-.51-.675-.52-.172-.007-.368-.007-.565-.007-.196 0-.518.074-.789.37-.272.295-1.037 1.012-1.037 2.47 0 1.456 1.06 2.868 1.208 3.067.147.2 2.087 3.186 5.055 4.47.705.305 1.256.488 1.685.625.708.226 1.35.194 1.858.118.567-.085 1.776-.726 2.025-1.428.25-.701.25-1.302.175-1.428-.075-.125-.275-.2-.575-.35z" />
      </svg>
    </a>
  );
}
