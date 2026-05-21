"use client";

import React, { useState, useEffect } from "react";
import NoticeTable from "@/components/NoticeTable";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface NoticeItem {
  id: string;
  no: string;
  title: string;
  date: string;
  fileUrl: string;
  category: string;
}

interface EgpNoticeClientProps {
  initialNotices: NoticeItem[];
}

export default function EgpNoticeClient({ initialNotices }: EgpNoticeClientProps) {
  const [activeTab, setActiveTab] = useState("OTM");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const tabs = ["OTM", "LTM", "Lottery Pending", "Lottery Result"];

  const filteredNotices = initialNotices.filter(
    (n) => n.category.toLowerCase() === activeTab.toLowerCase()
  );

  // Reset page when tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const totalPages = Math.ceil(filteredNotices.length / itemsPerPage);
  const paginatedNotices = filteredNotices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
      <div className="tab_section mt-10 mb-6">
        <div className="custom-container text-center">
          <div className="text-center mb-8">
            <h3 className="text-primary font-bold uppercase tracking-widest text-sm mb-2">
              Tender Information
            </h3>
            <h2 className="text-3xl lg:text-4xl font-bold text-text-1 uppercase">
              Browse Notices
            </h2>
          </div>

          <div className="inline-flex flex-wrap justify-center gap-3 bg-white p-3 rounded-2xl border border-ac-2 shadow-sm">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-3 rounded-xl font-bold text-sm transition-all duration-300 uppercase tracking-wide ${activeTab.toLowerCase() === tab.toLowerCase()
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
      <div className="table_section mb-6">
        <div className="custom-container">
          <NoticeTable notices={paginatedNotices} />
        </div>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mb-12">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="w-10 h-10 rounded-xl bg-white border border-ac-2 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i className="fa-solid fa-chevron-left"></i>
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${currentPage === page
                  ? "bg-primary text-white shadow-lg"
                  : "bg-white border border-ac-2 text-slate-600 hover:bg-slate-50"
                }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="w-10 h-10 rounded-xl bg-white border border-ac-2 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i className="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      )}
    </div>
  );
}
