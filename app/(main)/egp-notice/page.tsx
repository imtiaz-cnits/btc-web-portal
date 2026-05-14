"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import NoticeTable from "@/components/NoticeTable";

// Assets
import NoticeHeroImage from "@/assets/img/contact/contact-theame-image.png";
import ContactBg from "@/assets/img/contact/contact-bg.png";

const EgpNoticePage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("All");
  const noticesPerPage = 10;

  // Mock data (will be replaced by TinaCMS later)
  const notices = [
    {
      _id: "1",
      title:
        "Local Government Engineering Department (LGED) - Road Construction at Pabna Sadar",
      publishDate: "2024-05-10T10:00:00Z",
      lastDate: "2024-05-25T17:00:00Z",
      createdAt: "2024-05-10T09:00:00Z",
      category: "OTM",
      filePath: "/sample.pdf",
    },
    {
      _id: "2",
      title:
        "Public Works Department (PWD) - Building Renovation Project Phase 1",
      publishDate: "2024-05-12T11:00:00Z",
      lastDate: "2024-05-30T16:00:00Z",
      createdAt: "2024-05-12T10:00:00Z",
      category: "LTM",
      filePath: "/sample.pdf",
    },
    {
      _id: "3",
      title: "Water Development Board - Embankment Repair Works at Ishwardi",
      publishDate: "2024-05-14T09:00:00Z",
      lastDate: "2024-06-05T15:00:00Z",
      createdAt: "2024-05-14T08:30:00Z",
      category: "LOTTERY",
      filePath: "/sample.pdf",
    },
  ];

  const filteredNotices =
    activeTab === "All"
      ? notices
      : notices.filter((n) => n.category === activeTab);

  const handleViewFile = (
    filePath?: string,
    fileType?: string,
    id?: string,
    content?: string,
  ) => {
    if (filePath) {
      window.open(filePath, "_blank");
    } else if (id) {
      window.open(`/view-egp-notice/${id}`, "_blank");
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  return (
    <div className="notices_page_wrapper pb-20">
      {/* Contact Start (Hero) */}
      <div className="contact_us bg-[var(--secondary-color)] text-center pt-5 overflow-hidden">
        <div className="custom-container">
          <div className="flex gap-4 flex-col lg:flex-row">
            <div className="w-full lg:w-1/2 flex items-stretch">
              <div
                className="breadcrumb flex flex-col justify-center w-full rounded-[24px_0px_24px_24px] p-6 m-0 bg-no-repeat bg-center bg-cover relative overflow-hidden"
                style={{ backgroundColor: "var(--primary-color)" }}
              >
                <div
                  className="absolute inset-0 opacity-20 pointer-events-none bg-center bg-no-repeat bg-cover"
                  style={{ backgroundImage: `url(${ContactBg.src})` }}
                ></div>
                <div className="wrapper inline-block relative z-10">
                  <h2 className="title text-[48px] lg:text-[32px] font-medium font-primary text-[var(--secondary-color)] uppercase mb-2.5">
                    EGP Notices
                  </h2>
                  <div className="wrap inline-block bg-[var(--text-1)] px-6 py-1.5 lg:px-4 lg:py-1 rounded-[30px]">
                    <ul className="breadcrumb_item flex items-center justify-center gap-2.5">
                      <li>
                        <Link
                          href="/"
                          className="item flex justify-center items-center font-primary text-sm uppercase text-[var(--secondary-color)] cursor-pointer transition-all duration-300"
                        >
                          HOME
                        </Link>
                      </li>
                      <li>
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="var(--primary-color)"
                          strokeWidth="3"
                        >
                          <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                      </li>
                      <li>
                        <span className="item flex justify-center items-center font-primary text-sm uppercase text-[var(--secondary-color)]">
                          NOTICES
                        </span>
                      </li>
                      <li>
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="var(--primary-color)"
                          strokeWidth="3"
                        >
                          <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                      </li>
                      <li>
                        <span className="active_item item flex justify-center items-center font-primary text-sm uppercase text-[var(--secondary-color)] cursor-pointer">
                          EGP NOTICES
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full lg:w-1/2 flex items-stretch mt-5 lg:mt-0">
              <div className="contact_theame w-full rounded-[24px_25px_24px_0px] overflow-hidden relative min-h-[300px]">
                <Image
                  src={NoticeHeroImage}
                  alt="Notice Hero"
                  fill
                  className="w-full h-full object-cover bg-center bg-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs mt-12 lg:mt-16">
        <div className="custom-container pt-2">
          <div className="flex justify-center space-x-6">
            {["All", "LTM", "OTM", "LOTTERY"].map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`px-6 py-2 rounded-md font-medium transition-colors duration-300 ${
                  activeTab === tab
                    ? "bg-[var(--primary-color)] text-[var(--secondary-color)]"
                    : "bg-[var(--shade-1)] text-[var(--text-1)] hover:bg-[var(--primary-color)] hover:text-[var(--secondary-color)]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notice List */}
      <div className="single_notice mt-[60px]">
        <div className="custom-container">
          <NoticeTable
            notices={filteredNotices}
            loading={false}
            error={null}
            currentPage={currentPage}
            noticesPerPage={noticesPerPage}
            handlePageChange={setCurrentPage}
            handleViewFile={handleViewFile}
            noticeType="EGP Notice"
          />
        </div>
      </div>
    </div>
  );
};

export default EgpNoticePage;
