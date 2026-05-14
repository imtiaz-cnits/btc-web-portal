"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

// Assets
import FooterLogo from "@/assets/icon/Logo.svg";

const Footer: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Show the back to top button when scrolled down
  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="footer_wrap">
      {/* CTA Start */}
      <section className="cta_section bg-secondary px-[16px] pt-[80px] text-center">
        <div className="cta md:w-[50%] w-[100%] bg-primary mx-auto mb-[-30px] p-5 rounded-[24px] text-lg font-bold shadow-lg inline-block">
          <h2 className="md:text-[34px] text-[28px] pb-4 text-secondary font-medium uppercase font-primary">
            LOOKING FOR SOMEONE WHO CAN TRANSFORM IDEAS?
          </h2>
          <Link
            href="/contact"
            className="discuss_btn cursor-pointer relative inline-flex items-center justify-center px-8 py-2.5 overflow-hidden tracking-tighter text-secondary bg-text-1 rounded-tl-0 rounded-tr-lg rounded-bl-lg rounded-br-lg group transition-all duration-500"
          >
            <span className="absolute bottom-0 left-0 right-0 h-0 transition-all duration-500 ease-out bg-secondary group-hover:h-full"></span>
            <span className="relative text-base font-semibold text-white group-hover:text-text-1 transition-colors duration-500 uppercase font-secondary">
              LET'S DISCUSS
            </span>
          </Link>
        </div>
      </section>
      {/* CTA End */}

      {/* Footer Start */}
      <footer className="bg-shade-1/30">
        <div className="custom-container">
          <div className="flex flex-col lg:flex-row items-start md:items-center text-center pt-[100px] gap-2.5 pb-10 md:flex-row md:justify-between md:text-left">
            <div className="information">
              <div className="mb-5 flex justify-start">
                <Image
                  src={FooterLogo}
                  alt="BTC Company Logo"
                  width={150}
                  height={50}
                  className="max-w-[150px] object-contain"
                />
              </div>
              <h2 className="max-w-[650px] text-[28px] text-left text-primary mb-10 font-normal font-primary uppercase leading-tight">
                IMPROVING PEOPLE'S FUTURES THROUGH BUILDING INFRASTRUCTURE
              </h2>
              <div className="flex gap-2.5 mb-[30px] justify-start">
                <a
                  href="https://www.facebook.com/egpbtc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative w-10 h-10 rounded-full bg-text-1 text-secondary flex justify-center items-center text-xl transition duration-400 group overflow-hidden"
                >
                  <span className="relative z-[2] group-hover:text-secondary">
                    <i className="fa-brands fa-facebook-f z-[1] text-white group-hover:text-[var(--secondary-color)]"></i>
                  </span>
                  <span className="absolute w-0 h-0 transition-all duration-400 bg-primary rounded-full group-hover:w-10 group-hover:h-10 z-[1]"></span>
                </a>
              </div>
            </div>
            <div className="contact_wrapper">
              <div className="mb-[30px] flex justify-start">
                <span className="text-xl font-medium text-text-1 px-5 py-2.5 rounded-[12px] border border-primary uppercase font-primary">
                  CONTACT US
                </span>
              </div>
              <div className="flex flex-col gap-4 justify-start text-left items-start">
                <div className="contact_item flex items-center gap-2.5">
                  <div className="icon">
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 56 56"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="28" cy="28" r="28" className="fill-primary" />
                      <path
                        d="M27.6667 29.6667C29.8758 29.6667 31.6667 27.8758 31.6667 25.6667C31.6667 23.4575 29.8758 21.6667 27.6667 21.6667C25.4575 21.6667 23.6667 23.4575 23.6667 25.6667C23.6667 27.8758 25.4575 29.6667 27.6667 29.6667Z"
                        stroke="currentColor"
                        className="text-white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M27.6667 41.6667C33 36.3333 38.3333 31.5577 38.3333 25.6667C38.3333 19.7756 33.5577 15 27.6667 15C21.7756 15 17 19.7756 17 25.6667C17 31.5577 22.3333 36.3333 27.6667 41.6667Z"
                        stroke="currentColor"
                        className="text-white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div className="location max-w-[300px] flex flex-col font-secondary">
                    <a
                      href="https://maps.google.com/?q=L.M.B+Market,+Abdul+Hamid+Road,+Pabna"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-text-1 hover:text-primary transition-colors"
                    >
                      L.M.B Market (1st Floor) Abdul Hamid Road, Pabna
                    </a>
                  </div>
                </div>
                <div className="contact_item flex items-center gap-2.5">
                  <div className="icon">
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 56 56"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="28" cy="28" r="28" className="fill-primary" />
                      <path
                        d="M30.7328 19.9998C32.0352 20.2539 33.232 20.8908 34.1703 21.8291C35.1085 22.7673 35.7454 23.9642 35.9995 25.2665M30.7328 14.6665C33.4385 14.9671 35.9616 16.1787 37.8878 18.1025C39.814 20.0263 41.0289 22.5479 41.3328 25.2532M25.6355 30.4839C24.0334 28.8818 22.7683 27.0703 21.8403 25.1375C21.7605 24.9712 21.7206 24.8881 21.6899 24.7829C21.581 24.4091 21.6592 23.9501 21.8859 23.6335C21.9497 23.5444 22.0259 23.4682 22.1783 23.3158C22.6445 22.8497 22.8775 22.6166 23.0299 22.3822C23.6046 21.4984 23.6046 20.3589 23.0299 19.4751C22.8775 19.2407 22.6445 19.0076 22.1783 18.5415L21.9185 18.2817C21.2099 17.5731 20.8556 17.2188 20.4751 17.0263C19.7184 16.6436 18.8247 16.6436 18.0679 17.0263C17.6874 17.2188 17.3331 17.5731 16.6245 18.2817L16.4144 18.4919C15.7082 19.198 15.3551 19.5511 15.0854 20.0311C14.7862 20.5638 14.5711 21.3911 14.5729 22.0021C14.5745 22.5527 14.6813 22.929 14.8949 23.6816C16.0429 27.7261 18.2089 31.5426 21.3928 34.7266C24.5768 37.9105 28.3933 40.0765 32.4378 41.2245C33.1904 41.4381 33.5667 41.5449 34.1173 41.5465C34.7283 41.5483 35.5556 41.3332 36.0883 41.034C36.5683 40.7643 36.9214 40.4112 37.6276 39.7051L37.8377 39.4949C38.5463 38.7863 38.9006 38.432 39.0931 38.0515C39.4758 37.2947 39.4758 36.401 39.0931 35.6443C38.9006 35.2638 38.5463 34.9095 37.8377 34.2009L37.5779 33.9411C37.1118 33.4749 36.8787 33.2419 36.6443 33.0895C35.7605 32.5148 34.621 32.5148 33.7372 33.0895C33.5028 33.2419 33.2697 33.4749 32.8036 33.9411C32.6512 34.0935 32.575 34.1697 32.4859 34.2335C32.1693 34.4602 31.7103 34.5384 31.3365 34.4295C31.2313 34.3988 31.1482 34.3589 30.9819 34.2791C29.0491 33.3511 27.2376 32.086 25.6355 30.4839Z"
                        stroke="currentColor"
                        className="text-white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div className="number flex flex-col font-secondary">
                    <a
                      href="tel:01711805086"
                      className="text-text-1 hover:text-primary transition-colors"
                    >
                      01711805086 (Shah Alom)
                    </a>
                    <a
                      href="tel:01711010929"
                      className="text-text-1 hover:text-primary transition-colors"
                    >
                      01711010929 (Imran)
                    </a>
                  </div>
                </div>
                <div className="contact_item flex items-center gap-2.5">
                  <div className="icon">
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 56 56"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="28" cy="28" r="28" className="fill-primary" />
                      <path
                        d="M11 19C11 17.8954 11.8954 17 13 17H43C44.1046 17 45 17.8954 45 19V37C45 38.1046 44.1046 39 43 39H13C11.8954 39 11 38.1046 11 37V19Z"
                        stroke="#fff"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M11 19L28 31L45 19"
                        stroke="#fff"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div className="email font-secondary">
                    <a
                      href="mailto:info@egpbtc.com"
                      className="text-text-1 hover:text-primary transition-colors"
                    >
                      info@egpbtc.com
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-primary/20">
          <div className="custom-container py-5">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-text-2 font-secondary text-sm">
              <p>
                © {new Date().getFullYear()} Building Technology & Consultant.
                All rights reserved.
              </p>
              <p>
                Design & Developed by{" "}
                <a
                  href="https://codenextit.com/"
                  className="text-primary font-bold hover:underline"
                >
                  CODENEXT IT
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>
      {/* Footer End */}

      {/* Back to Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 z-50 bg-primary text-secondary w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:bg-text-1 hover:-translate-y-1 ${
          isVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-10 pointer-events-none"
        }`}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 15l-6-6-6 6" />
        </svg>
      </button>
    </div>
  );
};

export default Footer;
