import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import FooterLogo from '../assets/icon/Logo.svg';

const Footer = () => {
    const backToTopRef = useRef(null);

    useEffect(() => {
        const backToTopButton = backToTopRef.current;

        // Show button when scrolled down 100px
        const handleScroll = () => {
            if (window.scrollY > 100) {
                backToTopButton.classList.remove('opacity-0', 'invisible');
                backToTopButton.classList.add('opacity-100', 'visible');
            } else {
                backToTopButton.classList.remove('opacity-100', 'visible');
                backToTopButton.classList.add('opacity-0', 'invisible');
            }
        };

        window.addEventListener('scroll', handleScroll);

        // Cleanup
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Scroll back to top when clicked
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div>
            {/* CTA Start */}
            <section className="cta_section bg-[var(--secondary-color)] px-[16px] pt-[80px] text-center">
                <div
                    className="cta md:w-[50%] w-[100%] bg-[var(--primary-color)] mx-auto mb-[-30px] p-5 rounded-[24px] text-lg font-bold shadow-[0px_4px_30px_0px_rgba(255,255,255,0.20)] inline-block"
                >
                    <h2 className="md:text-[34px] text-[28px] pb-4 text-[var(--secondary-color)] font-medium ">
                        LOOKING FOR SOMEONE WHO CAN TRANSFORM IDEAS?
                    </h2>
                    <Link
                        to="/contact"
                        className="discuss_btn cursor-pointer relative inline-flex items-center justify-center px-8 py-2.5 overflow-hidden tracking-tighter text-[var(--secondary-color)] hover:text-[var(--text-1)] bg-[var(--text-1)] rounded-tl-0 rounded-tr-lg rounded-bl-lg rounded-br-lg group"
                        aria-label="Discuss your project with us"
                    >
                        <span
                            className="absolute bottom-0 left-0 right-0 h-0 transition-all duration-500 ease-out bg-[var(--secondary-color)] group-hover:h-full"
                        ></span>
                        <span className="relative text-base font-semibold">LET'S DISCUSS</span>
                    </Link>
                </div>
            </section>
            {/* CTA End */}

            {/* Footer Start */}
            <footer className="bg-[#F9F6EE]">
                <div className="custom-container">
                    <div
                        className="flex flex-col lg:flex-row items-start md:items-center text-center pt-[100px] gap-2.5 pb-10 md:flex-row md:justify-between md:text-left"
                    >
                        <div className="information">
                            <div className="mb-5">
                                <img src={FooterLogo} alt="BTC Company Logo" className="max-w-[150px]" />
                            </div>
                            <h2 className="max-w-[650px] text-[28px] text-left text-[var(--primary-color)] mb-10 font-normal">
                                IMPROVING PEOPLE'S FUTURES THROUGH BUILDING INFRASTRUCTURE
                            </h2>
                            <div className="flex gap-2.5 mb-[30px]">
                                <a
                                    href="https://www.facebook.com/egpbtc"
                                    className="relative w-10 h-10 rounded-full bg-[var(--text-1)] text-[var(--secondary-color)] flex justify-center items-center text-xl transition duration-400 group"
                                    aria-label="Visit our Facebook page"
                                >
                                    <i className="fa-brands fa-facebook-f z-[1] group-hover:text-[var(--secondary-color)]"></i>
                                    <span
                                        className="absolute w-0 h-0 transition-all duration-400 bg-[var(--primary-color)] rounded-full group-hover:w-10 group-hover:h-10"
                                    ></span>
                                </a>
                                {/*<a*/}
                                {/*    href="https://www.instagram.com/your-profile"*/}
                                {/*    className="relative w-10 h-10 rounded-full bg-[var(--text-1)] text-[var(--secondary-color)] flex justify-center items-center text-xl transition duration-400 group"*/}
                                {/*    aria-label="Visit our Instagram page"*/}
                                {/*>*/}
                                {/*    <i className="fa-brands fa-instagram z-[1] group-hover:text-[var(--secondary-color)]"></i>*/}
                                {/*    <span*/}
                                {/*        className="absolute w-0 h-0 transition-all duration-400 bg-[var(--primary-color)] rounded-full group-hover:w-10 group-hover:h-10"*/}
                                {/*    ></span>*/}
                                {/*</a>*/}
                                {/*<a*/}
                                {/*    href="https://twitter.com/your-profile"*/}
                                {/*    className="relative w-10 h-10 rounded-full bg-[var(--text-1)] text-[var(--secondary-color)] flex justify-center items-center text-xl transition duration-400 group"*/}
                                {/*    aria-label="Visit our Twitter page"*/}
                                {/*>*/}
                                {/*    <i className="fa-brands fa-x-twitter z-[1] group-hover:text-[var(--secondary-color)]"></i>*/}
                                {/*    <span*/}
                                {/*        className="absolute w-0 h-0 transition-all duration-400 bg-[var(--primary-color)] rounded-full group-hover:w-10 group-hover:h-10"*/}
                                {/*    ></span>*/}
                                {/*</a>*/}
                                {/*<a*/}
                                {/*    href="https://www.linkedin.com/your-profile"*/}
                                {/*    className="relative w-10 h-10 rounded-full bg-[var(--text-1)] text-[var(--secondary-color)] flex justify-center items-center text-xl transition duration-400 group"*/}
                                {/*    aria-label="Visit our LinkedIn page"*/}
                                {/*>*/}
                                {/*    <i className="fa-brands fa-linkedin-in z-[1] group-hover:text-[var(--secondary-color)]"></i>*/}
                                {/*    <span*/}
                                {/*        className="absolute w-0 h-0 transition-all duration-400 bg-[var(--primary-color)] rounded-full group-hover:w-10 group-hover:h-10"*/}
                                {/*    ></span>*/}
                                {/*</a>*/}
                            </div>
                        </div>
                        <div className="contact_wrapper">
                            <div className="mb-[30px] flex justify-start">
                                <span
                                    className="text-xl font-medium text-[var(--text-1)] px-5 py-2.5 rounded-[12px] border border-[var(--primary-color)]"
                                >
                                    CONTACT US
                                </span>
                            </div>
                            <div className="flex flex-col gap-4 justify-start text-left items-start">
                                <div className="contact_item flex items-center gap-2.5">
                                    <div className="icon">
                                        <svg width="32" height="32" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <circle cx="28" cy="28" r="28" fill="#5AA469" />
                                            <path
                                                d="M27.6667 29.6667C29.8758 29.6667 31.6667 27.8758 31.6667 25.6667C31.6667 23.4575 29.8758 21.6667 27.6667 21.6667C25.4575 21.6667 23.6667 23.4575 23.6667 25.6667C23.6667 27.8758 25.4575 29.6667 27.6667 29.6667Z"
                                                stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                            />
                                            <path
                                                d="M27.6667 41.6667C33 36.3333 38.3333 31.5577 38.3333 25.6667C38.3333 19.7756 33.5577 15 27.6667 15C21.7756 15 17 19.7756 17 25.6667C17 31.5577 22.3333 36.3333 27.6667 41.6667Z"
                                                stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                            />
                                        </svg>
                                    </div>
                                    <div className="location max-w-[300px] flex flex-col">
                                        <a href="https://maps.google.com/?q=L.M.B+Market,+Abdul+Hamid+Road,+Pabna" className="text-[var(--text-1)]">
                                            L.M.B Market (1st Floor) Abdul Hamid Road, Pabna
                                        </a>
                                    </div>
                                </div>
                                <div className="contact_item flex items-center gap-2.5">
                                    <div className="icon">
                                        <svg width="32" height="32" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <circle cx="28" cy="28" r="28" fill="#5AA469" />
                                            <path
                                                d="M30.7328 19.9998C32.0352 20.2539 33.232 20.8908 34.1703 21.8291C35.1085 22.7673 35.7454 23.9642 35.9995 25.2665M30.7328 14.6665C33.4385 14.9671 35.9616 16.1787 37.8878 18.1025C39.814 20.0263 41.0289 22.5479 41.3328 25.2532M25.6355 30.4839C24.0334 28.8818 22.7683 27.0703 21.8403 25.1375C21.7605 24.9712 21.7206 24.8881 21.6899 24.7829C21.581 24.4091 21.6592 23.9501 21.8859 23.6335C21.9497 23.5444 22.0259 23.4682 22.1783 23.3158C22.6445 22.8497 22.8775 22.6166 23.0299 22.3822C23.6046 21.4984 23.6046 20.3589 23.0299 19.4751C22.8775 19.2407 22.6445 19.0076 22.1783 18.5415L21.9185 18.2817C21.2099 17.5731 20.8556 17.2188 20.4751 17.0263C19.7184 16.6436 18.8247 16.6436 18.0679 17.0263C17.6874 17.2188 17.3331 17.5731 16.6245 18.2817L16.4144 18.4919C15.7082 19.198 15.3551 19.5511 15.0854 20.0311C14.7862 20.5638 14.5711 21.3911 14.5729 22.0021C14.5745 22.5527 14.6813 22.929 14.8949 23.6816C16.0429 27.7261 18.2089 31.5426 21.3928 34.7266C24.5768 37.9105 28.3933 40.0765 32.4378 41.2245C33.1904 41.4381 33.5667 41.5449 34.1173 41.5465C34.7283 41.5483 35.5556 41.3332 36.0883 41.034C36.5683 40.7643 36.9214 40.4112 37.6276 39.7051L37.8377 39.4949C38.5463 38.7863 38.9006 38.432 39.0931 38.0515C39.4758 37.2947 39.4758 36.401 39.0931 35.6443C38.9006 35.2638 38.5463 34.9095 37.8377 34.2009L37.5779 33.9411C37.1118 33.4749 36.8787 33.2419 36.6443 33.0895C35.7605 32.5148 34.621 32.5148 33.7372 33.0895C33.5028 33.2419 33.2697 33.4749 32.8036 33.9411C32.6512 34.0935 32.575 34.1697 32.4859 34.2335C32.1693 34.4602 31.7103 34.5384 31.3365 34.4295C31.2313 34.3988 31.1482 34.3589 30.9819 34.2791C29.0491 33.3511 27.2376 32.086 25.6355 30.4839Z"
                                                stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                            />
                                        </svg>
                                    </div>
                                    <div className="number flex flex-col">
                                        <a href="tel:01711010929" className="text-[var(--text-1)]">01711010929-(Imran)</a>
                                        <a href="tel:01711805086" className="text-[var(--text-1)]">01711805086-(Shah Alom)</a>
                                    </div>
                                </div>
                                <div className="contact_item flex items-center gap-2.5">
                                    <div className="icon">
                                        <svg width="32" height="32" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <circle cx="28" cy="28" r="28" fill="#5AA469" />
                                            <path
                                                d="M40.6666 36.0002L31.8095 28.0002M24.1904 28.0002L15.3333 36.0002M14.6666 21.3335L25.5532 28.9541C26.4347 29.5712 26.8755 29.8797 27.355 29.9992C27.7785 30.1048 28.2214 30.1048 28.6449 29.9992C29.1244 29.8797 29.5652 29.5712 30.4467 28.9541L41.3333 21.3335M21.0666 38.6668H34.9333C37.1735 38.6668 38.2936 38.6668 39.1493 38.2309C39.9019 37.8474 40.5138 37.2354 40.8973 36.4828C41.3333 35.6271 41.3333 34.507 41.3333 32.2668V23.7335C41.3333 21.4933 41.3333 20.3732 40.8973 19.5175C40.5138 18.7649 39.9019 18.153 39.1493 17.7695C38.2936 17.3335 37.1735 17.3335 34.9333 17.3335H21.0666C18.8264 17.3335 17.7063 17.3335 16.8507 17.7695C16.098 18.153 15.4861 18.7649 15.1026 19.5175C14.6666 20.3732 14.6666 21.4933 14.6666 23.7335V32.2668C14.6666 34.507 14.6666 35.6271 15.1026 36.4828C15.4861 37.2354 16.098 37.8474 16.8507 38.2309C17.7063 38.6668 18.8264 38.6668 21.0666 38.6668Z"
                                                stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                            />
                                        </svg>
                                    </div>
                                    <div className="flex flex-col">
                                        <a href="mailto:info@egpbtc.com" className="text-[var(--text-1)]">info@egpbtc.com</a>
                                        <a href="mailto:imran@egpbtc.com" className="text-[var(--text-1)]">imran@egpbtc.com</a>
                                        <a href="mailto:salom@egpbtc.com" className="text-[var(--text-1)]">salom@egpbtc.com</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="custom-container">
                    <div className="flex flex-col-reverse md:flex-row justify-between border-t border-t-[var(--ac-2)] py-6 gap-2.5">
                        <span className="m-0 leading-5 text-left text-[var(--text-1)]">© 2025 BTC. All Rights Reserved</span>
                        <div className="flex flex-wrap justify-start md:justify-end gap-x-[15px]">
                            <Link
                                to="/services"
                                className="text-[var(--text-1)] no-underline transition duration-300 uppercase text-sm font-medium hover:text-[var(--primary-color)]"
                            >
                                Services
                            </Link>
                            <Link
                                to="/tender"
                                className="text-[var(--text-1)] no-underline transition duration-300 uppercase text-sm font-medium hover:text-[var(--primary-color)]"
                            >
                                Tender
                            </Link>
                            <Link
                                to="/projects"
                                className="text-[var(--text-1)] no-underline transition duration-300 uppercase text-sm font-medium hover:text-[var(--primary-color)]"
                            >
                                Projects
                            </Link>
                            <Link
                                to="/about"
                                className="text-[var(--text-1)] no-underline transition duration-300 uppercase font-[var(--primary-font)] text-sm font-medium hover:text-[var(--primary-color)]"
                            >
                                About Us
                            </Link>
                            <Link
                                to="/contact"
                                className="text-[var(--text-1)] no-underline transition duration-300 uppercase font-[var(--primary-font)] text-sm font-medium hover:text-[var(--primary-color)]"
                            >
                                Contact Us
                            </Link>
                            <Link
                                to="/privacy-policy"
                                className="text-[var(--text-1)] no-underline transition duration-300 uppercase font-[var(--primary-font)] text-sm font-medium hover:text-[var(--primary-color)]"
                            >
                                Privacy Policy
                            </Link>
                            <Link
                                to="/terms-conditions"
                                className="text-[var(--text-1)] no-underline transition duration-300 uppercase font-[var(--primary-font)] text-sm font-medium hover:text-[var(--primary-color)]"
                            >
                                Terms & Conditions
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>
            {/* Footer End */}

            {/* Back to Top Button Start */}
            <button
                id="back-to-top"
                ref={backToTopRef}
                onClick={scrollToTop}
                className="fixed bottom-[30px] right-[30px] w-[60px] h-[60px] rounded-full flex justify-center items-center cursor-pointer opacity-0 invisible transition-all duration-500 z-[100]"
                aria-label="Back to Top"
            >
                <svg
                    width="100"
                    height="119"
                    viewBox="0 0 100 119"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-[60px] h-[60px]"
                >
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M76.4787 22.9461L50 11L23.5213 22.9461L50 3.7082L76.4787 22.9461ZM10.0556 29.0213L12.3536 36.0938C4.66128 44.887 0 56.3992 0 69C0 96.6142 22.3858 119 50 119C77.6142 119 100 96.6142 100 69C100 56.3992 95.3387 44.887 87.6464 36.0938L89.9444 29.0213L50 0L10.0556 29.0213Z"
                        fill="#5AA469"
                        className="transition-colors duration-400 group-hover:fill-[var(--main-80)]"
                    />
                    <path
                        d="M50 85V53M50 53L38 65M50 53L62 65"
                        stroke="#fff"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </button>
            {/* Back to Top Button End */}
        </div>
    );
};

export default Footer;