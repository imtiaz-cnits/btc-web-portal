"use client";

import React from "react";
import Link from "next/link";

interface Notice {
  id: string;
  no: string;
  title: string;
  date: string;
  fileUrl: string;
  category: string;
}

interface NoticeTableProps {
  notices: Notice[];
}

const NoticeTable: React.FC<NoticeTableProps> = ({ notices }) => {
  return (
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
            {notices.length > 0 ? (
              notices.map((notice, index) => (
                <tr
                  key={notice.id}
                  className="border-b border-ac-2 hover:bg-slate-50 transition-colors single_notice"
                >
                  <td className="p-5 text-text-2 font-medium">{index + 1}</td>
                  <td className="p-5">
                    <h4 className="text-text-1 font-semibold leading-tight mb-1 font-bangla text-lg">
                      {notice.title}
                    </h4>
                    <span className="text-xs text-primary font-bold uppercase tracking-wider">
                      {notice.category}
                    </span>
                  </td>
                  <td className="p-5 text-center">
                    <div className="inline-block bg-shade-1 px-3 py-1 rounded-full border border-primary/20 text-text-2 text-sm font-bold">
                      {notice.date}
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        href={`/egp-notice/${notice.id}`}
                        className="bg-primary hover:!text-secondary text-white px-5 py-2 rounded-lg font-bold text-xs uppercase hover:bg-text-1 transition shadow-sm flex items-center gap-2"
                      >
                        <i className="fa-solid fa-eye "></i> View
                      </Link>
                      <a
                        href={notice.fileUrl}
                        download
                        className="bg-text-1 !text-secondary hover:!text-black px-4 py-2 rounded-lg font-bold text-xs uppercase hover:bg-primary transition shadow-sm flex items-center gap-2"
                      >
                        <i className="fa-solid fa-download "></i>
                      </a>
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
                  className="flex-1 bg-primary hover:bg-text-1 hover:!text-secondary  !text-text-1 py-3 rounded-xl font-bold text-[11px] uppercase flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all"
                >
                  <i className="fa-solid fa-eye"></i> View Detail
                </Link>
                <a
                  href={notice.fileUrl}
                  download
                  className="bg-text-1 !text-secondary hover:!text-black hover:bg-primary p-3 rounded-xl font-bold text-[11px] uppercase flex items-center justify-center aspect-square shadow-sm active:scale-95 transition-all"
                >
                  <i className="fa-solid fa-download"></i>
                </a>
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
