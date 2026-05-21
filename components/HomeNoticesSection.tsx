"use client";

import React, { useState } from "react";
import Link from "next/link";
import NoticeTable from "./NoticeTable";

interface Notice {
  id: string;
  title: string;
  date: string;
  fileUrl: string;
  category: string;
}

interface HomeNoticesSectionProps {
  notices: Notice[];
}

export default function HomeNoticesSection({ notices }: HomeNoticesSectionProps) {
  const [activeTab, setActiveTab] = useState("OTM");
  const tabs = ["OTM", "LTM", "Lottery Pending", "Lottery Result"];

  // Filter notices by category
  const filtered = notices.filter(
    (n) => n.category.toLowerCase() === activeTab.toLowerCase()
  );

  // Show only latest 10 notices
  const latestNotices = filtered.slice(0, 10);

  return (
    <section className="bg-shade-1/20 border-t border-b border-ac-2/50 py-12 lg:py-16">
      <div className="custom-container">
        {/* Section Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-text-1 uppercase font-primary">
            Our Notices
          </h2>
        </div>

        {/* Categories Tab selector */}
        <div className="flex justify-center mb-8 select-none">
          <div className="inline-flex flex-wrap justify-center gap-3 bg-white p-3 rounded-2xl border border-ac-2 shadow-sm">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 sm:px-8 sm:py-3 rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 uppercase tracking-wide cursor-pointer ${activeTab.toLowerCase() === tab.toLowerCase()
                  ? "bg-primary text-white shadow-lg scale-105"
                  : "bg-transparent text-text-2 hover:bg-shade-1"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Notices Table / Grid using shared NoticeTable */}
        <div className="mb-8">
          <NoticeTable notices={latestNotices} />
        </div>

        {/* View All Notice Button */}
        <div className="flex justify-center mt-10">
          <Link
            href="/egp-notice"
            className="contact_btn cursor-pointer relative inline-flex items-center justify-center px-10 py-4 overflow-hidden tracking-tighter text-white bg-primary rounded-tl-lg rounded-tr-lg rounded-bl-0 rounded-br-lg group transition-all duration-300 shadow-lg shadow-green-600/20 active:scale-95"
          >
            <span className="absolute bottom-0 left-0 right-0 h-0 transition-all duration-500 ease-out bg-text-1 group-hover:h-full"></span>
            <span className="relative text-base font-semibold text-white transition-colors duration-300 uppercase flex items-center gap-2">
              <span>View All Notice</span>
              <i className="fa-solid fa-arrow-right relative z-10 transition-colors duration-300"></i>
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
