"use client";

import React from "react";
import Image from "next/image";
import { useClientScroller } from "@/lib/hooks/use-gsap";

// Assets
import ClientLogo1 from "@/assets/img/home/client-logo1.png";
import ClientLogo2 from "@/assets/img/home/client-logo2.png";
import ClientLogo3 from "@/assets/img/home/client-logo3.png";
import ClientLogo4 from "@/assets/img/home/client-logo4.png";
import ClientLogo5 from "@/assets/img/home/client-logo5.png";
import ClientLogo6 from "@/assets/img/home/client-logo6.png";
import ClientLogo7 from "@/assets/img/home/client-logo7.png";
import ClientLogo8 from "@/assets/img/home/client-logo8.png";
import ClientLogo9 from "@/assets/img/home/client-logo9.png";
import ClientLogo10 from "@/assets/img/home/client-logo10.png";
import ClientLogo11 from "@/assets/img/home/client-logo11.png";
import ClientLogo12 from "@/assets/img/home/client-logo12.png";

const row1 = [
  ClientLogo1,
  ClientLogo2,
  ClientLogo3,
  ClientLogo4,
  ClientLogo5,
  ClientLogo6,
];
const row2 = [
  ClientLogo7,
  ClientLogo8,
  ClientLogo9,
  ClientLogo10,
  ClientLogo11,
  ClientLogo12,
];

const ClientSlider: React.FC = () => {
  const { scrollerRefs, handleMouseEnter, handleMouseLeave } =
    useClientScroller();

  return (
    <section className="client bg-secondary py-[40px] md:py-[80px] overflow-hidden">
      <div className="custom-container mx-auto px-4">
        <div className="theame_content text-center mb-[40px]">
          <div className="flex justify-center items-center gap-[10px] mb-[20px]">
            <h1 className="text-[16px] font-primary text-secondary bg-primary px-[20px] py-[5px] rounded-[30px] uppercase">
              OUR PRECIOUS CLIENTS
            </h1>
          </div>
          <h2 className="text-[38px] lg:text-[42px] font-bold text-text-1 mb-[20px] uppercase font-primary">
            Trusted by Industry Leaders
          </h2>
        </div>
      </div>
      <div className="box">
        {/* Row 1 - Left to Right */}
        <div
          className="logo_slider1 scroller max-w-full overflow-hidden"
          ref={(el) => {
            if (el) scrollerRefs.current[0] = el;
          }}
          onMouseEnter={() => handleMouseEnter(0)}
          onMouseLeave={() => handleMouseLeave(0)}
          data-speed="fast"
          data-direction="left"
        >
          <div className="logos_slide1 tag-list scroller__inner w-max flex flex-nowrap gap-[2.4rem] items-center py-[1rem]">
            {[...row1, ...row1].map((logo, index) => (
              <div key={index} className="logo flex-shrink-0">
                <Image
                  src={logo}
                  alt="Client Logo"
                  width={247}
                  height={110}
                  className="w-[247px] h-[110px] rounded-[12px] object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Row 2 - Right to Left */}
        <div
          className="logo_slider2 scroller max-w-full overflow-hidden mt-8"
          ref={(el) => {
            if (el) scrollerRefs.current[1] = el;
          }}
          onMouseEnter={() => handleMouseEnter(1)}
          onMouseLeave={() => handleMouseLeave(1)}
          data-speed="fast"
          data-direction="right"
        >
          <div className="logos_slide2 tag-list scroller__inner w-max flex flex-nowrap gap-[2.4rem] items-center py-[1rem]">
            {[...row2, ...row2].map((logo, index) => (
              <div key={index} className="logo flex-shrink-0">
                <Image
                  src={logo}
                  alt="Client Logo"
                  width={247}
                  height={110}
                  className="w-[247px] h-[110px] rounded-[12px] object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClientSlider;
