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
  const [activeTab, setActiveTab] = useState("All");
  const tabs = ["All", "OTM", "LTM", "Lottery Pending", "Lottery Result"];

  const filteredNotices =
    activeTab === "All"
      ? initialNotices
      : initialNotices.filter((n) => n.category.toLowerCase() === activeTab.toLowerCase());

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
                  activeTab.toLowerCase() === tab.toLowerCase()
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
      <div className="table_section mb-20">
        <div className="custom-container">
          <NoticeTable notices={filteredNotices} />
        </div>
      </div>
    </div>
  );
}
