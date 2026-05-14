"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Assets
import AboutHeroImage from "@/assets/img/about/about-theame-img.png";
import VisionImage1 from "@/assets/img/about/vission1.png";
import VisionImage2 from "@/assets/img/about/vission2.png";
import MissionImage1 from "@/assets/img/about/mission1.png";
import MissionImage2 from "@/assets/img/about/mission2.png";
import TeamImage1 from "@/assets/img/about/team1.png";
import TeamImage2 from "@/assets/img/about/team2.png";
import GalleryImage1 from "@/assets/img/about/gallery1.png";
import GalleryImage2 from "@/assets/img/about/gallery2.png";
import GalleryImage3 from "@/assets/img/about/gallery3.png";
import GalleryImage4 from "@/assets/img/about/gallery4.png";
import ContactBg from "@/assets/img/about/contact-bg.png";

const AboutPage: React.FC = () => {
  const counterStatsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    let triggers: ScrollTrigger[] = [];

    const counterNumbers = counterStatsRef.current?.querySelectorAll(".nmbr");
    if (counterNumbers && counterNumbers.length > 0) {
      counterNumbers.forEach((counter) => {
        const target = parseInt(counter.getAttribute("data-target") || "0");
        const trigger = ScrollTrigger.create({
          trigger: counterStatsRef.current,
          start: "top 80%",
          toggleActions: "play none none none",
          onEnter: () => {
            gsap.fromTo(
              counter,
              { innerText: 0 },
              {
                innerText: target,
                duration: 2,
                ease: "power1.out",
                snap: { innerText: 1 },
                onUpdate: function () {
                  counter.textContent = Math.floor(
                    parseFloat(this.targets()[0].innerText),
                  ).toString();
                },
              },
            );
          },
        });
        triggers.push(trigger);
      });
    }

    return () => {
      triggers.forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <div className="about_page_wrapper overflow-hidden pb-20">
      {/* About Start */}
      <div className="about_us bg-[var(--secondary-color)] text-center pt-5 overflow-hidden">
        <div className="custom-container">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="w-full flex g-2 items-stretch">
              <div className="wrapper w-full">
                <div
                  className="breadcrumb flex flex-col justify-center w-full rounded-[24px_0px_24px_24px] p-[50px_24px] m-0 bg-no-repeat bg-right relative overflow-hidden"
                  style={{ backgroundColor: "var(--primary-color)" }}
                >
                  <div
                    className="absolute inset-0 opacity-20 pointer-events-none bg-right bg-no-repeat"
                    style={{
                      backgroundImage: `url(${ContactBg.src})`,
                      backgroundSize: "contain",
                    }}
                  ></div>
                  <div className="wrapper w-full h-full relative z-10">
                    <h2 className="title text-[38px] font-bold font-primary text-[var(--secondary-color)] mb-[10px] uppercase">
                      ABOUT US
                    </h2>
                    <div className="wrap inline-block bg-[var(--text-1)] px-6 py-1.5 rounded-full">
                      <ul className="breadcrumb_item flex items-center justify-center gap-2.5">
                        <li>
                          <Link
                            href="/"
                            className="item flex justify-center items-center font-primary text-[14px] font-normal uppercase !text-secondary transition-all duration-300 cursor-pointer"
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
                          <span className="active_item item flex justify-center items-center font-primary text-[14px] font-normal uppercase text-[var(--secondary-color)] cursor-pointer">
                            ABOUT US
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <h3 className="des text-[18px] font-primary font-medium text-[var(--text-2)] m-0 pt-5 text-left">
                  Utilizing advanced construction tools, equipment, and
                  techniques for efficiency and innovation.
                </h3>
              </div>
            </div>
            <div className="w-full flex items-stretch">
              <div className="contact_theame w-full rounded-[24px_25px_24px_0px] overflow-hidden mt-5 lg:mt-0 relative min-h-[300px]">
                <Image
                  src={AboutHeroImage}
                  alt="About Hero"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* About End */}

      {/* Project Overview Start */}
      <div className="project_overview mt-[80px]">
        <div className="custom-container">
          <div className="count_container">
            <div className="flex flex-col lg:flex-row gap-4 items-start">
              <div className="w-full lg:w-1/2">
                <div
                  ref={counterStatsRef}
                  className="stats grid grid-cols-2 gap-5 max-w-full"
                >
                  <div className="stats_item flex flex-col items-center justify-center bg-[var(--secondary-color)] py-6 px-2 rounded-md text-center shadow-md">
                    <h2 className="count flex items-center gap-1 text-[48px] font-primary font-bold">
                      <span
                        className="nmbr font-primary text-[var(--text-1)]"
                        data-target="1000"
                      >
                        0
                      </span>
                      <span className="suffix text-[var(--primary-color)]">
                        +
                      </span>
                    </h2>
                    <p className="counter_title !text-[var(--text-2)] text-[16px] font-[var(--secondary-font)] uppercase">
                      Total Tenders
                    </p>
                  </div>
                  <div className="stats_item flex flex-col items-center justify-center bg-[var(--secondary-color)] py-5 rounded-md text-center shadow-md">
                    <h2 className="count flex items-center gap-1 text-[48px] font-primary font-bold">
                      <span
                        className="nmbr font-primary text-[var(--text-1)]"
                        data-target="700"
                      >
                        0
                      </span>
                      <span className="suffix text-[var(--primary-color)]">
                        +
                      </span>
                    </h2>
                    <p className="counter_title text-sm !text-[var(--text-2)] font-[var(--secondary-font)] uppercase">
                      Design Clients
                    </p>
                  </div>
                  <div className="stats_item flex flex-col items-center justify-center bg-[var(--secondary-color)] py-5 rounded-md text-center shadow-md">
                    <h2 className="count flex items-center gap-1 text-[48px] font-primary font-bold">
                      <span
                        className="nmbr font-primary text-[var(--text-1)]"
                        data-target="98"
                      >
                        0
                      </span>
                      <span className="suffix text-[var(--primary-color)] percent text-[30px] font-bold">
                        %
                      </span>
                    </h2>
                    <p className="counter_title text-sm !text-[var(--text-2)] font-[var(--secondary-font)] uppercase">
                      Success Rate
                    </p>
                  </div>
                  <div className="stats_item flex flex-col items-center justify-center bg-[var(--secondary-color)] py-5 rounded-md text-center shadow-md">
                    <h2 className="count flex items-center gap-1 text-[48px] font-primary font-bold">
                      <span
                        className="nmbr font-primary text-[var(--text-1)]"
                        data-target="200"
                      >
                        0
                      </span>
                      <span className="suffix text-[var(--primary-color)]">
                        +
                      </span>
                    </h2>
                    <p className="counter_title text-sm !text-[var(--text-2)] font-[var(--secondary-font)] uppercase">
                      Projects
                    </p>
                  </div>
                </div>
              </div>

              <div className="w-full lg:w-1/2 mt-12 lg:mt-0">
                <div className="overview_details">
                  <div className="heading_wrap">
                    <h2 className="title text-[38px] font-semibold text-[var(--text-1)] font-primary uppercase text-left leading-tight">
                      Precision, Quality, and Excellence in Every Project
                    </h2>
                    <p className="paragraph text-base w-full leading-relaxed font-[500] !text-left mt-5 !text-[var(--text-2)] font-[var(--secondary-font)]">
                      We specialize in delivering top-tier construction
                      services, including soil testing, architectural design,
                      interior design, land surveys, and more. Our expert team
                      is committed to ensuring the success of your projects with
                      precision, creativity, and a focus on quality. We bring
                      innovative solutions and reliable results to every step of
                      the construction process, transforming your vision into
                      reality.
                    </p>
                  </div>
                  <h3 className="sub_heading inline-block text-lg font-semibold text-[var(--text-1)] font-primary uppercase border-b-4 border-[var(--primary-color)] pt-[20px]">
                    Who We Are
                  </h3>
                  <p className="paragraph text-base max-w-[590px] leading-relaxed font-medium !text-left mt-2 !text-[var(--text-2)] font-[var(--secondary-font)]">
                    Founded on the principles of integrity, reliability, and
                    excellence, BTC has grown into a trusted name in the
                    construction field. Our team of skilled professionals brings
                    together expertise and passion to deliver projects that
                    stand the test of time.
                  </p>
                  <h3 className="sub_heading inline-block text-lg font-semibold text-[var(--text-1)] font-primary uppercase border-b-4 border-[var(--primary-color)] pt-[20px]">
                    What We Do
                  </h3>
                  <p className="paragraph text-base max-w-[590px] leading-relaxed font-medium !text-left mt-2 !text-[var(--text-2)] font-[var(--secondary-font)]">
                    From residential homes to commercial buildings and
                    industrial facilities, we specialize in comprehensive
                    construction services tailored to your needs. Whether it’s a
                    new build, renovation, or expansion, we ensure every detail
                    is executed to perfection.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Project Overview End */}

      {/* Our Mission Start */}
      <div className="our_mission mt-[80px] overflow-hidden">
        <div className="custom-container">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="w-full">
              <div className="heading_wrap">
                <span className="tag text-sm font-medium font-primary text-[var(--secondary-color)] bg-[var(--primary-color)] px-5 py-2 rounded-full uppercase">
                  OUR VISION
                </span>
                <h2 className="title text-[38px] font-medium text-left font-primary text-[var(--text-1)] uppercase pt-5 leading-tight">
                  Shaping the Future, One Structure at a Time
                </h2>
                <p className="paragraph text-base max-w-[590px] leading-relaxed font-medium !text-left mt-5 text-[var(--text-2)] font-[var(--secondary-font)]">
                  To be a leader in the construction industry, recognized for
                  innovation, sustainability, and unparalleled quality. We
                  strive to shape a future where every project we undertake
                  contributes to building stronger communities and lasting
                  legacies.
                </p>

                <div className="button mt-7">
                  <Link
                    href="/#services"
                    className="service_btn bg-[var(--primary-color)] relative inline-block py-[10px] px-[30px] rounded-tl-none rounded-tr-[12px] rounded-br-[12px] rounded-bl-[12px] border-none cursor-pointer overflow-hidden z-[1] group transition-all duration-500"
                  >
                    <span className="text-[var(--secondary-color)] transition-all duration-400 font-[var(--secondary-font)] text-[16px] font-semibold uppercase relative z-10 group-hover:text-white">
                      VIEW OUR SERVICES
                    </span>
                    <span className="absolute bottom-0 left-0 w-full h-0 rounded-tl-[6px] rounded-tr-[6px] bg-[var(--text-1)] transition-all duration-400 -z-[1] group-hover:h-full group-hover:rounded-tl-none"></span>
                  </Link>
                </div>
              </div>
            </div>
            <div className="w-full mt-[30px] lg:mt-[0px]">
              <div className="images1 relative w-[70%] aspect-square float-right">
                <div className="large w-full h-full relative rounded-bl-2xl rounded-br-2xl rounded-tr-2xl overflow-hidden shadow-2xl">
                  <Image
                    src={VisionImage1}
                    alt="Vision 1"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="small absolute top-5 left-[-102px] md:left-[-132px] w-[200px] aspect-[16/12] rounded-bl-lg rounded-br-lg rounded-tr-lg overflow-hidden border-[3px] border-[var(--secondary-color)] shadow-xl">
                  <Image
                    src={VisionImage2}
                    alt="Vision 2"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse lg:flex-row gap-4 items-center mt-[80px]">
            <div className="w-full mt-[30px] lg:mt-[0px]">
              <div className="images2 relative w-[70%] aspect-square">
                <div className="large w-full h-full relative rounded-tl-2xl rounded-bl-2xl rounded-br-2xl overflow-hidden shadow-2xl">
                  <Image
                    src={MissionImage1}
                    alt="Mission 1"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="small absolute top-5 right-[-102px] md:right-[-132px] w-[200px] aspect-[16/12] rounded-tr-lg rounded-bl-lg rounded-br-lg overflow-hidden border-[3px] border-[var(--secondary-color)] shadow-xl">
                  <Image
                    src={MissionImage2}
                    alt="Mission 2"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
            <div className="order-md-2 w-full">
              <div className="heading_wrap heading_wrap2">
                <span className="tag text-sm font-medium font-primary text-[var(--secondary-color)] bg-[var(--primary-color)] px-5 py-2 rounded-full uppercase">
                  OUR MISSION
                </span>
                <h2 className="title text-[38px] font-medium text-left font-primary text-[var(--text-1)] uppercase pt-5 leading-tight">
                  Building a Legacy of Excellence, One Project at a Time
                </h2>
                <p className="paragraph text-base max-w-[590px] leading-relaxed font-medium !text-left mt-5 text-[var(--text-2)] font-[var(--secondary-font)]">
                  Our mission is to build not just structures, but
                  relationships. We aim to exceed expectations by delivering
                  projects on time, within budget, and to the highest standards
                  of quality. We believe in transparency and collaboration.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Our Mission End */}

      {/* Team Start */}
      <div className="team py-20 mt-[80px] bg-[var(--shade-1)] text-center">
        <div className="custom-container">
          <div className="heading_wrap">
            <span className="tag text-sm font-medium font-primary text-[var(--secondary-color)] bg-[var(--primary-color)] px-5 py-2 rounded-full uppercase">
              OUR PROFESSIONALS
            </span>
            <h2 className="title text-[38px] font-medium font-primary text-[var(--text-1)] uppercase pt-[20px] leading-tight">
              Meet Our Leadership
            </h2>
            <p className="paragraph text-base max-w-[590px] leading-relaxed font-medium mx-auto mt-7 text-[var(--text-2)] font-[var(--secondary-font)]">
              Our skilled team combines expertise and passion to deliver
              exceptional results, building trust and lasting relationships
              every step of the way.
            </p>
          </div>
          <div className="row grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mt-10 max-w-[800px] mx-auto">
            <div className="team_card_wrapper group">
              <div className="card_img relative aspect-square rounded-2xl overflow-hidden shadow-lg">
                <Image
                  src={TeamImage1}
                  alt="Engr. Md. Shah Alom"
                  fill
                  className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-[1.05] group-hover:rotate-1"
                />
                <div className="social absolute bottom-[-60px] left-1/2 transform -translate-x-1/2 flex items-center gap-2 transition-all duration-500 ease-in-out group-hover:bottom-5 z-20">
                  <a
                    href="#"
                    className="relative w-10 h-10 rounded-full bg-[var(--secondary-color)] flex justify-center items-center text-lg text-[var(--text-1)] after:content-[''] after:absolute after:w-0 after:h-0 after:rounded-full after:bg-[var(--primary-color)] after:transition-all after:duration-300 hover:text-[var(--secondary-color)] hover:after:w-10 hover:after:h-10 after:z-[1] z-20"
                  >
                    <i className="fa-brands fa-facebook-f z-30 relative"></i>
                  </a>
                  <a
                    href="#"
                    className="relative w-10 h-10 rounded-full bg-[var(--secondary-color)] flex justify-center items-center text-lg text-[var(--text-1)] after:content-[''] after:absolute after:w-0 after:h-0 after:rounded-full after:bg-[var(--primary-color)] after:transition-all after:duration-300 hover:text-[var(--secondary-color)] hover:after:w-10 hover:after:h-10 after:z-[1] z-20"
                  >
                    <i className="fa-brands fa-instagram z-30 relative"></i>
                  </a>
                  <a
                    href="#"
                    className="relative w-10 h-10 rounded-full bg-[var(--secondary-color)] flex justify-center items-center text-lg text-[var(--text-1)] after:content-[''] after:absolute after:w-0 after:h-0 after:rounded-full after:bg-[var(--primary-color)] after:transition-all after:duration-300 hover:text-[var(--secondary-color)] hover:after:w-10 hover:after:h-10 after:z-[1] z-20"
                  >
                    <i className="fa-brands fa-x-twitter z-30 relative"></i>
                  </a>
                  <a
                    href="#"
                    className="relative w-10 h-10 rounded-full bg-[var(--secondary-color)] flex justify-center items-center text-lg text-[var(--text-1)] after:content-[''] after:absolute after:w-0 after:h-0 after:rounded-full after:bg-[var(--primary-color)] after:transition-all after:duration-300 hover:text-[var(--secondary-color)] hover:after:w-10 hover:after:h-10 after:z-[1] z-20"
                  >
                    <i className="fa-brands fa-linkedin-in z-30 relative"></i>
                  </a>
                </div>
              </div>
              <div className="details mt-4">
                <h3 className="name text-[26px] font-medium font-primary text-[var(--text-1)] text-center uppercase">
                  Engr. Md. Shah Alom (Abir)
                </h3>
                <h4 className="profession text-[18px] font-semibold text-[var(--primary-color)] text-center mt-1 uppercase">
                  Managing Director
                </h4>
              </div>
            </div>
            <div className="team_card_wrapper group">
              <div className="card_img relative aspect-square rounded-2xl overflow-hidden shadow-lg">
                <Image
                  src={TeamImage2}
                  alt="MD. Imran Hossain"
                  fill
                  className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-[1.05] group-hover:rotate-1"
                />
                <div className="social absolute bottom-[-60px] left-1/2 transform -translate-x-1/2 flex items-center gap-2 transition-all duration-500 ease-in-out group-hover:bottom-5 z-20">
                  <a
                    href="#"
                    className="relative w-10 h-10 rounded-full bg-[var(--secondary-color)] flex justify-center items-center text-lg text-[var(--text-1)] after:content-[''] after:absolute after:w-0 after:h-0 after:rounded-full after:bg-[var(--primary-color)] after:transition-all after:duration-300 hover:text-[var(--secondary-color)] hover:after:w-10 hover:after:h-10 after:z-[1] z-20"
                  >
                    <i className="fa-brands fa-facebook-f z-30 relative"></i>
                  </a>
                  <a
                    href="#"
                    className="relative w-10 h-10 rounded-full bg-[var(--secondary-color)] flex justify-center items-center text-lg text-[var(--text-1)] after:content-[''] after:absolute after:w-0 after:h-0 after:rounded-full after:bg-[var(--primary-color)] after:transition-all after:duration-300 hover:text-[var(--secondary-color)] hover:after:w-10 hover:after:h-10 after:z-[1] z-20"
                  >
                    <i className="fa-brands fa-instagram z-30 relative"></i>
                  </a>
                  <a
                    href="#"
                    className="relative w-10 h-10 rounded-full bg-[var(--secondary-color)] flex justify-center items-center text-lg text-[var(--text-1)] after:content-[''] after:absolute after:w-0 after:h-0 after:rounded-full after:bg-[var(--primary-color)] after:transition-all after:duration-300 hover:text-[var(--secondary-color)] hover:after:w-10 hover:after:h-10 after:z-[1] z-20"
                  >
                    <i className="fa-brands fa-x-twitter z-30 relative"></i>
                  </a>
                  <a
                    href="#"
                    className="relative w-10 h-10 rounded-full bg-[var(--secondary-color)] flex justify-center items-center text-lg text-[var(--text-1)] after:content-[''] after:absolute after:w-0 after:h-0 after:rounded-full after:bg-[var(--primary-color)] after:transition-all after:duration-300 hover:text-[var(--secondary-color)] hover:after:w-10 hover:after:h-10 after:z-[1] z-20"
                  >
                    <i className="fa-brands fa-linkedin-in z-30 relative"></i>
                  </a>
                </div>
              </div>
              <div className="details mt-4">
                <h3 className="name text-[26px] font-medium font-primary text-[var(--text-1)] text-center uppercase">
                  MD. Imran Hossain
                </h3>
                <h4 className="profession text-[18px] font-semibold text-[var(--primary-color)] text-center mt-1 uppercase">
                  Executive Director
                </h4>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Team End */}

      {/* Our Gallery Start */}
      <div className="our_gallery pt-[80px]">
        <div className="custom-container">
          <div className="flex flex-col lg:flex-row gap-[20px]">
            <div className="w-full lg:w-2/3 flex flex-col gap-[20px] items-stretch">
              <div className="heading_wrap mb-[40px]">
                <span className="tag text-base font-medium font-primary text-[var(--secondary-color)] bg-[var(--primary-color)] py-[5px] px-[20px] rounded-[30px] uppercase">
                  OUR GALLERY
                </span>
                <h2 className="title text-[38px] font-medium max-w-[80%] font-primary text-[var(--text-1)] pt-[20px] uppercase m-0 leading-tight">
                  Our Journey in Pictures, Showcasing Our Craftsmanship
                </h2>
              </div>
              <div className="flex flex-col lg:flex-row gap-[20px]">
                <div className="w-full lg:w-1/2">
                  <div className="group1 w-full rounded-[24px] overflow-hidden transition-all duration-500 aspect-square relative">
                    <Image
                      src={GalleryImage1}
                      alt="Gallery 1"
                      fill
                      className="object-cover transition-all duration-500 hover:scale-[1.05] hover:rotate-1"
                    />
                  </div>
                </div>
                <div className="w-full lg:w-1/2">
                  <div className="group1 w-full rounded-[24px] overflow-hidden transition-all duration-500 aspect-square relative">
                    <Image
                      src={GalleryImage2}
                      alt="Gallery 2"
                      fill
                      className="object-cover transition-all duration-500 hover:scale-[1.05] hover:rotate-1"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full lg:w-1/3 flex items-stretch">
              <div className="flex gap-[20px] flex-col w-full">
                <div className="group2 w-full h-1/2 rounded-[24px] overflow-hidden transition-all duration-500 relative min-h-[300px]">
                  <Image
                    src={GalleryImage3}
                    alt="Gallery 3"
                    fill
                    className="object-cover transition-all duration-500 hover:scale-[1.05] hover:rotate-1"
                  />
                </div>
                <div className="group2 w-full h-1/2 rounded-[24px] overflow-hidden transition-all duration-500 relative min-h-[300px]">
                  <Image
                    src={GalleryImage4}
                    alt="Gallery 4"
                    fill
                    className="object-cover transition-all duration-500 hover:scale-[1.05] hover:rotate-1"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Our Gallery End */}
    </div>
  );
};

export default AboutPage;
