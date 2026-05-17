"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import NoticeTable from "@/components/NoticeTable";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Assets
import NoticeHeroImage from "@/assets/img/contact/contact-theame-image.png";
import ContactBg from "@/assets/img/contact/contact-bg.png";

interface WinnerItem {
  id: string;
  no: string;
  title: string;
  date: string;
  fileUrl: string;
  category: string;
}

interface WinnerListClientProps {
  initialWinners: WinnerItem[];
}

export default function WinnerListClient({ initialWinners }: WinnerListClientProps) {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    
    let ctx = gsap.context(() => {
      // Hero Animations
      gsap.from(".breadcrumb .title, .breadcrumb .wrap, .contact_theame", {
        y: 50,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out"
      });

      // Content Animations
      const animateOnScroll = (selector: string, vars: gsap.TweenVars) => {
        const elements = gsap.utils.toArray(selector);
        elements.forEach((el: any) => {
          ScrollTrigger.create({
            trigger: el,
            start: "top 85%",
            onEnter: () => gsap.fromTo(el, vars.from || { opacity: 0, y: 50 }, { ...vars, opacity: 1, y: 0, x: 0 })
          });
        });
      };

      animateOnScroll(".single_notice", { duration: 1, ease: "power2.out" });

      setTimeout(() => {
        ScrollTrigger.refresh();
      }, 500);
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="notices_page_wrapper pb-20 bg-secondary">
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
                  <h2 className="title text-[32px] lg:text-[40px] font-medium font-primary text-[var(--secondary-color)] uppercase mb-2.5">
                    Winner Lists
                  </h2>
                  <div className="wrap inline-block bg-[var(--text-1)] px-6 py-1.5 lg:px-4 lg:py-1 rounded-[30px]">
                    <ul className="breadcrumb_item flex items-center justify-center gap-2.5">
                      <li>
                        <Link
                          href="/"
                          className="item flex justify-center items-center font-primary text-sm uppercase text-[var(--secondary-color)] cursor-pointer transition-all duration-300 hover:text-white"
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
                          WINNER LIST
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

      {/* Notice List */}
      <div className="single_notice mt-[60px]">
        <div className="custom-container">
          <NoticeTable notices={initialWinners} />
        </div>
      </div>
    </div>
  );
}
