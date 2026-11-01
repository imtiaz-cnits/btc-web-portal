"use client";

import React from "react";
import Link from "next/link";

interface Notice {
  id: string;
  title: string;
  date: string;
  filePath?: string;
  fileType?: string;
  content?: string;
}

interface HeroProps {
  tenderNotices?: Notice[];
  loading?: boolean;
  error?: string | null;
}

const Hero: React.FC<HeroProps> = () => {
  return (
    <div className="hero bg-secondary overflow-hidden pt-[20px] pb-[20px]">
      <div className="custom-container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center items-center gap-[10px] mb-[16px]">
            <span className="text-[12px] font-primary font-semibold text-text-1 bg-shade-1 px-[16px] py-[4px] rounded-[30px] uppercase tracking-wider">
              Welcome to
            </span>
          </div>

          <h1 className="text-[22px] md:text-[24px] lg:text-[26px] font-bold text-text-1 mb-[3px] uppercase font-primary leading-[1.15] tracking-tight">
            Building Technology &
            <span className="text-primary"> Consultant </span>
          </h1>
          <h1 className="text-[22px] md:text-[24px] lg:text-[26px] font-bold text-text-1 mb-[12px] uppercase font-primary leading-[1.15] tracking-tight">
            S. Alom EGP
            <span className="text-primary"> Tender & Consultant </span>
          </h1>

          <p className="text-[13.5px] md:text-[14px] text-text-2 font-secondary max-w-3xl mx-auto leading-[18px] text-center">
            We specialize in construction, building technology, and e-GP tender consulting, providing expert engineering solutions and bidding assistance for your projects.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Hero;

