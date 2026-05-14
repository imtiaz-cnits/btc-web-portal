"use client";

import React, { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useVerticalNotice } from "@/lib/hooks/use-gsap";

// Assets
import HeroImage from "@/assets/img/home/hero-img1.png";

interface Notice {
  id: string;
  title: string;
  date: string;
  filePath?: string;
  fileType?: string;
  content?: string;
}

interface HeroProps {
  tenderNotices: Notice[];
  winnerNotices: Notice[];
  loading?: boolean;
  error?: string | null;
}

const Hero: React.FC<HeroProps> = ({
  tenderNotices,
  winnerNotices,
  loading,
  error,
}) => {
  const {
    noticeRef: tenderNoticeRef,
    handleMouseEnter: tenderMouseEnter,
    handleMouseLeave: tenderMouseLeave,
  } = useVerticalNotice(tenderNotices);

  const {
    noticeRef: winnerNoticeRef,
    handleMouseEnter: winnerMouseEnter,
    handleMouseLeave: winnerMouseLeave,
  } = useVerticalNotice(winnerNotices);

  const handleViewFile = (notice: Notice, type: "tender" | "winner") => {
    if (notice.filePath) {
      window.open(`https://egpbtc.com${notice.filePath}`, "_blank");
    } else {
      window.open(
        `/${type === "tender" ? "egp-notice" : "winner-list"}/${notice.id}`,
        "_blank",
      );
    }
  };

  return (
    <div className="hero bg-secondary overflow-hidden pt-[60px]">
      <div className="custom-container mx-auto">
        <div className="flex flex-wrap">
          <div className="w-full lg:w-1/2">
            <div className="theame">
              <div className="flex justify-center lg:justify-start items-center gap-[10px] mb-[20px]">
                <h1 className="text-[16px] font-primary text-text-1 bg-shade-1 px-[20px] py-[5px] rounded-[30px]">
                  Your Safe Innovation
                </h1>
              </div>
              <h1 className="text-[38px] lg:text-[52px] text-center lg:text-left font-bold text-text-1 mb-[20px] uppercase font-primary">
                Welcome to the
                <span className="text-primary"> Building Technology </span>&
                Consultant
                <span className="text-primary"> !!!</span>
              </h1>
              <div className="lg:w-[92%] w-[100%] overflow-hidden rounded-[24px_0px_24px_24px]">
                <Image
                  src={HeroImage}
                  alt="Hero Image"
                  className="w-full h-auto object-cover"
                  priority
                />
              </div>
            </div>
          </div>
          <div className="w-full lg:w-1/2 overflow-hidden mt-[40px] lg:mt-[0px]">
            {/* EGP Tender Notices */}
            <div
              className="tender-notice-board w-full bg-secondary border border-ac-1 rounded-3xl overflow-hidden p-0 h-[350px] flex flex-col"
              onMouseEnter={tenderMouseEnter}
              onMouseLeave={tenderMouseLeave}
            >
              <h3 className="header bg-primary text-white font-primary text-center py-2.5 px-4 text-[22px] font-medium mb-0">
                EGP TENDER NOTICES
              </h3>
              <div className="notice_item h-[calc(350px-80px)] overflow-y-hidden">
                {loading ? (
                  <div className="flex justify-center items-center h-full">
                    <p className="text-text-2 text-base">Loading notices...</p>
                  </div>
                ) : error ? (
                  <div className="flex justify-center items-center h-full">
                    <p className="text-text-2 text-base">{error}</p>
                  </div>
                ) : tenderNotices.length === 0 ? (
                  <div className="flex justify-center items-center h-full">
                    <p className="text-text-2 text-base">
                      No tender notices available.
                    </p>
                  </div>
                ) : (
                  <ul
                    className="tender-notices relative p-0 m-0 list-none"
                    ref={tenderNoticeRef}
                  >
                    {tenderNotices.map((notice) => (
                      <li
                        key={notice.id}
                        className="notice flex items-center border-b border-ac-1 py-4 mx-5"
                      >
                        <div className="date service-icon-box !w-[52px] !h-[52px] !p-0 mr-[20px]  shrink-0">
                          <div className="day absolute top-[-10px] left-[20px] text-center text-white font-primary font-medium text-[24px] z-[2]">
                            {notice.date.split(" ")[0]}
                          </div>
                          <div className="month absolute top-[18px] left-[10px] font-medium font-secondary text-center text-white text-[12px] z-[2] uppercase w-full">
                            {notice.date.split(" ")[1]}
                          </div>
                        </div>
                        <div
                          className="content leading-[18px] flex-1 cursor-pointer"
                          onClick={() => handleViewFile(notice, "tender")}
                        >
                          <span className="text-text-2 text-base font-secondary font-medium transition duration-300 hover:text-primary hover:underline line-clamp-2">
                            {notice.title}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="button text-center py-3 bg-secondary">
                <Link
                  href="/egp-notice"
                  className="view_note_btn cursor-pointer relative inline-flex items-center justify-center px-8 py-2.5 overflow-hidden tracking-tighter text-white bg-primary rounded-tl-0 rounded-tr-lg rounded-bl-lg rounded-br-lg group transition-all duration-400"
                >
                  <span className="absolute bottom-0 left-0 right-0 h-0 transition-all duration-500 ease-out bg-text-1 group-hover:h-full"></span>
                  <span className="relative text-white font-semibold font-secondary">
                    VIEW ALL NOTICE
                  </span>
                </Link>
              </div>
            </div>

            {/* Winner List */}
            <div
              className="winner-notice-board w-full bg-secondary border border-ac-1 rounded-3xl overflow-hidden p-0 mt-3 h-[350px] flex flex-col"
              onMouseEnter={winnerMouseEnter}
              onMouseLeave={winnerMouseLeave}
            >
              <h3 className="header bg-primary text-white font-primary text-center py-2.5 px-4 text-[22px] font-medium mb-0">
                WINNER LIST
              </h3>
              <div className="notice_item h-[calc(350px-80px)] overflow-y-hidden">
                {loading ? (
                  <div className="flex justify-center items-center h-full">
                    <p className="text-text-2 text-base">Loading winners...</p>
                  </div>
                ) : error ? (
                  <div className="flex justify-center items-center h-full">
                    <p className="text-text-2 text-base">{error}</p>
                  </div>
                ) : winnerNotices.length === 0 ? (
                  <div className="flex justify-center items-center h-full">
                    <p className="text-text-2 text-base">
                      No winners available.
                    </p>
                  </div>
                ) : (
                  <ul
                    className="winner-notices relative p-0 m-0 list-none"
                    ref={winnerNoticeRef}
                  >
                    {winnerNotices.map((winner) => (
                      <li
                        key={winner.id}
                        className="notice flex items-center border-b border-ac-1 py-4 mx-5"
                      >
                        <div className="date service-icon-box !w-[52px] !h-[52px] !p-0 mr-[20px]  shrink-0">
                          <div className="day absolute top-[-10px] left-[20px] text-center text-white font-primary font-medium text-[24px] z-[2]">
                            {winner.date.split(" ")[0]}
                          </div>
                          <div className="month absolute top-[18px] left-[10px] font-medium font-secondary text-center text-white text-[12px] z-[2] uppercase w-full">
                            {winner.date.split(" ")[1]}
                          </div>
                        </div>
                        <div
                          className="content leading-[18px] flex-1 cursor-pointer"
                          onClick={() => handleViewFile(winner, "winner")}
                        >
                          <span className="text-text-2 text-base font-secondary font-medium transition duration-300 hover:text-primary hover:underline line-clamp-2">
                            {winner.title}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="button text-center py-3 bg-secondary">
                <Link
                  href="/winner-list"
                  className="view_note_btn cursor-pointer relative inline-flex items-center justify-center px-8 py-2.5 overflow-hidden tracking-tighter text-white bg-primary rounded-tl-0 rounded-tr-lg rounded-bl-lg rounded-br-lg group transition-all duration-400"
                >
                  <span className="absolute bottom-0 left-0 right-0 h-0 transition-all duration-500 ease-out bg-text-1 group-hover:h-full"></span>
                  <span className="relative text-white font-semibold font-secondary">
                    VIEW ALL WINNERS
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
