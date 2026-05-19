"use client";

import React, { useState } from "react";
import Link from "next/link";

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
  const [activeTab, setActiveTab] = useState("All");
  const tabs = ["All", "OTM", "LTM", "Lottery Pending", "Lottery Result"];

  // Filter notices by category
  const filtered = activeTab === "All"
    ? notices
    : notices.filter(n => n.category.toLowerCase() === activeTab.toLowerCase());

  // Show only latest 10 notices
  const latestNotices = filtered.slice(0, 10);

  return (
    <section className="bg-shade-1/20 border-t border-b border-ac-2/50 py-16">
      <div className="custom-container">
        {/* Section Header */}
        <div className="text-center mb-10">
          <h3 className="text-primary font-bold uppercase tracking-widest text-sm mb-2 font-primary">
            Tender Information
          </h3>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-text-1 uppercase font-primary">
            Browse Notices by Category
          </h2>
        </div>

        {/* Categories Tab selector */}
        <div className="flex justify-center mb-10 select-none">
          <div className="inline-flex flex-wrap justify-center gap-3 bg-white p-3 rounded-2xl border border-ac-2 shadow-sm">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 sm:px-8 sm:py-3 rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 uppercase tracking-wide cursor-pointer ${
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

        {/* Notices Table / Grid */}
        <div className="rounded-2xl border border-ac-2 shadow-sm bg-white overflow-hidden">
          {/* Desktop View: Standard Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-shade-1 border-b border-ac-2">
                  <th className="p-5 font-bold text-text-1 uppercase text-sm w-16">
                    #
                  </th>
                  <th className="p-5 font-bold text-text-1 uppercase text-sm">
                    Procuring Entity / Title
                  </th>
                  <th className="p-5 font-bold text-text-1 uppercase text-sm w-40 text-center">
                    Last Date
                  </th>
                  <th className="p-5 font-bold text-text-1 uppercase text-sm w-48 text-center">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {latestNotices.length > 0 ? (
                  latestNotices.map((notice, index) => (
                    <tr
                      key={notice.id}
                      className="border-b border-ac-2 hover:bg-slate-50 transition-colors single_notice"
                    >
                      <td className="p-5 text-text-2 font-bold">{index + 1}</td>
                      <td className="p-5">
                        <h4 className="text-text-1 font-semibold leading-tight mb-1 font-bangla text-base lg:text-lg">
                          {notice.title}
                        </h4>
                        <span className="text-[10px] text-primary font-bold uppercase tracking-wider bg-shade-1 px-2 py-0.5 rounded border border-primary/10">
                          {notice.category}
                        </span>
                      </td>
                      <td className="p-5 text-center">
                        <div className="inline-block bg-shade-1 px-3 py-1 rounded-full border border-primary/20 text-text-2 text-xs font-bold whitespace-nowrap">
                          {notice.date}
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/egp-notice/${notice.id}`}
                            className="bg-primary hover:!text-secondary !text-white px-5 py-2.5 rounded-lg font-bold text-xs uppercase hover:bg-text-1 transition shadow-sm flex items-center gap-2 cursor-pointer"
                          >
                            <i className="fa-solid fa-eye"></i> View
                          </Link>
                          {notice.fileUrl && (
                            <a
                              href={notice.fileUrl}
                              download
                              className="bg-text-1 !text-secondary px-4 py-2.5 rounded-lg font-bold text-xs uppercase hover:bg-primary transition shadow-sm flex items-center gap-2 cursor-pointer"
                            >
                              <i className="fa-solid fa-download"></i>
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="p-10 text-center text-text-2 font-medium italic"
                    >
                      No notices found in this category.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile View: Card Layout */}
          <div className="md:hidden divide-y divide-ac-2">
            {latestNotices.length > 0 ? (
              latestNotices.map((notice, index) => (
                <div
                  key={notice.id}
                  className="p-5 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                        {index + 1}
                      </span>
                      <span className="px-3 py-0.5 bg-shade-1 text-primary text-[10px] font-bold uppercase rounded-full border border-primary/10">
                        {notice.category}
                      </span>
                    </div>
                    <div className="text-[11px] text-text-2 font-bold uppercase flex items-center gap-1">
                      <i className="fa-solid fa-calendar-day text-primary"></i>
                      {notice.date}
                    </div>
                  </div>

                  <h4 className="text-text-1 font-bold leading-snug font-bangla text-base mb-5">
                    {notice.title}
                  </h4>

                  <div className="flex items-center gap-3">
                    <Link
                      href={`/egp-notice/${notice.id}`}
                      className="flex-1 bg-primary hover:bg-text-1 hover:!text-secondary !text-white py-3 rounded-xl font-bold text-[11px] uppercase flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all cursor-pointer"
                    >
                      <i className="fa-solid fa-eye"></i> View Detail
                    </Link>
                    {notice.fileUrl && (
                      <a
                        href={notice.fileUrl}
                        download
                        className="bg-text-1 !text-secondary hover:!text-black hover:bg-primary p-3 rounded-xl font-bold text-[11px] uppercase flex items-center justify-center aspect-square shadow-sm active:scale-95 transition-all cursor-pointer"
                      >
                        <i className="fa-solid fa-download"></i>
                      </a>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-10 text-center text-text-2 font-medium italic">
                No notices found in this category.
              </div>
            )}
          </div>
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
