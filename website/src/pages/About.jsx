import React, { useEffect, useRef } from 'react';
import {
    useGsapAnimation,
    gsapAnimations,
} from '../assets/js/style.js';
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Helmet } from 'react-helmet';
import AboutHeroImage from '../assets/img/about/about-theame-img.png';
import VisionImage1 from '../assets/img/about/vission1.png';
import VisionImage2 from '../assets/img/about/vission2.png';
import MissionImage1 from '../assets/img/about/mission1.png';
import MissionImage2 from '../assets/img/about/mission2.png';
import TeamImage1 from '../assets/img/about/team1.png';
import TeamImage2 from '../assets/img/about/team2.png';
import TeamImage3 from '../assets/img/about/team3.png';
import GalleryImage1 from '../assets/img/about/gallery1.png';
import GalleryImage2 from '../assets/img/about/gallery2.png';
import GalleryImage3 from '../assets/img/about/gallery3.png';
import GalleryImage4 from '../assets/img/about/gallery4.png';

const About = () => {

    const counterStatsRef = useRef(null);

    // Use custom hook for GSAP animations
    useGsapAnimation(gsapAnimations);

    // Register GSAP and ScrollTrigger plugins
    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger);

        let triggers = [];

        // CounterWrapper Section Animation
        const counterNumbers = counterStatsRef.current?.querySelectorAll('.nmbr');
        if (counterNumbers && counterNumbers.length > 0) {
            counterNumbers.forEach((counter) => {
                const trigger = ScrollTrigger.create({
                    trigger: counterStatsRef.current,
                    start: 'top 80%',
                    toggleActions: 'play none none none',
                    onEnter: () => {
                        gsap.fromTo(
                            counter,
                            { innerText: 0 },
                            {
                                innerText: counter.getAttribute('data-target'),
                                duration: 2,
                                ease: 'power1.out',
                                snap: { innerText: 1 },
                                onUpdate: function () {
                                    counter.textContent = Math.floor(this.targets()[0].innerText);
                                },
                            }
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
        <>
            {/* Helmet for dynamic title and meta tags */}
            <Helmet>
                <title>About Us | Building Technology & Consultant</title>
                <meta name="description" content="Welcome to Building Technology & Consultant. View our latest notices and explore our services." />
                <meta name="keywords" content="building technology, consultant, notices, services" />
            </Helmet>

            {/* About Start */}
            <div className="about_us bg-[var(--secondary-color)] text-center pt-5 overflow-hidden">
                <div className="custom-container">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="w-full flex g-2 items-stretch">
                            <div className="wrapper w-full">
                                <div
                                    className="breadcrumb flex flex-col justify-center w-full rounded-[24px_0px_24px_24px] p-[50px_24px] m-0 bg-[url('../assets/img/about/contact-bg.png')] bg-no-repeat bg-right object-cover">
                                    <div className="wrapper w-full h-full">
                                        <h2
                                            className="title text-[38px] font-bold font-[var(--primary-font)] text-[var(--secondary-color)] mb-[10px] uppercase">
                                            ABOUT US
                                        </h2>
                                        <div className="wrap inline-block bg-[var(--text-1)] px-6 py-1.5 rounded-full">
                                            <ul className="breadcrumb_item flex items-center justify-center gap-2.5">
                                                <li>
                                                    <a href="./index.html"
                                                       className="item flex justify-center items-center font-[var(--primary-font)] text-[14px] font-normal uppercase text-[var(--secondary-color)] transition-all duration-300 cursor-pointer">HOME</a>
                                                </li>
                                                <li>
                                                    <i className="fa-solid fa-angle-right text-[var(--primary-color)] text-sm"></i>
                                                </li>
                                                <li>
                                                    <a
                                                        className="active_item item flex justify-center items-center font-[var(--primary-font)] text-[14px] font-normal uppercase text-[var(--secondary-color)] cursor-pointer">ABOUT
                                                        US</a>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                <h3 className="des text-[18px] font-[var(--primary-font)] font-medium text-[var(--text-2)] m-0 pt-5">
                                    Utilizing advanced construction tools, equipment, and techniques
                                    for efficiency and innovation.
                                </h3>
                            </div>
                        </div>
                        <div className="w-full flex items-stretch">
                            <div className="contact_theame w-full rounded-[24px_25px_24px_0px] overflow-hidden mt-5 lg:mt-0">
                                <img src={AboutHeroImage} alt="" className="w-full h-full object-cover" />
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
                                <div ref={counterStatsRef} className="stats grid grid-cols-2 gap-5 max-w-full">
                                    <div
                                        className="stats_item flex flex-col items-center justify-center bg-[var(--secondary-color)] py-6 px-2 rounded-md text-center shadow-md">
                                        <h2 className="count flex items-center gap-1 text-[48px] font-[var(--primary-font)] font-bold">
                                            <span className="nmbr font-[var(--primary-font)]" data-target="1000">0</span>
                                            <span className="suffix text-[var(--primary-color)]">+</span>
                                        </h2>
                                        <p className="counter_title !text-[var(--text-2)] text-[16px] font-[var(--secondary-font)]">
                                            Total Tenders
                                        </p>
                                    </div>
                                    <div
                                        className="stats_item flex flex-col items-center justify-center bg-[var(--secondary-color)] py-5 rounded-md text-center shadow-md">
                                        <h2 className="count flex items-center gap-1 text-[48px] font-[var(--primary-font)] font-bold">
                                            <span className="nmbr" data-target="700">0</span>
                                            <span className="suffix text-[var(--primary-color)]">+</span>
                                        </h2>
                                        <p className="counter_title text-sm !text-[var(--text-2)] font-[var(--secondary-font)]">
                                            Design Clients
                                        </p>
                                    </div>
                                    <div
                                        className="stats_item flex flex-col items-center justify-center bg-[var(--secondary-color)] py-5 rounded-md text-center shadow-md">
                                        <h2 className="count flex items-center gap-1 text-[48px] font-[var(--primary-font)] font-bold">
                                            <span className="nmbr" data-target="98">0</span>
                                            <span className="suffix text-[var(--primary-color)] percent text-[30px] font-bold">%</span>
                                        </h2>
                                        <p className="counter_title text-sm !text-[var(--text-2)] font-[var(--secondary-font)]">
                                            Success Rate
                                        </p>
                                    </div>
                                    <div
                                        className="stats_item flex flex-col items-center justify-center bg-[var(--secondary-color)] py-5 rounded-md text-center shadow-md">
                                        <h2 className="count flex items-center gap-1 text-[48px] font-[var(--primary-font)] font-bold">
                                            <span className="nmbr" data-target="200">0</span>
                                            <span className="suffix text-[var(--primary-color)]">+</span>
                                        </h2>
                                        <p className="counter_title text-sm !text-[var(--text-2)] font-[var(--secondary-font)]">
                                            Projects
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="w-full lg:w-1/2 mt-12 lg:mt-0">
                                <div className="overview_details">
                                    <div className="heading_wrap">
                                        <h2
                                            className="title text-[38px] font-semibold text-[var(--text-1)] font-[var(--primary-font)] uppercase text-left">
                                            Precision, Quality, and Excellence in Every Project
                                        </h2>
                                        <p
                                            className="paragraph text-base w-full leading-5 font-[500] !text-left mt-5 !text-[var(--text-2)] font-[var(--secondary-font)]">
                                            We specialize in delivering top-tier construction services,
                                            including soil testing, architectural design, interior
                                            design, land surveys, and more. Our expert team is committed
                                            to ensuring the success of your projects with precision,
                                            creativity, and a focus on quality. We bring innovative
                                            solutions and reliable results to every step of the
                                            construction process, transforming your vision into reality.
                                        </p>
                                    </div>
                                    <h3
                                        className="sub_heading inline-block text-lg font-semibold text-[var(--text-1)] font-[var(--primary-font)] uppercase border-b-4 border-[var(--primary-color)] pt-[20px]">
                                        Who We Are
                                    </h3>
                                    <p
                                        className="paragraph text-base max-w-[590px] leading-5 font-medium !text-left mt-2 !text-[var(--text-2)] font-[var(--secondary-font)]">
                                        Founded on the principles of integrity, reliability, and
                                        excellence, [Your Company Name] has grown into a trusted name
                                        in the construction field. Our team of skilled professionals
                                        brings together expertise and passion to deliver projects that
                                        stand the test of time.
                                    </p>
                                    <h3
                                        className="sub_heading inline-block text-lg font-semibold text-[var(--text-1)] font-[var(--primary-font)] uppercase border-b-4 border-[var(--primary-color)] pt-[20px]">
                                        What We Do
                                    </h3>
                                    <p
                                        className="paragraph text-base max-w-[590px] leading-5 font-medium !text-left mt-2 !text-[var(--text-2)] font-[var(--secondary-font)]">
                                        From residential homes to commercial buildings and industrial
                                        facilities, we specialize in comprehensive construction
                                        services tailored to your needs. Whether it’s a new build,
                                        renovation, or expansion, we ensure every detail is executed
                                        to perfection.
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
                                <span
                                    className="tag text-sm font-medium font-[var(--primary-font)] text-[var(--secondary-color)] bg-[var(--primary-color)] px-5 py-2 rounded-full">OUR
                                    VISION</span>
                                <h2
                                    className="title text-[38px] font-medium text-left font-[var(--primary-font)] text-[var(--text-1)] uppercase pt-5">
                                    Shaping the Future, One Structure at a Time
                                </h2>
                                <p
                                    className="paragraph text-base max-w-[590px] leading-5 font-medium !text-left mt-5 text-[var(--text-2)] font-[var(--secondary-font)]">
                                    To be a leader in the construction industry, recognized for
                                    innovation, sustainability, and unparalleled quality. We strive
                                    to shape a future where every project we undertake contributes
                                    to building stronger communities and lasting legacies.
                                </p>

                                <div className="button mt-7">
                                    <button
                                        className="service_btn bg-[var(--primary-color)] relative inline-block py-[10px] px-[30px] rounded-tl-none rounded-tr-[12px] rounded-br-[12px] rounded-bl-[12px] border-none cursor-pointer overflow-hidden z-[1] group">
                                        <span
                                            className="text-[var(--secondary-color)] transition-all duration-400 font-[var(--secondary-font)] text-[16px] font-semibold">VIEW
                                            OUR SERVICES</span>
                                        <span
                                            className="absolute bottom-0 left-0 w-full h-0 rounded-tl-[6px] rounded-tr-[6px] bg-[var(--text-1)] transition-all duration-400 -z-[1] group-hover:h-full group-hover:rounded-tl-none"></span>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="w-full mt-[30px] lg:mt-[0px]">
                            <div className="images1 relative w-[70%] aspect-square rounded-bl-2xl rounded-br-2xl rounded-tr-2xl float-right">
                                <img
                                    className="large w-full h-full object-cover bg-cover bg-center rounded-bl-2xl rounded-br-2xl rounded-tr-2xl"
                                    src={VisionImage1} alt="Vision Image 1" />

                                <div
                                    className="small absolute top-5 left-[-102px] md:left-[-132px] w-[200px] aspect-[16/12] rounded-bl-lg rounded-br-lg rounded-tr-lg overflow-hidden border-3 border-[var(--secondary-color)]">
                                    <img src={VisionImage2} alt="Vision Image 1"
                                         className="w-full h-full object-cover bg-cover bg-center rounded-bl-lg rounded-br-lg rounded-tr-lg" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col flex-col-reverse lg:flex-row gap-4 items-center mt-[80px]">
                        <div className="w-full mt-[30px] lg:mt-[0px]">
                            <div className="images2 relative w-[70%] aspect-square rounded-tl-2xl rounded-bl-2xl rounded-br-2xl">
                                <img
                                    className="large w-full h-full object-cover bg-cover bg-center rounded-tl-2xl rounded-bl-2xl rounded-br-2xl"
                                    src={MissionImage1} alt="Mission Image 1" />

                                <div
                                    className="small absolute top-5 right-[-102px] md:right-[-132px] w-[200px] aspect-[16/12] rounded-tr-lg rounded-bl-lg rounded-br-lg overflow-hidden border-3 border-[var(--secondary-color)]">
                                    <img src={MissionImage2} alt="Mission Image 1"
                                         className="w-full h-full object-cover bg-cover bg-center rounded-tr-lg rounded-bl-lg rounded-br-lg" />
                                </div>
                            </div>
                        </div>
                        <div className="order-md-2 w-full">
                            <div className="heading_wrap heading_wrap2">
                                <span
                                    className="tag text-sm font-medium font-[var(--primary-font)] text-[var(--secondary-color)] bg-[var(--primary-color)] px-5 py-2 rounded-full">OUR
                                    MISSION</span>
                                <h2
                                    className="title text-[38px] font-medium text-left font-[var(--primary-font)] text-[var(--text-1)] uppercase pt-5">
                                    Building a Legacy of Excellence, One Project at a Time
                                </h2>
                                <p
                                    className="paragraph text-base max-w-[590px] leading-5 font-medium !text-left mt-5 text-[var(--text-2)] font-[var(--secondary-font)]">
                                    Our mission is to build not just structures, but relationships.
                                    We aim to exceed expectations by delivering projects on time,
                                    within budget, and to the highest standards of quality.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Our Mission End */}


            {/* Team Start */}
            <div className="team py-10 mt-[80px] bg-[var(--shade-1)] text-center">
                <div className="custom-container">
                    <div className="heading_wrap">
                        <span
                            className="tag text-sm font-medium font-[var(--primary-font)] text-[var(--secondary-color)] bg-[var(--primary-color)] px-5 py-2 rounded-full">OUR
                            PROFESSIONALS</span>
                        <h2 className="title text-[38px] font-medium font-[var(--primary-font)] text-[var(--text-1)] uppercase pt-[20px]">
                            Meet Our Leadership
                        </h2>
                        <p
                            className="paragraph text-base max-w-[590px] leading-5 font-medium mx-auto mt-7 text-[var(--text-2)] font-secondary">
                            Our skilled team combines expertise and passion to deliver
                            exceptional results, building trust and lasting relationships every
                            step of the way.
                        </p>
                    </div>
                    <div className="row grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
                        <div className="team_card_wrapper group">
                            <div className="card_img relative aspect-square rounded-2xl overflow-hidden">
                                <img src={TeamImage1} alt=""
                                     className="w-full h-full object-cover bg-cover bg-center transition-transform duration-400 ease-in-out group-hover:scale-[1.05] group-hover:rotate-1" />
                                <div
                                    className="social absolute bottom-[-50px] left-1/2 transform -translate-x-1/2 flex items-center gap-2 transition-bottom duration-400 ease-in-out group-hover:bottom-5">
                                    <a href="#"
                                       className="relative w-10 h-10 rounded-full bg-[var(--secondary-color)] flex justify-center items-center text-lg text-[var(--text-1)] after:content-[''] after:absolute after:w-0 after:h-0 after:rounded-full after:bg-[var(--primary-color)] after:transition-all after:duration-300 hover:text-[var(--secondary-color)] hover:after:w-10 hover:after:h-10 after:z-[1] z-20"><i
                                        className="fa-brands fa-facebook-f z-30 relative"></i></a>
                                    <a href="#"
                                       className="relative w-10 h-10 rounded-full bg-[var(--secondary-color)] flex justify-center items-center text-lg text-[var(--text-1)] after:content-[''] after:absolute after:w-0 after:h-0 after:rounded-full after:bg-[var(--primary-color)] after:transition-all after:duration-300 hover:text-[var(--secondary-color)] hover:after:w-10 hover:after:h-10 after:z-[1] z-20"><i
                                        className="fa-brands fa-instagram z-30 relative"></i></a>
                                    <a href="#"
                                       className="relative w-10 h-10 rounded-full bg-[var(--secondary-color)] flex justify-center items-center text-lg text-[var(--text-1)] after:content-[''] after:absolute after:w-0 after:h-0 after:rounded-full after:bg-[var(--primary-color)] after:transition-all after:duration-300 hover:text-[var(--secondary-color)] hover:after:w-10 hover:after:h-10 after:z-[1] z-20"><i
                                        className="fa-brands fa-x-twitter z-30 relative"></i></a>
                                    <a href="#"
                                       className="relative w-10 h-10 rounded-full bg-[var(--secondary-color)] flex justify-center items-center text-lg text-[var(--text-1)] after:content-[''] after:absolute after:w-0 after:h-0 after:rounded-full after:bg-[var(--primary-color)] after:transition-all after:duration-300 hover:text-[var(--secondary-color)] hover:after:w-10 hover:after:h-10 after:z-[1] z-20"><i
                                        className="fa-brands fa-linkedin-in z-30 relative"></i></a>
                                </div>
                            </div>
                            <div className="details mt-2">
                                <h3 className="name text-[26px] font-medium font-[var(--primary-font)] text-[var(--text-1)] text-center mt-3">
                                    Engr. Md. Shah Alom (Abir)
                                </h3>
                                <h4 className="profession text-[18px] font-semibold text-[var(--text-1)] text-center mt-1">
                                    Managing Director
                                </h4>
                            </div>
                        </div>
                        <div className="team_card_wrapper group">
                            <div className="card_img relative aspect-square rounded-2xl overflow-hidden">
                                <img src={TeamImage2} alt=""
                                     className="w-full h-full object-cover bg-cover bg-center transition-transform duration-400 ease-in-out group-hover:scale-[1.05] group-hover:rotate-1" />
                                <div
                                    className="social absolute bottom-[-50px] left-1/2 transform -translate-x-1/2 flex items-center gap-2 transition-bottom duration-400 ease-in-out group-hover:bottom-5">
                                    <a href="#"
                                       className="relative w-10 h-10 rounded-full bg-[var(--secondary-color)] flex justify-center items-center text-lg text-[var(--text-1)] after:content-[''] after:absolute after:w-0 after:h-0 after:rounded-full after:bg-[var(--primary-color)] after:transition-all after:duration-300 hover:text-[var(--secondary-color)] hover:after:w-10 hover:after:h-10 after:z-[1] z-20"><i
                                        className="fa-brands fa-facebook-f z-30 relative"></i></a>
                                    <a href="#"
                                       className="relative w-10 h-10 rounded-full bg-[var(--secondary-color)] flex justify-center items-center text-lg text-[var(--text-1)] after:content-[''] after:absolute after:w-0 after:h-0 after:rounded-full after:bg-[var(--primary-color)] after:transition-all after:duration-300 hover:text-[var(--secondary-color)] hover:after:w-10 hover:after:h-10 after:z-[1] z-20"><i
                                        className="fa-brands fa-instagram z-30 relative"></i></a>
                                    <a href="#"
                                       className="relative w-10 h-10 rounded-full bg-[var(--secondary-color)] flex justify-center items-center text-lg text-[var(--text-1)] after:content-[''] after:absolute after:w-0 after:h-0 after:rounded-full after:bg-[var(--primary-color)] after:transition-all after:duration-300 hover:text-[var(--secondary-color)] hover:after:w-10 hover:after:h-10 after:z-[1] z-20"><i
                                        className="fa-brands fa-x-twitter z-30 relative"></i></a>
                                    <a href="#"
                                       className="relative w-10 h-10 rounded-full bg-[var(--secondary-color)] flex justify-center items-center text-lg text-[var(--text-1)] after:content-[''] after:absolute after:w-0 after:h-0 after:rounded-full after:bg-[var(--primary-color)] after:transition-all after:duration-300 hover:text-[var(--secondary-color)] hover:after:w-10 hover:after:h-10 after:z-[1] z-20"><i
                                        className="fa-brands fa-linkedin-in  z-30 relative"></i></a>
                                </div>
                            </div>
                            <div className="details mt-2">
                                <h3 className="name text-[26px] font-medium font-[var(--primary-font)] text-[var(--text-1)] text-center mt-3">
                                    MD. Imran Hossain
                                </h3>
                                <h4 className="profession text-[18px] font-semibold text-[var(--text-1)] text-center mt-1">
                                    Executive Director
                                </h4>
                            </div>
                        </div>
                        {/*<div className="team_card_wrapper group">*/}
                        {/*    <div className="card_img relative aspect-square rounded-2xl overflow-hidden">*/}
                        {/*        <img src={TeamImage3} alt=""*/}
                        {/*             className="w-full h-full object-cover bg-cover bg-center transition-transform duration-400 ease-in-out group-hover:scale-[1.05] group-hover:rotate-1" />*/}
                        {/*        <div*/}
                        {/*            className="social absolute bottom-[-50px] left-1/2 transform -translate-x-1/2 flex items-center gap-2 transition-bottom duration-400 ease-in-out group-hover:bottom-5">*/}
                        {/*            <a href="#"*/}
                        {/*               className="relative w-10 h-10 rounded-full bg-[var(--secondary-color)] flex justify-center items-center text-lg text-[var(--text-1)] after:content-[''] after:absolute after:w-0 after:h-0 after:rounded-full after:bg-[var(--primary-color)] after:transition-all after:duration-300 hover:text-[var(--secondary-color)] hover:after:w-10 hover:after:h-10 after:z-[1] z-20"><i*/}
                        {/*                className="fa-brands fa-facebook-f z-30 relative"></i></a>*/}
                        {/*            <a href="#"*/}
                        {/*               className="relative w-10 h-10 rounded-full bg-[var(--secondary-color)] flex justify-center items-center text-lg text-[var(--text-1)] after:content-[''] after:absolute after:w-0 after:h-0 after:rounded-full after:bg-[var(--primary-color)] after:transition-all after:duration-300 hover:text-[var(--secondary-color)] hover:after:w-10 hover:after:h-10 after:z-[1] z-20"><i*/}
                        {/*                className="fa-brands fa-instagram z-30 relative"></i></a>*/}
                        {/*            <a href="#"*/}
                        {/*               className="relative w-10 h-10 rounded-full bg-[var(--secondary-color)] flex justify-center items-center text-lg text-[var(--text-1)] after:content-[''] after:absolute after:w-0 after:h-0 after:rounded-full after:bg-[var(--primary-color)] after:transition-all after:duration-300 hover:text-[var(--secondary-color)] hover:after:w-10 hover:after:h-10 after:z-[1] z-20"><i*/}
                        {/*                className="fa-brands fa-x-twitter z-30 relative"></i></a>*/}
                        {/*            <a href="#"*/}
                        {/*               className="relative w-10 h-10 rounded-full bg-[var(--secondary-color)] flex justify-center items-center text-lg text-[var(--text-1)] after:content-[''] after:absolute after:w-0 after:h-0 after:rounded-full after:bg-[var(--primary-color)] after:transition-all after:duration-300 hover:text-[var(--secondary-color)] hover:after:w-10 hover:after:h-10 after:z-[1] z-20"><i*/}
                        {/*                className="fa-brands fa-linkedin-in  z-30 relative"></i></a>*/}
                        {/*        </div>*/}
                        {/*    </div>*/}
                        {/*    <div className="details mt-2">*/}
                        {/*        <h3 className="name text-[26px] font-medium font-[var(--primary-font)] text-[var(--text-1)] text-center mt-3">*/}
                        {/*            Imrul Hossain*/}
                        {/*        </h3>*/}
                        {/*        <h4 className="profession text-[18px] font-semibold text-[var(--text-1)] text-center mt-1">*/}
                        {/*            Project Manager*/}
                        {/*        </h4>*/}
                        {/*    </div>*/}
                        {/*</div>*/}
                    </div>
                </div>
            </div>
            {/* Team End */}


            {/* Our Gallery Start */}
            <div className="our_gallery pt-[80px]">
                <div className="custom-container">
                    {/* Image Grid */}
                    <div className="flex flex-col lg:flex-row gap-[20px]">
                        <div className="w-full lg:w-2/3 flex flex-col gap-[20px] items-stretch">
                            <div className="heading_wrap mb-[40px]">
                                <span
                                    className="tag text-base font-medium font-[var(--primary-font)] text-[var(--secondary-color)] bg-[var(--primary-color)] py-[5px] px-[20px] rounded-[30px]">
                                    OUR GALLERY
                                </span>
                                <h2
                                    className="title text-[38px] font-medium max-w-[80%] font-[var(--primary-font)] text-[var(--text-1)] pt-[20px] uppercase m-0">
                                    Our Journey in Pictures, Showcasing Our Craftsmanship
                                </h2>
                            </div>
                            <div className="flex flex-col lg:flex-row gap-[20px]">
                                <div className="w-full lg:w-1/2">
                                    <div className="group1 w-full rounded-[24px] overflow-hidden transition-[0.4s] aspect-[16/16]">
                                        <img src={GalleryImage1} alt="Image 2"
                                             className="img-fluid rounded w-full h-full hover:scale-[1.05] hover:rotate-1 object-cover bg-center bg-cover transition-all duration-[0.4s]" />
                                    </div>
                                </div>
                                <div className="w-full lg:w-1/2">
                                    <div className="group1 w-full rounded-[24px] overflow-hidden transition-[0.4s] aspect-[16/16]">
                                        <img src={GalleryImage2} alt="Image 2"
                                             className="img-fluid rounded w-full h-full hover:scale-[1.05] hover:rotate-1 object-cover bg-center bg-cover transition-all duration-[0.4s]" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="w-full lg:w-1/3 flex items-stretch">
                            <div className="flex gap-[20px] flex-wrap">
                                <div className="w-full">
                                    <div className="group2 w-full h-full rounded-[24px] overflow-hidden transition-[0.4s]">
                                        <img src={GalleryImage3} alt="Image 2"
                                             className="img-fluid rounded w-full h-full hover:scale-[1.05] hover:rotate-1 object-cover bg-center bg-cover transition-all duration-[0.4s]" />
                                    </div>
                                </div>
                                <div className="w-full">
                                    <div className="group2 w-full h-full rounded-[24px] overflow-hidden transition-[0.4s]">
                                        <img src={GalleryImage4} alt="Image 2"
                                             className="img-fluid rounded w-full h-full hover:scale-[1.05] hover:rotate-1 object-cover bg-center bg-cover transition-all duration-[0.4s]" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Our Gallery End */}

        </>
    );
};

export default About;