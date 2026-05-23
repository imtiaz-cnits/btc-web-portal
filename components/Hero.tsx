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
    <div className="hero bg-secondary overflow-hidden pt-[50px] lg:pt-[60px] pb-[50px] lg:pb-[60px]">
      <div className="custom-container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center items-center gap-[10px] mb-[25px]">
            <span className="text-[14px] md:text-[16px] font-primary font-semibold text-text-1 bg-shade-1 px-[24px] py-[8px] rounded-[30px] uppercase tracking-wider">
              Welcome to
            </span>
          </div>

          <h1 className="text-[28px] md:text-[40px] lg:text-[50px] font-bold text-text-1 mb-[10px] uppercase font-primary leading-tight tracking-tight">
            Building Technology &
            <span className="text-primary"> Consultant </span>
          </h1>
          <h1 className="text-[28px] md:text-[40px] lg:text-[50px] font-bold text-text-1 mb-[10px] uppercase font-primary leading-tight tracking-tight">
            S. Alom EGP
            <span className="text-primary"> Tender & Consultant </span>
          </h1>

          <p className="text-[16px] md:text-[18px] text-text-2 font-secondary max-w-3xl mx-auto leading-relaxed text-center">
            We are a premier construction, building technology, and e-GP tender consulting firm. We specialize in providing state-of-the-art engineering solutions, comprehensive tender bidding assistance, and high-quality consultant services to empower your projects.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Hero;

