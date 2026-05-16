"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";

// Mock Data
const MOCK_NOTICES = [
  {
    id: "1",
    no: "01",
    title: "গণপূর্ত বিভাগ, পাবনা। ২ গ্রুপ",
    date: "09 Apr 2026",
    fileUrl: "/assets/img/notice/notice.pdf",
    category: "OTM",
  },
  {
    id: "2",
    no: "02",
    title: "গণপূর্ত বিভাগ, পাবনা। ১ গ্রুপ",
    date: "16 Apr 2026",
    fileUrl: "/assets/img/notice/notice.pdf",
    category: "OTM",
  },
  {
    id: "3",
    no: "03",
    title: "স্থানীয় সরকার প্রকৌশল অধিদপ্তর, পাবনা। ১০ গ্রুপ",
    date: "14 May 2026",
    fileUrl: "/assets/img/notice/notice.pdf",
    category: "LTM",
  },
  {
    id: "4",
    no: "04",
    title: "শিক্ষা প্রকৌশল বিভাগ, পাবনা জেলা। (Social LTM) ১৩ গ্রুপ",
    date: "14 May 2026",
    fileUrl: "/assets/img/notice/notice.pdf",
    category: "LTM",
  },
  {
    id: "5",
    no: "05",
    title: "গণপূর্ত বিভাগ, পাবনা। ৩ গ্রুপ",
    date: "14 May 2026",
    fileUrl: "/assets/img/notice/notice.pdf",
    category: "Lottery Pending",
  },
  {
    id: "6",
    no: "06",
    title: "গণপূর্ত বিভাগ, পাবনা। ১ গ্রুপ",
    date: "14 May 2026",
    fileUrl: "/assets/img/notice/notice.pdf",
    category: "Lottery Pending",
  },
  {
    id: "7",
    no: "07",
    title: "স্থানীয় সরকার প্রকৌশল অধিদপ্তর, পাবনা সদর, পাবনা। ১৬ গ্রুপ",
    date: "14 May 2026",
    fileUrl: "/assets/img/notice/notice.pdf",
    category: "Lottery Result",
  },
  {
    id: "8",
    no: "08",
    title:
      "স্থানীয় সরকার প্রকৌশল অধিদপ্তর, পাবনা সদর, পাবনা। (Social LTM) ৬ গ্রুপ",
    date: "14 May 2026",
    fileUrl: "/assets/img/notice/notice.pdf",
    category: "Lottery Result",
  },
  {
    id: "9",
    no: "09",
    title:
      "বরেন্দ্র বহুমুখী উন্নয়ন কর্তৃপক্ষ, ইআইডিবি প্রজেক্ট (২য় পর্যায়), রাজশাহী। ৪ গ্রুপ",
    date: "14 May 2026",
    fileUrl: "/assets/img/notice/notice.pdf",
    category: "Lottery Result",
  },
];

const SingleNoticePage = () => {
  const { id } = useParams();
  const notice = MOCK_NOTICES.find((n) => n.id === id) || MOCK_NOTICES[0];

  const isPdf = notice.fileUrl.toLowerCase().endsWith(".pdf");

  const handlePrint = () => {
    if (isPdf) {
      const iframe = document.getElementById(
        "notice-frame",
      ) as HTMLIFrameElement;
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.print();
      }
    } else {
      window.print();
    }
  };

  return (
    <div className="single_notice_page bg-secondary pt-10">
      <div className="custom-container">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-5">
          <div className="flex-1">
            <Link
              href="/egp-notice"
              className="text-text-1 hover:!text-primary font-bold inline-flex items-center gap-2 mb-4 transition"
            >
              <i className="fa-solid fa-arrow-left"></i> BACK TO ALL NOTICES
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-text-1 font-bangla leading-tight uppercase">
              {notice.title}
            </h1>
            <div className="flex items-center gap-4 mt-3">
              <span className="bg-primary text-white px-4 py-1 rounded-full text-xs font-bold uppercase">
                {notice.category}
              </span>
              <span className="text-text-2 text-sm font-bold">
                <i className="fa-solid fa-calendar-days mr-2"></i> {notice.date}
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="bg-text-1 text-white px-6 py-3 rounded-xl font-bold text-sm uppercase hover:bg-primary transition flex items-center gap-2 shadow-lg"
            >
              <i className="fa-solid fa-print"></i> Print
            </button>
            <a
              href={notice.fileUrl}
              download
              className="bg-primary hover:!text-secondary text-white px-6 py-3 rounded-xl font-bold text-sm uppercase hover:bg-text-1 transition flex items-center gap-2 shadow-lg"
            >
              <i className="fa-solid fa-download"></i> Download
            </a>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-[32px] border border-ac-2 shadow-2xl overflow-hidden">
          <div className="w-full relative bg-shade-1 p-0">
            {isPdf ? (
              <iframe
                id="notice-frame"
                src={`${notice.fileUrl}#toolbar=0&navpanes=0&view=FitH`}
                className="w-full h-screen border-none block"
                title="Notice PDF"
              ></iframe>
            ) : (
              <img
                src={notice.fileUrl}
                alt={notice.title}
                className="w-full h-auto block mx-auto"
              />
            )}

            {/* Watermark Overlay (Only for images) */}
            {!isPdf && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 select-none rotate-45">
                <span className="text-[100px] font-bold text-text-1 whitespace-nowrap">
                  BTC CONSULTANT
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleNoticePage;
