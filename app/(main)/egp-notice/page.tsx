"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import NoticeTable from "@/components/NoticeTable";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Assets
import NoticeHeroImage from "@/assets/img/contact/contact-theame-image.png";
import ContactBg from "@/assets/img/contact/contact-bg.png";

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

const EgpNoticePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("All");
  const tabs = ["All", "OTM", "LTM", "Lottery Pending", "Lottery Result"];

  const filteredNotices =
    activeTab === "All"
      ? MOCK_NOTICES
      : MOCK_NOTICES.filter((n) => n.category === activeTab);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    let ctx = gsap.context(() => {
      const selectors = [
        ".breadcrumb_section",
        ".tab_section",
        ".table_section",
      ];

      selectors.forEach((sel) => {
        gsap.fromTo(
          sel,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            scrollTrigger: {
              trigger: sel,
              start: "top 90%",
              toggleActions: "play none none none",
            },
          },
        );
      });

      setTimeout(() => ScrollTrigger.refresh(), 500);
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="egp_notice_page bg-secondary overflow-hidden">
      {/* Tabs System */}
      <div className="tab_section mt-16 mb-10">
        <div className="custom-container text-center">
          <div className="text-center mb-10">
            <h3 className="text-primary font-bold uppercase tracking-widest text-sm mb-2">
              Tender Information
            </h3>
            <h2 className="text-3xl lg:text-4xl font-bold text-text-1 uppercase">
              Browse Notices by Category
            </h2>
          </div>

          <div className="inline-flex flex-wrap justify-center gap-3 bg-white p-3 rounded-2xl border border-ac-2 shadow-sm">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-3 rounded-xl font-bold text-sm transition-all duration-300 uppercase tracking-wide ${
                  activeTab === tab
                    ? "bg-primary text-white shadow-lg scale-105"
                    : "bg-transparent text-text-2 hover:bg-shade-1"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notices Table */}
      <div className="table_section">
        <div className="custom-container">
          <NoticeTable notices={filteredNotices} />

          {/* Pagination Placeholder */}
          <div className="mt-10 flex justify-center items-center gap-3">
            <button className="w-10 h-10 rounded-full border border-ac-2 flex items-center justify-center hover:bg-primary hover:text-white transition group">
              <i className="fa-solid fa-arrow-left"></i>
            </button>
            <button className="w-10 h-10 rounded-full bg-primary text-white font-bold">
              1
            </button>
            <button className="w-10 h-10 rounded-full border border-ac-2 font-bold hover:bg-shade-1 transition text-text-2">
              2
            </button>
            <button className="w-10 h-10 rounded-full border border-ac-2 font-bold hover:bg-shade-1 transition text-text-2">
              3
            </button>
            <button className="w-10 h-10 rounded-full border border-ac-2 flex items-center justify-center hover:bg-primary hover:text-white transition group">
              <i className="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EgpNoticePage;
