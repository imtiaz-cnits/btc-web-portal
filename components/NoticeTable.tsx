"use client";

import React from "react";
import Link from "next/link";

interface Notice {
  id: string;
  no?: string;
  title: string;
  publishDate?: string;
  date: string;
  lotteryDate?: string;
  fileUrl: string;
  category: string;
}

interface NoticeTableProps {
  notices: Notice[];
}

const NoticeTable: React.FC<NoticeTableProps> = ({ notices }) => {
  const isLotteryResult = notices.length > 0 && notices.some(n => 
    n.category === "Lottery Result" || 
    n.category === "Lottery Pending" || 
    (n.lotteryDate && n.lotteryDate.trim() !== "")
  );

  return (
    <div className="rounded-2xl border border-ac-2 shadow-sm bg-white overflow-hidden">
      {/* Desktop View: Standard Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-shade-1 border-b border-ac-2">
              <th className="py-3 px-4 font-bold text-text-1 uppercase text-sm w-16">
                #
              </th>
              <th className="py-3 px-4 font-bold text-text-1 uppercase text-sm">
                Procuring Entity / Title
              </th>
              <th className="py-3 px-4 font-bold text-text-1 uppercase text-sm w-40 text-center">
                Publish Date
              </th>
              <th className="py-3 px-4 font-bold text-text-1 uppercase text-sm w-40 text-center">
                Last Date
              </th>
              {isLotteryResult && (
                <th className="py-3 px-4 font-bold text-text-1 uppercase text-sm w-40 text-center">
                  Lottery Date
                </th>
              )}
              <th className="py-3 px-4 font-bold text-text-1 uppercase text-sm w-48 text-center">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {notices.length > 0 ? (
              notices.map((notice, index) => (
                <tr
                  key={notice.id}
                  className="border-b border-ac-2 hover:bg-slate-50 transition-colors single_notice"
                >
                  <td className="py-2.5 px-4 text-text-2 font-medium">{index + 1}</td>
                  <td className="py-2.5 px-4">
                    <h4 className="text-text-1 font-semibold leading-tight font-bangla text-base lg:text-lg">
                      {notice.title}
                    </h4>
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <div className="inline-block bg-shade-1 px-3 py-1 rounded-full border border-primary/20 text-text-2 text-sm font-bold">
                      {notice.publishDate || "N/A"}
                    </div>
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <div className="inline-block bg-shade-1 px-3 py-1 rounded-full border border-primary/20 text-text-2 text-sm font-bold">
                      {notice.date}
                    </div>
                  </td>
                  {isLotteryResult && (
                    <td className="py-2.5 px-4 text-center">
                      <div className="inline-block bg-shade-1 px-3 py-1 rounded-full border border-primary/20 text-emerald-600 text-sm font-bold bg-green-50/50">
                        {notice.lotteryDate || "N/A"}
                      </div>
                    </td>
                  )}
                  <td className="py-2.5 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        href={`/egp-notice/${notice.id}`}
                        className="bg-primary hover:!text-secondary !text-white px-4 py-1.5 rounded-lg font-bold text-xs uppercase hover:bg-text-1 transition shadow-sm flex items-center gap-2 cursor-pointer"
                      >
                        <i className="fa-solid fa-eye"></i> View
                      </Link>
                      {notice.fileUrl && (
                        <a
                          href={notice.fileUrl}
                          download
                          className="bg-text-1 !text-secondary px-3.5 py-1.5 rounded-lg font-bold text-xs uppercase hover:bg-primary transition shadow-sm flex items-center gap-2 cursor-pointer"
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
                  colSpan={isLotteryResult ? 6 : 5}
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
        {notices.length > 0 ? (
          notices.map((notice, index) => (
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
                <div className="flex flex-col items-end gap-1">
                  <div className="text-[11px] text-text-2 font-bold uppercase flex items-center gap-1">
                    <i className="fa-solid fa-calendar-plus text-primary text-xs"></i>
                    Pub: {notice.publishDate || "N/A"}
                  </div>
                  <div className="text-[11px] text-text-2 font-bold uppercase flex items-center gap-1">
                    <i className="fa-solid fa-calendar-day text-primary text-xs"></i>
                    Last: {notice.date}
                  </div>
                  {notice.lotteryDate && (
                    <div className="text-[11px] text-emerald-600 font-bold uppercase flex items-center gap-1">
                      <i className="fa-solid fa-calendar-check text-xs"></i>
                      Lottery: {notice.lotteryDate}
                    </div>
                  )}
                </div>
              </div>

              <h4 className="text-text-1 font-bold leading-snug font-bangla text-base mb-5">
                {notice.title}
              </h4>

              <div className="flex items-center gap-3">
                <Link
                  href={`/egp-notice/${notice.id}`}
                  className="flex-1 bg-primary hover:bg-text-1 hover:!text-secondary  !text-text-1 py-3 rounded-xl font-bold text-[11px] uppercase flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all cursor-pointer"
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
  );
};

export default NoticeTable;
