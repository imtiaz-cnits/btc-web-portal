"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { useCounter } from "@/lib/hooks/use-gsap";

// Assets
import AboutImage from "@/assets/img/home/about-image.png";

const AboutSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  // Counter targets
  const counters = [
    { id: "tenderer", target: 1000 },
    { id: "clients", target: 700 },
    { id: "projects", target: 200 },
  ];

  const { counterRefs } = useCounter(counters, sectionRef);

  return (
    <section className="about_section bg-secondary pt-20" ref={sectionRef}>
      <div className="custom-container mx-auto px-4">
        <div className="flex flex-wrap items-center">
          {/* Image & Counters Column */}
          <div className="w-full lg:w-1/2">
            <div className="img_counter flex justify-center items-center lg:pb-0 pb-[60px]">
              <div className="image_container relative lg:max-w-[80%] w-full aspect-square rounded-[24px] group transition-all duration-400 hover:scale-[1.02]">
                <Image
                  src={AboutImage}
                  alt="Building"
                  className="responsive_image w-full h-full rounded-[24px] object-cover"
                />

                <div className="counter_box1 absolute top-[110px] left-[10px] md:left-[-50px] bg-secondary text-center p-[10px] rounded-[16px] shadow-[0px_6px_10px_0px_rgba(0,0,0,0.1)] z-10">
                  <div className="item flex items-center justify-center">
                    <h2
                      className="counters text-[32px] font-primary text-text-1 font-medium m-0 leading-none"
                      ref={(el) => {
                        if (el) counterRefs.current["tenderer"] = el;
                      }}
                    >
                      0
                    </h2>
                    <span className="plus text-[32px] text-primary">+</span>
                  </div>
                  <p className="text-[16px] font-primary text-text-2 font-normal leading-[18px] whitespace-nowrap m-0">
                    Tenderer
                  </p>
                </div>

                <div className="counter_box2 absolute bottom-[160px] right-[10px] md:right-[-50px] bg-secondary text-center p-[10px] rounded-[16px] shadow-[0px_6px_10px_0px_rgba(0,0,0,0.1)] z-10">
                  <div className="item flex items-center justify-center">
                    <h2
                      className="counters text-[32px] font-primary text-text-1 font-medium m-0 leading-none"
                      ref={(el) => {
                        if (el) counterRefs.current["clients"] = el;
                      }}
                    >
                      0
                    </h2>
                    <span className="plus text-[32px] text-primary">+</span>
                  </div>
                  <p className="text-[16px] font-primary text-text-2 font-normal leading-[18px] whitespace-nowrap m-0">
                    Design Clients
                  </p>
                </div>

                <div className="counter_box3 absolute bottom-[10px] md:bottom-[-40px] left-1/2 transform -translate-x-1/2 bg-secondary text-center p-[10px] rounded-[16px] shadow-[0px_6px_10px_0px_rgba(0,0,0,0.1)] z-10">
                  <div className="item flex items-center justify-center">
                    <h2
                      className="counters text-[32px] font-primary text-text-1 font-medium m-0 leading-none"
                      ref={(el) => {
                        if (el) counterRefs.current["projects"] = el;
                      }}
                    >
                      0
                    </h2>
                    <span className="plus text-[32px] text-primary">+</span>
                  </div>
                  <p className="text-[16px] font-primary text-text-2 font-normal leading-[18px] whitespace-nowrap m-0">
                    Projects
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Text Content Column */}
          <div className="w-full lg:w-1/2">
            <div className="theame_content lg:mt-[0px] mt-[40px]">
              <div className="flex justify-center lg:justify-start items-center gap-[10px] mb-[20px]">
                <h1 className="text-base font-primary text-secondary bg-primary px-5 py-1.5 rounded-full uppercase">
                  ABOUT US
                </h1>
              </div>
              <h2 className="text-[38px] lg:text-[42px] text-center lg:text-left font-bold text-text-1 mb-[20px] uppercase font-primary">
                Precision, Quality, and Excellence in Every Project
              </h2>
              <p className="text-[16px] leading-[24px] font-medium text-text-2 font-secondary mb-[30px] text-center lg:text-left">
                We specialize in delivering top-tier construction services,
                including soil testing, architectural design, interior design,
                land surveys, and more. Our expert team is committed to ensuring
                the success of your projects with precision, creativity, and a
                focus on quality. We bring innovative solutions and reliable
                results to every step of the construction process, transforming
                your vision into reality.
              </p>
              <div className="flex justify-center lg:justify-start">
                <button className="bg-primary text-secondary px-[30px] py-[10px] rounded-tl-0 rounded-tr-[12px] rounded-bl-[12px] rounded-br-[12px] font-bold font-secondary relative overflow-hidden group transition-all duration-400">
                  <span className="relative z-[2]">READ MORE</span>
                  <span className="absolute bottom-0 left-0 w-full h-0 bg-text-1 transition-all duration-400 z-[1] group-hover:h-full"></span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
