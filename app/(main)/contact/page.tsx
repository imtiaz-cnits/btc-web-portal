"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

// Assets
import ContactHeroImage from "@/assets/img/contact/contact-theame-image.png";
import ContactBg from "@/assets/img/contact/contact-bg.png";

const ContactPage: React.FC = () => {
  return (
    <div className="contact_page_wrapper pb-20">
      {/* Contact Start */}
      <div className="contact_us bg-[var(--secondary-color)] text-center pt-5 overflow-hidden">
        <div className="custom-container">
          <div className="flex gap-4 flex-col lg:flex-row">
            {/* Left Column */}
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
                    CONTACT US
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
                        <span className="active_item item flex justify-center items-center font-primary text-sm uppercase text-[var(--secondary-color)] cursor-pointer">
                          CONTACT US
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="w-full lg:w-1/2 flex items-stretch mt-5 lg:mt-0">
              <div className="contact_theame w-full rounded-[24px_25px_24px_0px] overflow-hidden relative min-h-[300px]">
                <Image
                  src={ContactHeroImage}
                  alt="Contact Hero"
                  fill
                  className="object-cover bg-center bg-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Contact End */}

      {/* Get In Touch Start */}
      <div className="get_in_touch pt-[80px] bg-[var(--secondary-color)]">
        <div className="custom-container">
          <div className="flex flex-col lg:flex-row gap-4 items-start">
            {/* Contact Details Column */}
            <div className="w-full lg:w-1/2">
              <div className="details text-left">
                <h2 className="title text-[38px] font-medium font-primary text-[var(--text-1)] uppercase mb-2.5">
                  Get in Touch
                </h2>
                <p className="paragraph text-base leading-relaxed !text-left text-[var(--text-2)] mb-5 font-[var(--secondary-font)]">
                  We pride ourselves on quality craftsmanship and timely
                  delivery. Let's build your dream project—get in touch with us
                  today!
                </p>

                {/* Phone Section */}
                <h3 className="sub_title text-[26px] lg:text-[22px] font-medium font-primary text-[var(--text-1)] uppercase mb-3.5 text-left border-b-4 border-[var(--primary-color)] inline-block">
                  PHONE NUMBER
                </h3>
                <div className="contact_item flex items-center gap-2.5 mb-8 mt-4">
                  <div className="icon">
                    <svg
                      width="34"
                      height="34"
                      viewBox="0 0 56 56"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="28" cy="28" r="28" fill="#5AA469" />
                      <path
                        d="M30.7328 19.9998C32.0352 20.2539 33.232 20.8908 34.1703 21.8291C35.1085 22.7673 35.7454 23.9642 35.9995 25.2665M30.7328 14.6665C33.4385 14.9671 35.9616 16.1787 37.8878 18.1025C39.814 20.0263 41.0289 22.5479 41.3328 25.2532M25.6355 30.4839C24.0334 28.8818 22.7683 27.0703 21.8403 25.1375C21.7605 24.9712 21.7206 24.8881 21.6899 24.7829C21.581 24.4091 21.6592 23.9501 21.8859 23.6335C21.9497 23.5444 22.0259 23.4682 22.1783 23.3158C22.6445 22.8497 22.8775 22.6166 23.0299 22.3822C23.6046 21.4984 23.6046 20.3589 23.0299 19.4751C22.8775 19.2407 22.6445 19.0076 22.1783 18.5415L21.9185 18.2817C21.2099 17.5731 20.8556 17.2188 20.4751 17.0263C19.7184 16.6436 18.8247 16.6436 18.0679 17.0263C17.6874 17.2188 17.3331 17.5731 16.6245 18.2817L16.4144 18.4919C15.7082 19.198 15.3551 19.5511 15.0854 20.0311C14.7862 20.5638 14.5711 21.3911 14.5729 22.0021C14.5745 22.5527 14.6813 22.929 14.8949 23.6816C16.0429 27.7261 18.2089 31.5426 21.3928 34.7266C24.5768 37.9105 28.3933 40.0765 32.4378 41.2245C33.1904 41.4381 33.5667 41.5449 34.1173 41.5465C34.7283 41.5483 35.5556 41.3332 36.0883 41.034C36.5683 40.7643 36.9214 40.4112 37.6276 39.7051L37.8377 39.4949C38.5463 38.7863 38.9006 38.432 39.0931 38.0515C39.4758 37.2947 39.4758 36.401 39.0931 35.6443C38.9006 35.2638 38.5463 34.9095 37.8377 34.2009L37.5779 33.9411C37.1118 33.4749 36.8787 33.2419 36.6443 33.0895C35.7605 32.5148 34.621 32.5148 33.7372 33.0895C33.5028 33.2419 33.2697 33.4749 32.8036 33.9411C32.6512 34.0935 32.575 34.1697 32.4859 34.2335C32.1693 34.4602 31.7103 34.5384 31.3365 34.4295C31.2313 34.3988 31.1482 34.3589 30.9819 34.2791C29.0491 33.3511 27.2376 32.086 25.6355 30.4839Z"
                        stroke="#fff"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div className="number flex flex-col font-[var(--secondary-font)]">
                    <a
                      href="tel:+8801711805086"
                      className="text-[var(--text-2)] hover:text-[var(--primary-color)] transition-colors"
                    >
                      {" "}
                      <strong>Engr. Md. Shah Alom (Abir)</strong> +88 01711 805
                      086
                    </a>
                    <a
                      href="tel:+8801711010929"
                      className="text-[var(--text-2)] hover:text-[var(--primary-color)] transition-colors"
                    >
                      {" "}
                      <strong>Md. Imran Hossain</strong> +88 01711 010 929
                    </a>
                  </div>
                </div>

                {/* Email Section */}
                <h3 className="sub_title text-[26px] lg:text-[22px] font-medium font-primary text-[var(--text-1)] uppercase mb-3.5 text-left border-b-4 border-[var(--primary-color)] inline-block">
                  E-MAIL
                </h3>
                <div className="contact_item flex items-center gap-2.5 mb-8 mt-4">
                  <div className="icon">
                    <svg
                      width="34"
                      height="34"
                      viewBox="0 0 56 56"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="28" cy="28" r="28" fill="#5AA469" />
                      <path
                        d="M40.6666 36.0002L31.8095 28.0002M24.1904 28.0002L15.3333 36.0002M14.6666 21.3335L25.5532 28.9541C26.4347 29.5712 26.8755 29.8797 27.355 29.9992C27.7785 30.1048 28.2214 30.1048 28.6449 29.9992C29.1244 29.8797 29.5652 29.5712 30.4467 28.9541L41.3333 21.3335M21.0666 38.6668H34.9333C37.1735 38.6668 38.2936 38.6668 39.1493 38.2309C39.9019 37.8474 40.5138 37.2354 40.8973 36.4828C41.3333 35.6271 41.3333 34.507 41.3333 32.2668V23.7335C41.3333 21.4933 41.3333 20.3732 40.8973 19.5175C40.5138 18.7649 39.9019 18.153 39.1493 17.7695C38.2936 17.3335 37.1735 17.3335 34.9333 17.3335H21.0666C18.8264 17.3335 17.7063 17.3335 16.8507 17.7695C16.098 18.153 15.4861 18.7649 15.1026 19.5175C14.6666 20.3732 14.6666 21.4933 14.6666 23.7335V32.2668C14.6666 34.507 14.6666 35.6271 15.1026 36.4828C15.4861 37.2354 16.098 37.8474 16.8507 38.2309C17.7063 38.6668 18.8264 38.6668 21.0666 38.6668Z"
                        stroke="#fff"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div className="flex flex-col gap-1 font-primary">
                    <a
                      href="mailto:salom@egpbtc.com"
                      className="text-[var(--text-2)] hover:text-[var(--primary-color)] transition-colors"
                    >
                      salom@egpbtc.com
                    </a>
                    <a
                      href="mailto:imran@egpbtc.com"
                      className="text-[var(--text-2)] hover:text-[var(--primary-color)] transition-colors"
                    >
                      imran@egpbtc.com
                    </a>
                  </div>
                </div>

                {/* Location Section */}
                <h3 className="sub_title text-[26px] lg:text-[22px] font-medium font-primary text-[var(--text-1)] uppercase mb-3.5 text-left border-b-4 border-[var(--primary-color)] inline-block">
                  LOCATION
                </h3>
                <div className="contact_item flex items-start gap-2.5 mb-8 mt-4">
                  <div className="icon">
                    <svg
                      width="34"
                      height="34"
                      viewBox="0 0 56 56"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="28" cy="28" r="28" fill="#5AA469" />
                      <path
                        d="M27.6667 29.6667C29.8758 29.6667 31.6667 27.8758 31.6667 25.6667C31.6667 23.4575 29.8758 21.6667 27.6667 21.6667C25.4575 21.6667 23.6667 23.4575 23.6667 25.6667C23.6667 27.8758 25.4575 29.6667 27.6667 29.6667Z"
                        stroke="#fff"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M27.6667 41.6667C33 36.3333 38.3333 31.5577 38.3333 25.6667C38.3333 19.7756 33.5577 15 27.6667 15C21.7756 15 17 19.7756 17 25.6667C17 31.5577 22.3333 36.3333 27.6667 41.6667Z"
                        stroke="#fff"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div className="location w-full flex flex-col font-primary">
                    <h4 className="location_title text-lg font-bold text-[var(--text-1)] text-left uppercase mb-1 border-b border-[var(--ac-1)] pb-1">
                      Pabna
                    </h4>
                    <p className="text-[var(--text-2)]">
                      L.M.B Market (1st Floor) Abdul Hamid Road, Pabna
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form Column */}
            <div className="w-full lg:w-1/2 mt-10 lg:mt-0">
              <div className="send_message border border-[var(--ac-1)] rounded-[24px] p-8 lg:p-10 bg-[var(--shade-1)] shadow-xl">
                <h3 className="sub_title text-[26px] lg:text-[22px] font-medium font-primary text-[var(--text-1)] uppercase mb-8 text-center">
                  SEND US A Message
                </h3>
                <form className="w-full flex flex-col gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-base font-bold text-[var(--text-1)] uppercase font-[var(--secondary-font)]">
                      Name
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full bg-white outline-none px-4 py-3 text-base border-b-2 border-[var(--ac-1)] focus:border-[var(--primary-color)] transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-base font-bold text-[var(--text-1)] uppercase font-[var(--secondary-font)]">
                      E-mail
                    </label>
                    <input
                      type="email"
                      required
                      className="w-full bg-white outline-none px-4 py-3 text-base border-b-2 border-[var(--ac-1)] focus:border-[var(--primary-color)] transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-base font-bold text-[var(--text-1)] uppercase font-[var(--secondary-font)]">
                      Message
                    </label>
                    <textarea
                      rows={3}
                      required
                      className="w-full bg-white outline-none px-4 py-3 text-base border-b-2 border-[var(--ac-1)] focus:border-[var(--primary-color)] transition-all"
                    ></textarea>
                  </div>
                  <div className="button text-center mt-4">
                    <button className="send_msg_btn bg-[var(--text-1)] relative inline-block py-[12px] px-[40px] rounded-tl-none rounded-tr-[12px] rounded-br-[12px] rounded-bl-[12px] border-none cursor-pointer overflow-hidden z-[1] group transition-all duration-500">
                      <span className="text-[var(--secondary-color)] transition-all duration-400 font-[var(--secondary-font)] text-[16px] font-bold uppercase relative z-10 group-hover:text-white">
                        Send Message
                      </span>
                      <span className="absolute bottom-0 left-0 w-full h-0 rounded-tl-[6px] rounded-tr-[6px] bg-[var(--primary-color)] transition-all duration-400 -z-[1] group-hover:h-full group-hover:rounded-tl-none"></span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Get In Touch End */}

      {/* Map Start */}
      <div className="map px-5 mt-[80px]">
        <div className="w-full h-[500px] lg:h-[700px] rounded-[24px] overflow-hidden shadow-2xl border-4 border-white">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d276.16306301292224!2d89.23473346889256!3d24.0050804316098!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39fe9b5f6483c075%3A0x1393742004b5e76f!2sBUILDING%20TECNOLOGY%20%26%20CONSULTANT!5e0!3m2!1sen!2sbd!4v1750881488098!5m2!1sen!2sbd"
            width="100%"
            height="100%"
            style={{ border: "0" }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
      {/* Map End */}
    </div>
  );
};

export default ContactPage;
