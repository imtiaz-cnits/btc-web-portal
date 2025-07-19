import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import api from '../../api/index.js';
import { Helmet } from 'react-helmet';
import { useGsapAnimation, gsapAnimations, useClientScroller } from '../assets/js/style.js';
import HeroImage from '../assets/img/home/hero-img1.png';
import AboutImage from '../assets/img/home/about-image.png';
import ProjectImage1 from '../assets/img/home/project-img1.png';
import ProjectImage2 from '../assets/img/home/project-img2.png';
import ProjectImage3 from '../assets/img/home/project-img3.png';
import ProjectImage4 from '../assets/img/home/project-img4.png';
import ProjectImage5 from '../assets/img/home/project-img5.png';
import ProjectImage6 from '../assets/img/home/project-img6.png';
import ProjectImage7 from '../assets/img/home/project-img7.png';
import ProjectImage8 from '../assets/img/home/project-img8.png';
import ProjectImage9 from '../assets/img/home/project-img9.png';
import ClientLogo1 from '../assets/img/home/client-logo1.png';
import ClientLogo2 from '../assets/img/home/client-logo2.png';
import ClientLogo3 from '../assets/img/home/client-logo3.png';
import ClientLogo4 from '../assets/img/home/client-logo4.png';
import ClientLogo5 from '../assets/img/home/client-logo5.png';
import ClientLogo6 from '../assets/img/home/client-logo6.png';
import ClientLogo7 from '../assets/img/home/client-logo7.png';
import ClientLogo8 from '../assets/img/home/client-logo8.png';
import ClientLogo9 from '../assets/img/home/client-logo9.png';
import ClientLogo10 from '../assets/img/home/client-logo10.png';
import ClientLogo11 from '../assets/img/home/client-logo11.png';
import ClientLogo12 from '../assets/img/home/client-logo12.png';

const Home = () => {
    const [tenderNotices, setTenderNotices] = useState([]);
    const [winnerNotices, setWinnerNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const navigate = useNavigate();
    const tenderNoticeBoardRef = useRef(null);
    const winnerNoticeBoardRef = useRef(null);
    const heroThemeRef = useRef(null);
    const counterStatsRef = useRef(null);
    const aboutStatsRef = useRef(null);

    // Updated useVerticalNotice hook for infinite scrolling
    const useVerticalNotice = (notices, boardType) => {
        const noticeRef = useRef(null);
        const timelineRef = useRef(null);

        useEffect(() => {
            if (!noticeRef.current || !notices || notices.length === 0) {
                return;
            }

            const items = noticeRef.current.children;
            if (items.length === 0) {
                return;
            }

            // Clone items for seamless infinite scrolling
            const container = noticeRef.current;

            // Calculate heights
            const itemHeight = items[0].offsetHeight + 1; // Include border
            const totalHeight = itemHeight * notices.length;

            // Set initial positioning
            gsap.set(container, { position: 'relative', y: 0 });

            // Create GSAP timeline for infinite scrolling
            if (timelineRef.current) {
                timelineRef.current.kill();
            }
            timelineRef.current = gsap.timeline({ repeat: -1 })
                .to(container, {
                    y: -totalHeight,
                    duration: notices.length * 3,
                    ease: 'none',
                    modifiers: {
                        y: gsap.utils.unitize((y) => {
                            const value = parseFloat(y) % totalHeight;
                            return value <= -totalHeight ? 0 : value;
                        }),
                    },
                });

            return () => {
                if (timelineRef.current) {
                    timelineRef.current.kill();
                }
                // Clean up clones
                while (container.children.length > notices.length) {
                    container.removeChild(container.lastChild);
                }
            };
        }, [notices, boardType]);

        const handleMouseEnter = () => {
            if (timelineRef.current) {
                timelineRef.current.pause();
            }
        };

        const handleMouseLeave = () => {
            if (timelineRef.current) {
                timelineRef.current.play();
            }
        };

        return { noticeRef, handleMouseEnter, handleMouseLeave };
    };

    // Fetch tender notices and winner notices from backend
    useEffect(() => {
        const fetchTenderNotices = async () => {
            try {
                const response = await api.get('/notices');
                if (!response.data || typeof response.data !== 'object') {
                    throw new Error('Invalid response format from /notices');
                }
                if (response.data.success) {
                    const notices = response.data.notices || response.data.data || [];
                    if (!Array.isArray(notices)) {
                        throw new Error('Notices data is not an array');
                    }
                    const formattedNotices = notices.map(notice => ({
                        id: notice._id,
                        date: notice.publishDate
                            ? new Date(notice.publishDate).toLocaleDateString('en-US', {
                                day: '2-digit',
                                month: 'short',
                            }).replace(/,/, '')
                            : 'N/A',
                        title: notice.title || 'Untitled Notice',
                        link: `/view-egp-notice/${notice._id}`,
                        filePath: notice.filePath,
                        content: notice.content,
                        fileType: notice.fileType || (notice.filePath && typeof notice.filePath === 'string'
                            ? notice.filePath.toLowerCase().endsWith('.pdf') ? 'pdf'
                                : ['.jpg', '.jpeg', '.png', '.gif'].some(ext => notice.filePath.toLowerCase().endsWith(ext)) ? 'image'
                                    : 'unknown'
                            : notice.content && typeof notice.content === 'string' && notice.content.trim() ? 'content' : 'none'),
                    }));
                    setTenderNotices(formattedNotices);
                } else {
                    throw new Error(response.data.message || 'Failed to fetch tender notices');
                }
            } catch (err) {
                console.error('Error fetching tender notices:', err.message);
                setError(err.message || 'Failed to load tender notices. Please try again later.');
            }
        };

        const fetchWinnerNotices = async () => {
            try {
                const response = await api.get('/winner-list');
                if (!response.data || typeof response.data !== 'object') {
                    throw new Error('Invalid response format from /winner-list');
                }
                if (response.data.success) {
                    const winners = response.data.notices || response.data.data || [];
                    if (!Array.isArray(winners)) {
                        throw new Error('Winners data is not an array');
                    }
                    const formattedWinners = winners.map(winner => ({
                        id: winner._id,
                        date: winner.publishDate
                            ? new Date(winner.publishDate).toLocaleDateString('en-US', {
                                day: '2-digit',
                                month: 'short',
                            }).replace(/,/, '')
                            : 'N/A',
                        title: winner.title || 'Untitled Winner',
                        link: `/view-winner-notice/${winner._id}`,
                        filePath: winner.filePath,
                        content: winner.content,
                        fileType: winner.fileType || (winner.filePath && typeof winner.filePath === 'string'
                            ? winner.filePath.toLowerCase().endsWith('.pdf') ? 'pdf'
                                : ['.jpg', '.jpeg', '.png', '.gif'].some(ext => winner.filePath.toLowerCase().endsWith(ext)) ? 'image'
                                    : 'unknown'
                            : winner.content && typeof winner.content === 'string' && winner.content.trim() ? 'content' : 'none'),
                    }));
                    setWinnerNotices(formattedWinners);
                } else {
                    throw new Error(response.data.message || 'Failed to fetch winner notices');
                }
            } catch (err) {
                console.error('Error fetching winner notices:', err.message);
                setError(err.message || 'Failed to load winner notices. Please try again later.');
            }
        };

        const fetchAll = async () => {
            setLoading(true);
            await Promise.all([fetchTenderNotices(), fetchWinnerNotices()]);
            setLoading(false);
        };

        fetchAll();
    }, [navigate]);

    // Handle viewing file or content
    const handleViewFile = (filePath, fileType, id, content, contentType) => {
        if (filePath) {
            const normalizedPath = typeof filePath === 'string' ? (filePath.startsWith('/') ? filePath : `/${filePath}`).trim() : null;
            if (normalizedPath) {
                const fileUrl = `https://egpbtc.com${normalizedPath}`;
                const isSupported = fileType === 'pdf' || fileType === 'image' ||
                    (normalizedPath.toLowerCase().endsWith('.pdf') ||
                        ['.jpg', '.jpeg', '.png', '.gif'].some(ext => normalizedPath.toLowerCase().endsWith(ext)));
                if (isSupported) {
                    window.open(fileUrl, '_blank');
                    return;
                }
            }
        }
        if (content && typeof content === 'string' && content.trim() && id) {
            const route = contentType === 'winner' ? `/view-winner-notice/${id}` : `/view-egp-notice/${id}`;
            window.open(route, '_blank');
        } else {
            alert('No file or valid content available to view.');
        }
    };

    // Use separate hooks for each notice board
    const { noticeRef: tenderNoticeRef, handleMouseEnter: tenderMouseEnter, handleMouseLeave: tenderMouseLeave } = useVerticalNotice(tenderNotices, 'tender');
    const { noticeRef: winnerNoticeRef, handleMouseEnter: winnerMouseEnter, handleMouseLeave: winnerMouseLeave } = useVerticalNotice(winnerNotices, 'winner');

    // Use custom hook for GSAP animations
    useGsapAnimation(gsapAnimations);

    // Use custom hook for clients slider scroller
    const { scrollerRefs } = useClientScroller();

    // Register GSAP and ScrollTrigger plugins
    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger);

        let triggers = [];

        // CounterWrapper Section Animation
        const counterNumbers = counterStatsRef.current?.querySelectorAll('.numbers');
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

        // About Section Animation
        const aboutCounters = aboutStatsRef.current?.querySelectorAll('.counters');
        if (aboutCounters && aboutCounters.length > 0) {
            aboutCounters.forEach((counter) => {
                const trigger = ScrollTrigger.create({
                    trigger: aboutStatsRef.current,
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
                <title>Home | Building Technology & Consultant</title>
                <meta name="description" content="Welcome to Building Technology & Consultant. View our latest notices and explore our services." />
                <meta name="keywords" content="building technology, consultant, notices, services" />
            </Helmet>

            {/* Hero Section Start */}
            <div className="hero bg-[var(--secondary-color)] overflow-hidden pt-[60px]">
                <div className="custom-container mx-auto">
                    <div className="flex flex-wrap">
                        <div className="w-full lg:w-1/2">
                            <div className="theame" ref={heroThemeRef}>
                                <div className="flex justify-center lg:justify-start items-center gap-[10px] mb-[20px]">
                                    <h1 className="text-[16px] font-[var(--primary-font)] text-[var(--text-1)] bg-[var(--shade-1)] px-[20px] py-[5px] rounded-[30px]">
                                        Your Safe Innovation
                                    </h1>
                                </div>
                                <h1 className="text-[38px] lg:text-[52px] text-center lg:text-left font-bold text-[var(--text-1)] mb-[20px] uppercase">
                                    Welcome to the
                                    <span className="text-[var(--primary-color)]"> Building Technology </span>
                                    & Consultant
                                    <span className="text-[var(--primary-color)]"> !!!</span>
                                </h1>
                                <div className="lg:w-[92%] w-[100%] overflow-hidden rounded-[24px_0px_24px_24px]">
                                    <img src={HeroImage} alt="Hero Image" className="w-full object-cover" />
                                </div>
                            </div>
                        </div>
                        <div className="w-full lg:w-1/2 overflow-hidden mt-[40px] lg:mt-[0px]">
                            {/* EGP Tender Notices */}
                            <div
                                className="tender-notice-board w-full bg-[var(--secondary-color)] border border-[var(--ac-1)] rounded-3xl overflow-hidden p-0 h-[350px] flex flex-col"
                                ref={tenderNoticeBoardRef}
                                onMouseEnter={tenderMouseEnter}
                                onMouseLeave={tenderMouseLeave}
                            >
                                <h3 className="header bg-[var(--primary-color)] text-[var(--secondary-color)] font-[var(--primary-font)] text-center py-2.5 px-4 text-[22px] font-medium mb-0">
                                    EGP TENDER NOTICES
                                </h3>
                                <div className="notice_item h-[calc(350px-80px)] overflow-y-auto">
                                    {loading ? (
                                        <div className="flex justify-center items-center h-full">
                                            <p className="text-[var(--text-2)] text-base">Loading notices...</p>
                                        </div>
                                    ) : error ? (
                                        <div className="flex justify-center items-center h-full">
                                            <p className="text-[var(--text-2)] text-base">{error}</p>
                                        </div>
                                    ) : tenderNotices.length === 0 ? (
                                        <div className="flex justify-center items-center h-full">
                                            <p className="text-[var(--text-2)] text-base">No tender notices available.</p>
                                        </div>
                                    ) : (
                                        <ul className="tender-notices overflow-y-hidden relative" ref={tenderNoticeRef}>
                                            {tenderNotices.map((notice) => (
                                                <li
                                                    key={notice.id}
                                                    className="notice flex items-center border-b border-[var(--ac-1)] py-4 mx-5"
                                                >
                                                    <div className="date relative w-[52px] h-[52px]">
                                                        <div className="day absolute top-[-12px] left-[12px] text-[var(--secondary-color)] font-[var(--primary-font)] font-medium text-[26px] z-[2]">
                                                            {notice.date.split(' ')[1]}
                                                        </div>
                                                        <div className="month absolute top-[18px] left-[12px] font-medium font-[var(--secondary-font)] text-[var(--secondary-color)] text-base z-[2]">
                                                            {notice.date.split(' ')[0]}
                                                        </div>
                                                    </div>
                                                    <div
                                                        className="content leading-[18px] flex-1 cursor-pointer"
                                                        onClick={() => handleViewFile(notice.filePath, notice.fileType, notice.id, notice.content, 'notice')}
                                                        role="button"
                                                        tabIndex={0}
                                                        aria-label={`Read more about ${notice.title}`}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter' || e.key === ' ') {
                                                                handleViewFile(notice.filePath, notice.fileType, notice.id, notice.content, 'notice');
                                                            }
                                                        }}
                                                    >
                                                        <span className="text-[var(--text-2, #666)] text-base font-[var(--secondary-font)] font-medium transition duration-300 hover:text-[var(--primary-color)] hover:underline">
                                                            {notice.title}
                                                        </span>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                                <div className="button text-center py-3 bg-[var(--secondary-color)]">
                                    <Link
                                        to="/egp-notice"
                                        className="view_note_btn cursor-pointer relative inline-flex items-center justify-center px-8 py-2.5 overflow-hidden tracking-tighter text-[var(--secondary-color)] bg-[var(--primary-color)] rounded-tl-0 rounded-tr-lg rounded-bl-lg rounded-br-lg group"
                                    >
                                        <span className="absolute bottom-0 left-0 right-0 h-0 transition-all duration-500 ease-out bg-[var(--text-1)] group-hover:h-full"></span>
                                        <span className="relative text-base font-semibold">VIEW ALL NOTICE</span>
                                    </Link>
                                </div>
                            </div>

                            {/* Winner List */}
                            <div
                                className="winner-notice-board w-full bg-[var(--secondary-color)] border border-[var(--ac-1)] rounded-3xl overflow-hidden p-0 mt-3 h-[350px] flex flex-col"
                                ref={winnerNoticeBoardRef}
                                onMouseEnter={winnerMouseEnter}
                                onMouseLeave={winnerMouseLeave}
                            >
                                <h3 className="header bg-[var(--primary-color)] text-[var(--secondary-color)] font-[var(--primary-font)] text-center py-2.5 px-4 text-[22px] font-medium mb-0">
                                    WINNER LIST
                                </h3>
                                <div className="notice_item h-[calc(350px-80px)] overflow-y-auto">
                                    {loading ? (
                                        <div className="flex justify-center items-center h-full">
                                            <p className="text-[var(--text-2)] text-base">Loading winners...</p>
                                        </div>
                                    ) : error ? (
                                        <div className="flex justify-center items-center h-full">
                                            <p className="text-[var(--text-2)] text-base">{error}</p>
                                        </div>
                                    ) : winnerNotices.length === 0 ? (
                                        <div className="flex justify-center items-center h-full">
                                            <p className="text-[var(--text-2)] text-base">No winners available.</p>
                                        </div>
                                    ) : (
                                        <ul className="winner-notices overflow-y-hidden relative" ref={winnerNoticeRef}>
                                            {winnerNotices.map((winner) => (
                                                <li
                                                    key={winner.id}
                                                    className="notice flex items-center border-b border-[var(--ac-1)] py-4 mx-5"
                                                >
                                                    <div className="date relative w-[52px] h-[52px]">
                                                        <div className="day absolute top-[-12px] left-[12px] text-[var(--secondary-color)] font-[var(--primary-font)] font-medium text-[26px] z-[2]">
                                                            {winner.date.split(' ')[1]}
                                                        </div>
                                                        <div className="month absolute top-[18px] left-[12px] font-medium font-[var(--secondary-font)] text-[var(--secondary-color)] text-base z-[2]">
                                                            {winner.date.split(' ')[0]}
                                                        </div>
                                                    </div>
                                                    <div
                                                        className="content leading-[18px] flex-1 cursor-pointer"
                                                        onClick={() => handleViewFile(winner.filePath, winner.fileType, winner.id, winner.content, 'winner')}
                                                        role="button"
                                                        tabIndex={0}
                                                        aria-label={`Read more about ${winner.title}`}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter' || e.key === ' ') {
                                                                handleViewFile(winner.filePath, winner.fileType, winner.id, winner.content, 'winner');
                                                            }
                                                        }}
                                                    >
                                                        <span className="text-[var(--text-2, #666)] text-base font-[var(--secondary-font)] font-medium transition duration-300 hover:text-[var(--primary-color)] hover:underline">
                                                            {winner.title}
                                                        </span>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                                <div className="button text-center py-3 bg-[var(--secondary-color)]">
                                    <Link
                                        to="/winner-list"
                                        className="view_note_btn cursor-pointer relative inline-flex items-center justify-center px-8 py-2.5 overflow-hidden tracking-tighter text-[var(--secondary-color)] bg-[var(--primary-color)] rounded-tl-0 rounded-tr-lg rounded-bl-lg rounded-br-lg group"
                                    >
                                        <span className="absolute bottom-0 left-0 right-0 h-0 transition-all duration-500 ease-out bg-[var(--text-1)] group-hover:h-full"></span>
                                        <span className="relative text-base font-semibold">VIEW ALL WINNERS</span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .tender-notice-board, .winner-notice-board {
                    display: flex;
                    flex-direction: column;
                    height: 350px;
                }
                .tender-notice-board .notice_item, .winner-notice-board .notice_item {
                    flex: 1;
                    overflow-y: hidden;
                    overflow-x: hidden;
                }
                .tender-notice-board .button, .winner-notice-board .button {
                    flex-shrink: 0;
                    background-color: var(--secondary-color);
                    padding: 12px 0;
                }
                .tender-notice-board .notice .date,
                .winner-notice-board .notice .date {
                    position: relative;
                    width: 52px;
                    height: 52px;
                    background: linear-gradient(90deg, #5aa469 50%, transparent 50%),
                        linear-gradient(90deg, #5aa469 50%, transparent 50%),
                        linear-gradient(0deg, #5aa469 50%, transparent 50%),
                        linear-gradient(0deg, #5aa469 50%, transparent 50%);
                    background-repeat: repeat-x, repeat-x, repeat-y, repeat-y;
                    background-size: 9px 2px, 9px 2px, 2px 9px, 2px 9px;
                    background-position: 0% 0%, 100% 100%, 0% 100%, 100% 0px;
                    border-radius: 12px 12px 12px 0px;
                    padding: 10px;
                    margin-right: 20px;
                    margin-top: 10px;
                    z-index: 1;
                    animation: dash 5s linear infinite;
                }
                .tender-notice-board .notice .date::before,
                .winner-notice-board .notice .date::before {
                    content: "";
                    position: absolute;
                    top: -10px;
                    left: 10px;
                    width: 50px;
                    height: 50px;
                    border-radius: 12px 12px 12px 0px;
                    background-color: var(--primary-color);
                    z-index: -1;
                }
                .tender-notice-board .notice .day,
                .winner-notice-board .notice .day {
                    position: absolute;
                    top: -12px;
                    left: 12px;
                    text-align: center;
                    width: 100%;
                    color: var(--secondary-color);
                    font-family: var(--primary-font);
                    font-weight: medium;
                    font-size: 26px;
                    z-index: 2;
                }
                .tender-notice-board .notice .month,
                .winner-notice-board .notice .month {
                    position: absolute;
                    top: 18px;
                    left: 12px;
                    text-align: center;
                    width: 100%;
                    color: var(--secondary-color);
                    font-family: var(--secondary-font);
                    font-weight: medium;
                    font-size: 16px;
                    z-index: 2;
                }
                .tender-notices,
                .winner-notices {
                    position: relative;
                    width: 100%;
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }
                .tender-notice-board .notice,
                .winner-notice-board .notice {
                    display: flex;
                    align-items: center;
                    width: 100%;
                    padding: 12px 0;
                }
                .tender-notice-board .content,
                .winner-notice-board .content {
                    flex: 1;
                    padding-left: 10px;
                    padding-right: 26px;
                    min-width: 0;
                }
            `}</style>
            {/* Hero Section End */}


            {/* We Offer Start */}
            <div id="services" className="offer pt-[80px]">
                <div className="custom-container mx-auto px-4">
                    <div
                        className="offer_wrapper relative bg-[var(--shade-1)] lg:rounded-[80px] rounded-[40px] lg:py-[40px] py-[20px] lg:px-[20px] overflow-hidden">
                        {/* Shape 1 SVG */}
                        <div className="shape1 absolute left-[-20px] top-[30px]">
                            <svg width="179" height="243" viewBox="0 0 179 243" fill="none"
                                 xmlns="http://www.w3.org/2000/svg">
                                <g clipPath="url(#clip0_194_180)">
                                    <path
                                        d="M-26.3793 167.237C-27.7616 166.918 -28.6217 165.542 -28.3029 164.16C-26.3354 155.63 -31.672 147.093 -40.2016 145.126C-48.7313 143.158 -57.268 148.495 -59.2355 157.025C-59.5543 158.407 -60.9302 159.267 -62.3125 158.948C-63.6948 158.629 -64.555 157.253 -64.2361 155.871L-40.781 54.1864C-38.1775 42.8992 -26.8803 35.8369 -15.5931 38.4405C-4.30591 41.044 2.75641 52.3413 0.152851 63.6284L-23.3022 165.313C-23.6211 166.695 -24.997 167.556 -26.3793 167.237ZM-39.0482 140.125C-32.8795 141.548 -27.9687 145.57 -25.214 150.769L-4.8478 62.475C-2.8803 53.9453 -8.21688 45.4086 -16.7466 43.4411C-25.2762 41.4736 -33.8129 46.8102 -35.7804 55.3399L-56.1466 143.634C-51.3932 140.167 -45.2168 138.702 -39.0482 140.125Z"
                                        fill="#d1ffc8"/>
                                    <path
                                        d="M101.779 215.721C100.397 215.402 99.5369 214.026 99.8558 212.644L126.878 95.4928L-0.423882 66.1287L-23.3022 165.313C-23.6211 166.695 -24.997 167.555 -26.3793 167.237C-27.7616 166.918 -28.6217 165.542 -28.3029 164.16C-26.3354 155.63 -31.672 147.093 -40.2016 145.126C-48.7313 143.158 -57.268 148.495 -59.2355 157.024C-61.203 165.554 -55.8664 174.091 -47.3367 176.058L88.6345 207.422C90.0169 207.741 90.877 209.117 90.5581 210.499C90.2393 211.881 88.8634 212.742 87.4811 212.423L-48.4902 181.059C-59.7738 178.456 -66.8397 167.158 -64.2361 155.871C-61.6326 144.584 -50.3318 137.522 -39.0482 140.125C-32.8795 141.548 -27.9687 145.57 -25.214 150.769L-4.8478 62.4749C-4.52894 61.0926 -3.15306 60.2325 -1.77074 60.5513L130.532 91.0689C131.914 91.3878 132.775 92.7637 132.456 94.146L104.856 213.797C104.538 215.18 103.162 216.04 101.779 215.721Z"
                                        fill="#d1ffc8"/>
                                    <path
                                        d="M25.5327 115.386L1.09021 109.748C-0.29211 109.429 -1.15223 108.053 -0.833375 106.671L4.80464 82.2284C5.12349 80.846 6.49938 79.9859 7.8817 80.3048L32.3242 85.9428C33.7065 86.2616 34.5666 87.6375 34.2478 89.0198L28.6097 113.462C28.2909 114.845 26.9114 115.704 25.5327 115.386ZM4.74401 105.324L24.1858 109.809L28.6704 90.3667L9.22855 85.8822L4.74401 105.324Z"
                                        fill="#d1ffc8"/>
                                    <path
                                        d="M32.6784 181.006L14.1653 176.736C12.783 176.417 11.9229 175.041 12.2417 173.659C12.5606 172.276 13.9364 171.416 15.3188 171.735L31.3316 175.429L40.6961 134.83L0.0979917 125.466L-9.26657 166.064L-5.93042 166.834C-4.5481 167.152 -3.68798 168.528 -4.00683 169.911C-4.32568 171.293 -5.70157 172.153 -7.08389 171.834L-12.9204 170.488C-14.3027 170.169 -15.1628 168.793 -14.844 167.411L-4.32592 121.812C-4.00707 120.43 -2.63118 119.57 -1.24886 119.889L44.3499 130.407C45.7322 130.725 46.5924 132.101 46.2735 133.484L35.7555 179.082C35.4374 180.461 34.0607 181.325 32.6784 181.006Z"
                                        fill="#d1ffc8"/>
                                    <path
                                        d="M2.35662 174.012C1.69582 173.859 1.11468 173.443 0.757441 172.872C0.67033 172.727 0.592012 172.578 0.534847 172.418C0.476859 172.261 0.43123 172.1 0.402364 171.932C0.376246 171.768 0.366063 171.6 0.370992 171.432C0.372349 171.263 0.39596 171.095 0.433036 170.935C0.470936 170.77 0.523125 170.609 0.59592 170.457C0.665143 170.304 0.74783 170.157 0.843156 170.021C0.942054 169.886 1.05442 169.758 1.17502 169.642C1.29563 169.527 1.43245 169.423 1.57311 169.335C2.14539 168.975 2.8493 168.859 3.5101 169.011C4.16733 169.163 4.7493 169.575 5.10928 170.151C5.19722 170.292 5.27115 170.444 5.33271 170.601C5.3907 170.758 5.4355 170.922 5.46162 171.086C5.4913 171.251 5.50149 171.419 5.49656 171.587C5.49163 171.755 5.47159 171.924 5.43369 172.088C5.39661 172.249 5.34085 172.409 5.27163 172.562C5.20241 172.716 5.11972 172.862 5.02082 172.997C4.92467 173.137 4.81314 173.262 4.69253 173.377C4.56753 173.495 4.4351 173.596 4.29361 173.687C3.71859 174.044 3.01385 174.163 2.35662 174.012Z"
                                        fill="#d1ffc8"/>
                                    <path
                                        d="M100.314 132.635L35.784 117.751C34.4017 117.432 33.5416 116.056 33.8604 114.673L39.4984 90.231C39.8173 88.8487 41.1932 87.9886 42.5755 88.3074L74.151 95.5908C75.5334 95.9097 76.3935 97.2856 76.0746 98.6679C75.7558 100.05 74.3799 100.91 72.9976 100.591L43.9224 93.8848L39.4378 113.327L98.967 127.058L103.452 107.616L91.9072 104.953C90.5248 104.634 89.6647 103.259 89.9836 101.876C90.3024 100.494 91.6783 99.6337 93.0606 99.9526L107.105 103.192C108.488 103.511 109.348 104.887 109.029 106.269L103.391 130.712C103.072 132.094 101.696 132.954 100.314 132.635Z"
                                        fill="#d1ffc8"/>
                                    <path
                                        d="M81.8765 102.643C81.7122 102.605 81.552 102.55 81.3987 102.48C81.2453 102.411 81.0989 102.329 80.9637 102.23C80.8277 102.134 80.6993 102.022 80.5842 101.901C80.4699 101.777 80.3652 101.644 80.2773 101.503C80.1866 101.358 80.1118 101.209 80.0547 101.049C79.9931 100.892 79.9511 100.732 79.9214 100.567C79.8961 100.4 79.8823 100.231 79.8864 100.066C79.8922 99.8946 79.9122 99.7262 79.9493 99.5654C79.9872 99.4011 80.043 99.2409 80.1122 99.0876C80.1814 98.9343 80.2677 98.7887 80.363 98.6527C80.4619 98.5175 80.5707 98.3883 80.6949 98.274C80.8155 98.1589 80.9487 98.0542 81.0929 97.9671C81.2336 97.8791 81.3869 97.8016 81.5432 97.7436C81.6996 97.6857 81.8641 97.6409 82.029 97.6112C82.193 97.585 82.3609 97.5749 82.5291 97.5798C82.8662 97.5861 83.1984 97.6627 83.5042 97.8047C83.6575 97.8739 83.8039 97.9566 83.94 98.052C84.0751 98.1509 84.2035 98.2632 84.3186 98.3838C84.4337 98.5044 84.5376 98.6412 84.6256 98.7819C84.7171 98.9234 84.791 99.0759 84.8525 99.233C84.9105 99.3894 84.9518 99.5531 84.9814 99.718C85.0076 99.882 85.0213 100.051 85.0164 100.219C85.0115 100.387 84.9879 100.555 84.95 100.719C84.9129 100.88 84.8607 101.041 84.7906 101.198C84.7222 101.347 84.636 101.493 84.5398 101.633C84.4409 101.768 84.333 101.893 84.2124 102.008C84.0874 102.126 83.9549 102.227 83.8099 102.318C83.6692 102.406 83.5167 102.48 83.3596 102.542C83.2033 102.599 83.0387 102.644 82.8746 102.67C82.7098 102.7 82.5419 102.71 82.3738 102.705C82.2056 102.7 82.0372 102.68 81.8765 102.643Z"
                                        fill="#d1ffc8"/>
                                    <path
                                        d="M61.5881 188.92L47.9077 185.764C46.5254 185.445 45.6653 184.069 45.9841 182.687L56.7749 135.906C57.0937 134.524 58.4696 133.663 59.8519 133.982L73.5323 137.138C74.9146 137.457 75.7747 138.833 75.4559 140.215L64.6643 187C64.3463 188.378 62.9704 189.238 61.5881 188.92ZM51.5651 181.341L60.2448 183.343L69.8821 141.563L61.2024 139.56L51.5651 181.341Z"
                                        fill="#d1ffc8"/>
                                    <path
                                        d="M86.0305 194.558L72.3502 191.402C70.9678 191.083 70.1077 189.707 70.4266 188.325L81.2173 141.544C81.5362 140.162 82.9121 139.302 84.2944 139.62L97.9747 142.776C99.3571 143.095 100.217 144.471 99.8983 145.853L89.1068 192.638C88.7887 194.016 87.4128 194.877 86.0305 194.558ZM76.004 186.978L84.6837 188.98L94.3209 147.2L85.6412 145.198L76.004 186.978Z"
                                        fill="#d1ffc8"/>
                                </g>
                                <defs>
                                    <clipPath id="clip0_194_180">
                                        <rect width="201.667" height="201.667" fill="white"
                                              transform="translate(-18.2546 0.777832) rotate(12.9889)"/>
                                    </clipPath>
                                </defs>
                            </svg>
                        </div>

                        {/* Shape 2 SVG */}
                        <div className="shape2 absolute right-[-20px] top-[30px]">
                            <svg width="215" height="320" viewBox="0 0 215 320" fill="none"
                                 xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M174.169 75.0566C181.229 71.9611 189.487 75.185 192.583 82.2453C195.678 89.3056 192.454 97.5636 185.394 100.659C178.334 103.755 170.076 100.531 166.98 93.4704C163.885 86.4101 167.109 78.1521 174.169 75.0566ZM183.831 97.0933C188.93 94.8576 191.253 88.9078 189.017 83.8087C186.781 78.7096 180.831 76.3868 175.732 78.6224C170.633 80.858 168.31 86.8079 170.546 91.907C172.782 97.0061 178.732 99.3289 183.831 97.0933Z"
                                    fill="#d1ffc8"/>
                                <path
                                    d="M33.8285 168.514L46.3915 129.293C46.4115 129.242 46.4115 129.242 46.4472 129.226C46.5073 129.072 46.583 128.954 46.6587 128.836C46.7344 128.718 46.7901 128.651 46.8301 128.548C46.8658 128.533 46.8501 128.497 46.8858 128.481L152.77 27.8972C153.227 27.4844 154.354 27.245 154.76 27.4921L222.361 51.8442C222.685 52 222.839 52.0601 223.039 52.2271C223.276 52.3785 223.39 52.5412 223.649 52.9378L235.115 79.2847C235.146 79.356 235.126 79.4073 235.157 79.4786L243.85 99.3045L249.912 96.6468C253.192 95.2084 257.075 96.6946 258.529 100.011L269.644 125.364C271.083 128.644 269.596 132.527 266.28 133.981L249.378 141.391C246.098 142.829 242.215 141.343 240.761 138.027L229.646 112.674C228.207 109.394 229.694 105.511 233.01 104.057L240.32 100.852L232.331 82.631L215.892 89.8382L216.815 91.942C218.738 96.3279 216.735 101.457 212.349 103.38L209.568 104.599L262.879 226.193L268.478 223.739C273.22 221.659 278.795 223.806 280.89 228.585L283.313 234.112L306.883 223.778C307.882 223.34 309.01 223.781 309.448 224.779C309.886 225.777 309.445 226.906 308.447 227.344L195.197 276.996C194.198 277.434 193.07 276.994 192.632 275.995C192.195 274.997 192.635 273.868 193.634 273.431L217.168 263.112L214.745 257.585C212.665 252.843 214.812 247.268 219.59 245.173L225.224 242.703L171.913 121.109L169.132 122.328C164.746 124.251 159.617 122.249 157.694 117.863L157.647 117.756L76.9173 153.151L91.1127 185.528L92.2181 185.043C93.6088 184.434 95.1582 184.477 96.5187 185.156C97.8792 185.835 98.8455 187.069 99.1899 188.534L103.626 207.377C104.203 209.76 102.965 212.173 100.719 213.158L96.9745 214.8L99.4759 220.505C104.257 219.387 109.364 221.824 111.412 226.495C113.726 231.772 111.303 237.979 106.026 240.293C100.748 242.606 94.5421 240.183 92.2283 234.906C91.7906 233.908 92.2311 232.779 93.2295 232.341C94.2279 231.904 95.3564 232.344 95.7941 233.343C97.248 236.659 101.146 238.181 104.462 236.727C107.779 235.273 109.3 231.375 107.847 228.058C106.393 224.742 102.494 223.22 99.1782 224.674C98.1798 225.112 97.0513 224.672 96.6136 223.673L93.3931 216.328L89.649 217.969C87.4025 218.954 84.8091 218.178 83.4276 216.19L72.5734 200.161C71.7297 198.915 71.4766 197.368 71.8991 195.908C72.3171 194.534 73.2637 193.396 74.5674 192.782L60.372 160.405L36.4454 170.895C35.7323 171.208 34.9028 171.061 34.3518 170.58C33.8208 170.048 33.5994 169.252 33.8285 168.514ZM156.049 33.729L155.925 67.9636L181.278 56.848L156.049 33.729ZM234.609 107.607C233.289 108.186 232.653 109.74 233.247 111.095L244.363 136.448C244.941 137.767 246.496 138.404 247.851 137.81L264.752 130.399C266.072 129.821 266.708 128.266 266.114 126.911L254.999 101.559C254.42 100.239 252.866 99.6028 251.511 100.197L234.609 107.607ZM214.329 86.2723L230.803 79.0496L220.813 56.2641L204.339 63.4869L214.329 86.2723ZM201.869 57.8529L202.791 59.9567L216.555 53.9221L162.569 34.4417L185.566 55.478L190.38 53.3675C194.766 51.4445 199.946 53.467 201.869 57.8529ZM221.169 248.774C218.388 249.994 217.107 253.276 218.326 256.058L220.749 261.585L279.763 235.711L277.34 230.184C276.121 227.402 272.838 226.121 270.057 227.34L221.169 248.774ZM202.604 178.989L222.68 185.703L231.344 166.388L211.268 159.673L202.604 178.989ZM217.837 135.579L197.76 128.865L189.096 148.18L209.173 154.895L217.837 135.579ZM216.112 209.797L236.188 216.512L244.852 197.196L224.775 190.482L216.112 209.797ZM229.599 240.657L258.375 228.041L238.299 221.326L229.599 240.657ZM234.561 220.074L216.987 214.217L226.977 237.003L234.561 220.074ZM221.054 189.265L203.479 183.409L213.469 206.194L221.054 189.265ZM207.546 158.456L189.972 152.6L199.962 175.386L207.546 158.456ZM194.038 127.648L176.464 121.792L186.454 144.577L194.038 127.648ZM195.665 124.086L203.15 107.414L178.367 118.279L195.665 124.086ZM199.351 125.319L216.926 131.175L206.936 108.389L199.351 125.319ZM212.859 156.127L230.434 161.983L220.444 139.198L212.859 156.127ZM226.367 186.936L243.941 192.792L233.951 170.006L226.367 186.936ZM239.874 217.744L257.449 223.6L247.459 200.815L239.874 217.744ZM147.998 86.1483L160.395 114.425L161.224 116.315C162.287 118.74 165.108 119.841 167.533 118.778L172.097 116.777L206.151 101.847L210.75 99.8299C213.175 98.7668 214.277 95.9457 213.213 93.521L211.509 89.6343L199.956 63.283L198.252 59.3963C197.189 56.9715 194.368 55.8702 191.943 56.9333L148.726 75.8814C146.301 76.9445 145.199 79.7655 146.263 82.1903L147.998 86.1483ZM147.198 72.3L152.047 70.1738L152.155 33.8636L57.6433 123.637L143.65 85.9288L142.697 83.7536C140.789 79.4034 142.812 74.2229 147.198 72.3ZM57.4951 127.954L72.8396 133.087L79.4604 118.323L57.4951 127.954ZM88.9098 114.18L104.254 119.314L110.875 104.55L88.9098 114.18ZM120.324 100.407L135.669 105.54L142.29 90.7766L120.324 100.407ZM146.167 91.6697L139.371 106.808L155.11 112.066L146.167 91.6697ZM153.124 115.488L137.78 110.354L131.159 125.118L153.124 115.488ZM134.093 109.122L115.868 103.041L107.992 120.566L126.217 126.647L134.093 109.122ZM121.745 129.245L106.4 124.112L99.7796 138.876L121.745 129.245ZM102.679 122.895L84.4531 116.814L76.577 134.339L94.8026 140.42L102.679 122.895ZM90.3303 143.019L74.9858 137.885L68.3649 152.649L90.3303 143.019ZM63.9378 158.841L78.1332 191.219L87.5469 187.091L73.3515 154.714L63.9378 158.841ZM75.6609 197.022C75.6165 197.211 75.5432 197.626 75.8378 198.007L86.6919 214.037C87.0178 214.489 87.602 214.658 88.1012 214.439L99.1552 209.592C99.6544 209.374 99.9616 208.814 99.8141 208.283L95.3784 189.44C95.2621 188.98 94.9431 188.738 94.7736 188.642C94.6041 188.546 94.2094 188.422 93.7815 188.609L76.3091 196.27C75.8812 196.457 75.7053 196.832 75.6609 197.022ZM63.0162 154.994L71.264 136.669L52.182 130.283L49.8286 131.315L38.8401 165.594L63.0162 154.994Z"
                                    fill="#d1ffc8"/>
                            </svg>
                        </div>

                        {/* Heading Wrap */}
                        <div className="heading_wrap relative text-center mb-[40px] z-10">
                        <span
                            className="tag text-[16px] font-medium font-[var(--primary-font)] text-[var(--secondary-color)] bg-[var(--primary-color)] px-[20px] py-[5px] rounded-[30px] z-10">WHAT
                            WE OFFER</span>
                            <h2
                                className="title text-[32px] font-medium font-[var(--primary-font)] text-[var(text-1)] uppercase pt-[20px] max-w-[680px] mx-auto z-[1]">
                                We Provide Excellent Service To Our Customers
                            </h2>
                        </div>

                        {/* Cards */}
                        <div className="flex flex-wrap gap-y-5 lg:gap-y-0">
                            {/* Card 1 */}
                            <div className="w-full lg:w-1/3 px-4">
                                <div className="offer_card text-center">
                                    <div className="icons flex justify-center items-center">
                                        <div className="icon relative">
                                            <svg width="30" height="30" viewBox="0 0 40 40" fill="none"
                                                 xmlns="http://www.w3.org/2000/svg"
                                                 className="absolute w-[30px] h-[30px] top-0 left-[19px] z-[2]">
                                                <path
                                                    d="M33.3333 20.8333V11.3333C33.3333 8.53299 33.3333 7.13286 32.7884 6.0633C32.309 5.12249 31.5441 4.35759 30.6033 3.87822C29.5337 3.33325 28.1336 3.33325 25.3333 3.33325H14.6667C11.8664 3.33325 10.4663 3.33325 9.3967 3.87822C8.45589 4.35759 7.69099 5.12249 7.21162 6.0633C6.66666 7.13286 6.66666 8.53299 6.66666 11.3333V28.6666C6.66666 31.4668 6.66666 32.867 7.21162 33.9365C7.69099 34.8774 8.45589 35.6423 9.3967 36.1216C10.4663 36.6666 11.8664 36.6666 14.6667 36.6666H20M23.3333 18.3333H13.3333M16.6667 24.9999H13.3333M26.6667 11.6666H13.3333M24.1667 31.6666L27.5 34.9999L35 27.4999"
                                                    stroke="#fff" strokeWidth="3" strokeLinecap="round"
                                                    strokeLinejoin="round"/>
                                            </svg>
                                        </div>
                                    </div>
                                    <h3
                                        className="title text-[18px] font-medium font-[var(--primary-font)] text-[var(text-1)] uppercase my-[10px]">
                                        EGP Registration
                                    </h3>
                                    <p className="paragraph text-[16px] leading-[20px] font-normal text-[var(text-1)] font-secondary">
                                        Register today to streamline your projects, access exclusive
                                        resources, and build with confidence.
                                    </p>
                                    <div className="button mt-[16px]">
                                        <button
                                            className="read_more_btn bg-[var(--text-1)] relative inline-block py-[10px] px-[30px] rounded-tl-none rounded-tr-[12px] rounded-br-[12px] rounded-bl-[12px] border-none cursor-pointer overflow-hidden z-[1] group">
                                        <span
                                            className="text-[var(--secondary-color)] transition-all duration-400 font-[var(--secondary-font)] text-[16px] font-semibold group-hover:text-[var(--secondary-color)]">READ
                                            MORE</span>
                                            <span
                                                className="absolute bottom-0 left-0 w-full h-0 rounded-tl-[6px] rounded-tr-[6px] bg-[var(--primary-color)] transition-all duration-400 -z-[1] group-hover:h-full group-hover:rounded-tl-none"></span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Card 2 */}
                            <div className="w-full lg:w-1/3 px-4">
                                <div className="offer_card text-center">
                                    <div className="icons flex justify-center items-center">
                                        <div
                                            className="icon relative w-[52px] h-[52px] bg-[linear-gradient(90deg,#5AA469_50%,transparent_50%),linear-gradient(90deg,#5AA469_50%,transparent_50%),linear-gradient(0deg,#5AA469_50%,transparent_50%),linear-gradient(0deg,#5AA469_50%,transparent_50%)] bg-repeat bg-[length:9px_2px,9px_2px,2px_9px,2px_9px] bg-[position:0%_0%,100%_100%,0%_100%,100%_0px] rounded-tl-[12px] rounded-tr-[12px] rounded-br-[12px] p-[10px] mt-[10px] mb-[10px] animate-[dash_5s_linear_infinite] cursor-default z-[1]">
                                            <svg width="40" height="40" viewBox="0 0 40 40" fill="none"
                                                 xmlns="http://www.w3.org/2000/svg"
                                                 className="absolute w-[30px] h-[30px] top-0 left-[19px] z-[2]">
                                                <rect width="40" height="40" fill="#1E1E1E"/>
                                                <g id="Home" clipPath="url(#clip0_0_1)">
                                                    <rect width="1920" height="8579" transform="translate(-946 -3490)"
                                                          fill="white"/>
                                                    <g id="Services">
                                                        <g clipPath="url(#clip1_0_1)">
                                                            <rect x="-886" y="-369" width="1800" height="1442" rx="80"
                                                                  fill="#FCE7D7"/>
                                                            <g id="All Services">
                                                                <g id="Service 2">
                                                                    <g id="Text">
                                                                        <g id="icon">
                                                                            <path id="Rectangle 16"
                                                                                  d="M-15 -3C-15 -9.62742 -9.62742 -15 -3 -15H43C49.6274 -15 55 -9.62742 55 -3V43C55 49.6274 49.6274 55 43 55H-15V-3Z"
                                                                                  fill="#5AA469"/>
                                                                            <path id="Rectangle 17"
                                                                                  d="M28.9286 65.5V67H24.7857V65.5H20.6429V67H16.5V65.5H12.3571V67H8.21428V65.5H4.07143V67H-0.0714302V65.5H-4.21429V67H-8.35714V65.5H-12.5V67H-16.6429V65.5H-20.7857V67H-24.9286V65.5H-25.5V64.9286H-27V60.7857H-25.5V56.6429H-27V52.5H-25.5V48.3571H-27V44.2143H-25.5V40.0714H-27V35.9286H-25.5V31.7857H-27V27.6429H-25.5V23.5H-27V19.3571H-25.5V15.2143H-27V11.0714H-25.5V9C-25.5 8.29683 -25.4311 7.61125 -25.3001 6.94916L-26.7716 6.65806C-26.4601 5.08372 -25.8407 3.62011 -24.9788 2.33261L-23.7323 3.16709C-22.9653 2.0214 -21.9786 1.03469 -20.8329 0.267668L-21.6674 -0.978785C-20.3799 -1.84074 -18.9163 -2.46014 -17.3419 -2.77159L-17.0508 -1.30011C-16.3888 -1.43109 -15.7032 -1.5 -15 -1.5H-13.0833V-3H-9.25V-1.5H-5.41667V-3H-1.58334V-1.5H2.25V-3H6.08333V-1.5H9.91667V-3H13.75V-1.5H17.5833V-3H21.4167V-1.5H25.25V-3H29.0833V-1.5H31C31.7032 -1.5 32.3888 -1.43109 33.0508 -1.30011L33.3419 -2.77159C34.9163 -2.46014 36.3799 -1.84074 37.6674 -0.978785L36.8329 0.267667C37.9786 1.03469 38.9653 2.0214 39.7323 3.16709L40.9788 2.33261C41.8407 3.62011 42.4601 5.08372 42.7716 6.65806L41.3001 6.94916C41.4311 7.61125 41.5 8.29683 41.5 9V10.9167H43V14.75H41.5V18.5833H43V22.4167H41.5V26.25H43V30.0833H41.5V33.9167H43V37.75H41.5V41.5833H43V45.4167H41.5V49.25H43V53.0833H41.5V55C41.5 55.7032 41.4311 56.3888 41.3001 57.0508L42.7716 57.3419C42.4601 58.9163 41.8407 60.3799 40.9788 61.6674L39.7323 60.8329C38.9653 61.9786 37.9786 62.9653 36.8329 63.7323L37.6674 64.9788C36.3799 65.8407 34.9163 66.4601 33.3419 66.7716L33.0508 65.3001C32.3888 65.4311 31.7032 65.5 31 65.5H28.9286Z"
                                                                                  stroke="#5AA469" strokeWidth="3"
                                                                                  strokeDasharray="4 4"/>
                                                                            <g id="clipboard-check">
                                                                                <path id="Icon"
                                                                                      d="M26.6667 6.66659C28.2166 6.66659 28.9916 6.66659 29.6274 6.83696C31.3529 7.29929 32.7006 8.64703 33.163 10.3725C33.3334 11.0083 33.3334 11.7833 33.3334 13.3333V28.6666C33.3334 31.4668 33.3334 32.867 32.7884 33.9365C32.309 34.8774 31.5441 35.6423 30.6033 36.1216C29.5337 36.6666 28.1336 36.6666 25.3334 36.6666H14.6667C11.8664 36.6666 10.4663 36.6666 9.39673 36.1216C8.45592 35.6423 7.69102 34.8774 7.21165 33.9365C6.66669 32.867 6.66669 31.4668 6.66669 28.6666V13.3333C6.66669 11.7833 6.66669 11.0083 6.83706 10.3725C7.29939 8.64703 8.64713 7.29929 10.3726 6.83696C11.0084 6.66659 11.7834 6.66659 13.3334 6.66659M15 24.9999L18.3334 28.3333L25.8334 20.8333M16 9.99992H24C24.9334 9.99992 25.4002 9.99992 25.7567 9.81826C26.0703 9.65847 26.3252 9.40351 26.485 9.0899C26.6667 8.73338 26.6667 8.26667 26.6667 7.33325V5.99992C26.6667 5.0665 26.6667 4.59979 26.485 4.24327C26.3252 3.92966 26.0703 3.6747 25.7567 3.51491C25.4002 3.33325 24.9334 3.33325 24 3.33325H16C15.0666 3.33325 14.5999 3.33325 14.2434 3.51491C13.9298 3.6747 13.6748 3.92966 13.515 4.24327C13.3334 4.59979 13.3334 5.0665 13.3334 5.99992V7.33325C13.3334 8.26667 13.3334 8.73338 13.515 9.0899C13.6748 9.40351 13.9298 9.65847 14.2434 9.81826C14.5999 9.99992 15.0666 9.99992 16 9.99992Z"
                                                                                      stroke="#fff" strokeWidth="3"
                                                                                      strokeLinecap="round"
                                                                                      strokeLinejoin="round"/>
                                                                            </g>
                                                                        </g>
                                                                    </g>
                                                                </g>
                                                            </g>
                                                        </g>
                                                    </g>
                                                </g>
                                                <defs>
                                                    <clipPath id="clip0_0_1">
                                                        <rect width="1920" height="8579" fill="white"
                                                              transform="translate(-946 -3490)"/>
                                                    </clipPath>
                                                    <clipPath id="clip1_0_1">
                                                        <rect x="-886" y="-369" width="1800" height="1442" rx="80"
                                                              fill="white"/>
                                                    </clipPath>
                                                </defs>
                                            </svg>
                                        </div>
                                    </div>
                                    <h3
                                        className="title text-[18px] font-medium font-[var(--primary-font)] text-[var(text-1)] uppercase my-[10px]">
                                        E-Tender Submission
                                    </h3>
                                    <p className="paragraph text-[16px] leading-[20px] font-normal text-[var(text-1)] font-secondary">
                                        Submit your e-tenders seamlessly and securely with our
                                        streamlined platform.
                                    </p>
                                    <div className="button mt-[16px]">
                                        <button
                                            className="read_more_btn bg-[var(--text-1)] relative inline-block py-[10px] px-[30px] rounded-tl-none rounded-tr-[12px] rounded-br-[12px] rounded-bl-[12px] border-none cursor-pointer overflow-hidden z-[1] group">
                                        <span
                                            className="text-[var(--secondary-color)] transition-all duration-400 font-[var(--secondary-font)] text-[16px] font-semibold group-hover:text-[var(--secondary-color)]">READ
                                            MORE</span>
                                            <span
                                                className="absolute bottom-0 left-0 w-full h-0 rounded-tl-[6px] rounded-tr-[6px] bg-[var(--primary-color)] transition-all duration-400 -z-[1] group-hover:h-full group-hover:rounded-tl-none"></span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Card 3 */}
                            <div className="w-full lg:w-1/3 px-4">
                                <div className="offer_card text-center">
                                    <div className="icons flex justify-center items-center">
                                        <div
                                            className="icon relative w-[52px] h-[52px] bg-[linear-gradient(90deg,#5AA469_50%,transparent_50%),linear-gradient(90deg,#5AA469_50%,transparent_50%),linear-gradient(0deg,#5AA469_50%,transparent_50%),linear-gradient(0deg,#5AA469_50%,transparent_50%)] bg-repeat bg-[length:9px_2px,9px_2px,2px_9px,2px_9px] bg-[position:0%_0%,100%_100%,0%_100%,100%_0px] rounded-tl-[12px] rounded-tr-[12px] rounded-br-[12px] p-[10px] mt-[10px] mb-[10px] animate-[dash_5s_linear_infinite] cursor-default z-[1]">
                                            <svg width="40" height="40" viewBox="0 0 40 40" fill="none"
                                                 xmlns="http://www.w3.org/2000/svg"
                                                 className="absolute w-[30px] h-[30px] top-0 left-[19px] z-[2]">
                                                <path
                                                    d="M21.6667 18.3333H29.6667C31.5335 18.3333 32.467 18.3333 33.18 18.6966C33.8072 19.0162 34.3172 19.5262 34.6367 20.1534C35 20.8664 35 21.7998 35 23.6667V35M21.6667 35V10.3333C21.6667 8.46649 21.6667 7.53307 21.3034 6.82003C20.9838 6.19282 20.4739 5.68289 19.8467 5.36331C19.1336 5 18.2002 5 16.3334 5H10.3334C8.46653 5 7.53311 5 6.82007 5.36331C6.19287 5.68289 5.68293 6.19282 5.36335 6.82003C5.00004 7.53307 5.00004 8.46649 5.00004 10.3333V35M36.6667 35H3.33337M10.8334 11.6667H15.8334M10.8334 18.3333H15.8334M10.8334 25H15.8334"
                                                    stroke="#fff" strokeWidth="3" strokeLinecap="round"
                                                    strokeLinejoin="round"/>
                                            </svg>
                                        </div>
                                    </div>
                                    <h3
                                        className="title text-[18px] font-medium font-[var(--primary-font)] text-[var(text-1)] uppercase my-[10px]">
                                        Building Construction
                                    </h3>
                                    <p className="paragraph text-[16px] leading-[20px] font-normal text-[var(text-1)] font-secondary">
                                        Transforming visions into reality with expert craftsmanship
                                        and innovative solutions.
                                    </p>
                                    <div className="button mt-[16px]">
                                        <button
                                            className="read_more_btn bg-[var(--text-1)] relative inline-block py-[10px] px-[30px] rounded-tl-none rounded-tr-[12px] rounded-br-[12px] rounded-bl-[12px] border-none cursor-pointer overflow-hidden z-[1] group">
                                        <span
                                            className="text-[var(--secondary-color)] transition-all duration-400 font-[var(--secondary-font)] text-[16px] font-semibold group-hover:text-[var(--secondary-color)]">READ
                                            MORE</span>
                                            <span
                                                className="absolute bottom-0 left-0 w-full h-0 rounded-tl-[6px] rounded-tr-[6px] bg-[var(--primary-color)] transition-all duration-400 -z-[1] group-hover:h-full group-hover:rounded-tl-none"></span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Details */}
                        <div className="mt-[36px] flex flex-wrap">
                            {/* Detail Card 1 */}
                            <div className="w-full lg:w-1/3 px-4 mb-4 flex items-stretch">
                                <div
                                    className="offer_details flex items-start bg-[var(--secondary-color)] p-[14px] rounded-[16px] gap-[20px]">
                                    <div className="icons flex justify-center items-center">
                                        <div
                                            className="icon relative w-[52px] h-[52px] bg-[linear-gradient(90deg,#5AA469_50%,transparent_50%),linear-gradient(90deg,#5AA469_50%,transparent_50%),linear-gradient(0deg,#5AA469_50%,transparent_50%),linear-gradient(0deg,#5AA469_50%,transparent_50%)] bg-repeat bg-[length:9px_2px,9px_2px,2px_9px,2px_9px] bg-[position:0%_0%,100%_100%,0%_100%,100%_0px] rounded-tl-[12px] rounded-tr-[12px] rounded-br-[12px] p-[10px] mt-[10px] mb-[10px] animate-[dash_5s_linear_infinite] cursor-default z-[1]">
                                            <svg width="40" height="40" viewBox="0 0 40 40" fill="none"
                                                 xmlns="http://www.w3.org/2000/svg"
                                                 className="absolute w-[30px] h-[30px] top-0 left-[19px] z-[2]">
                                                <path
                                                    d="M18.625 22.8407H17.125C17.125 23.4198 17.4583 23.9472 17.9814 24.1956L18.625 22.8407ZM12.25 22.8407L12.8937 24.1956C13.4167 23.9471 13.75 23.4198 13.75 22.8407H12.25ZM17.125 6.1875V22.8407H20.125V6.1875H17.125ZM15.4375 4.5C16.3695 4.5 17.125 5.25552 17.125 6.1875H20.125C20.125 3.59867 18.0264 1.5 15.4375 1.5V4.5ZM13.75 6.1875C13.75 5.25552 14.5055 4.5 15.4375 4.5V1.5C12.8487 1.5 10.75 3.59866 10.75 6.1875H13.75ZM13.75 22.8407V6.1875H10.75V22.8407H13.75ZM9.50001 29.5625C9.50001 27.1962 10.8842 25.1502 12.8937 24.1956L11.6064 21.4858C8.59033 22.9186 6.50001 25.9949 6.50001 29.5625H9.50001ZM15.4375 35.5C12.1583 35.5 9.50001 32.8417 9.50001 29.5625H6.50001C6.50001 34.4985 10.5015 38.5 15.4375 38.5V35.5ZM21.375 29.5625C21.375 32.8417 18.7167 35.5 15.4375 35.5V38.5C20.3736 38.5 24.375 34.4985 24.375 29.5625H21.375ZM17.9814 24.1956C19.9908 25.1502 21.375 27.1962 21.375 29.5625H24.375C24.375 25.995 22.2847 22.9186 19.2687 21.4858L17.9814 24.1956Z"
                                                    fill="#171717"/>
                                                <path d="M15.4375 30.625V26.375" stroke="#fff" strokeWidth="3"
                                                      strokeLinecap="round"
                                                      strokeLinejoin="round"/>
                                                <path d="M22.875 20H27.125" stroke="#fff" strokeWidth="3"
                                                      strokeLinecap="round"
                                                      strokeLinejoin="round"/>
                                                <path d="M22.875 15.75H27.125" stroke="#fff" strokeWidth="3"
                                                      strokeLinecap="round"
                                                      strokeLinejoin="round"/>
                                                <path d="M22.875 11.5H27.125" stroke="#fff" strokeWidth="3"
                                                      strokeLinecap="round"
                                                      strokeLinejoin="round"/>
                                                <path d="M22.875 7.25H31.375" stroke="#fff" strokeWidth="3"
                                                      strokeLinecap="round"
                                                      strokeLinejoin="round"/>
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="details_wrap">
                                        <div
                                            className="title_wrap flex h-[55px] items-center justify-between gap-[10px]">
                                            <h3 className="title text-[18px] font-medium font-[var(--primary-font)] text-[var(text-1)] uppercase m-0">
                                                Soil Test
                                            </h3>
                                            <div className="button">
                                                <button
                                                    className="ar_btn inline-block w-[38px] h-[38px] bg-[var(--text-1)] rounded-bl-[12px] rounded-tl-[0px] rounded-tr-[12px] rounded-br-[12px] p-[6px] transition-all duration-[0.3s] hover:bg-[var(--primary-color)]">
                                                    <svg width="24" height="24" viewBox="0 0 28 28" fill="none"
                                                         xmlns="http://www.w3.org/2000/svg"
                                                         className="transition-all duration-[0.3s]">
                                                        <path d="M7 21L21 7M21 7H11.6667M21 7V16.3333" stroke="white"
                                                              strokeWidth="3"
                                                              strokeLinecap="round" strokeLinejoin="round"/>
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                        <p
                                            className="paragraph text-[16px] leading-[20px] !text-left font-normal m-0 font-secondary text-[var(text-1)]">
                                            Offering precise soil testing services to ensure strong,
                                            reliable, and lasting foundations for your construction
                                            projects.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Detail Card 2 */}
                            <div className="w-full lg:w-1/3 px-4 mb-4 flex items-stretch">
                                <div
                                    className="offer_details flex items-start bg-[var(--secondary-color)] p-[14px] rounded-[16px] gap-[20px]">
                                    <div className="icons flex justify-center items-center">
                                        <div
                                            className="icon relative w-[52px] h-[52px] bg-[linear-gradient(90deg,#5AA469_50%,transparent_50%),linear-gradient(90deg,#5AA469_50%,transparent_50%),linear-gradient(0deg,#5AA469_50%,transparent_50%),linear-gradient(0deg,#5AA469_50%,transparent_50%)] bg-repeat bg-[length:9px_2px,9px_2px,2px_9px,2px_9px] bg-[position:0%_0%,100%_100%,0%_100%,100%_0px] rounded-tl-[12px] rounded-tr-[12px] rounded-br-[12px] p-[10px] mt-[10px] mb-[10px] animate-[dash_5s_linear_infinite] cursor-default z-[1]">
                                            <svg width="40" height="40" viewBox="0 0 40 40" fill="none"
                                                 xmlns="http://www.w3.org/2000/svg"
                                                 className="absolute w-[30px] h-[30px] top-0 left-[19px] z-[2]">
                                                <path
                                                    d="M20 26.6667V35M20 26.6667L30 35M20 26.6667L9.99998 35M35 5V18.6667C35 21.4669 35 22.8671 34.455 23.9366C33.9756 24.8774 33.2107 25.6423 32.2699 26.1217C31.2004 26.6667 29.8002 26.6667 27 26.6667H13C10.1997 26.6667 8.79959 26.6667 7.73003 26.1217C6.78922 25.6423 6.02431 24.8774 5.54495 23.9366C4.99998 22.8671 4.99998 21.4669 4.99998 18.6667V5M13.3333 15V20M20 11.6667V20M26.6666 18.3333V20M36.6666 5H3.33331"
                                                    stroke="#fff" strokeWidth="3" strokeLinecap="round"
                                                    strokeLinejoin="round"/>
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="details_wrap">
                                        <div
                                            className="title_wrap flex h-[55px] items-center justify-between gap-[10px]">
                                            <h3 className="title text-[18px] font-medium font-[var(--primary-font)] text-[var(text-1)] uppercase m-0">
                                                Rate Analysis
                                            </h3>
                                            <div className="button">
                                                <button
                                                    className="ar_btn inline-block w-[38px] h-[38px] bg-[var(--text-1)] rounded-bl-[12px] rounded-tl-[0px] rounded-tr-[12px] rounded-br-[12px] p-[6px] transition-all duration-[0.3s] hover:bg-[var(--primary-color)]">
                                                    <svg width="24" height="24" viewBox="0 0 28 28" fill="none"
                                                         xmlns="http://www.w3.org/2000/svg"
                                                         className="transition-all duration-[0.3s]">
                                                        <path d="M7 21L21 7M21 7H11.6667M21 7V16.3333" stroke="white"
                                                              strokeWidth="3"
                                                              strokeLinecap="round" strokeLinejoin="round"/>
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                        <p
                                            className="paragraph text-[16px] leading-[20px] !text-left font-normal m-0 font-secondary text-[var(text-1)]">
                                            Delivering detailed and accurate rate analysis to optimize
                                            costs and ensure transparency for your construction
                                            projects.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Detail Card 3 */}
                            <div className="w-full lg:w-1/3 px-4 mb-4 flex items-stretch">
                                <div
                                    className="offer_details flex items-start bg-[var(--secondary-color)] p-[14px] rounded-[16px] gap-[20px]">
                                    <div className="icons flex justify-center items-center">
                                        <div
                                            className="icon relative w-[52px] h-[52px] bg-[linear-gradient(90deg,#5AA469_50%,transparent_50%),linear-gradient(90deg,#5AA469_50%,transparent_50%),linear-gradient(0deg,#5AA469_50%,transparent_50%),linear-gradient(0deg,#5AA469_50%,transparent_50%)] bg-repeat bg-[length:9px_2px,9px_2px,2px_9px,2px_9px] bg-[position:0%_0%,100%_100%,0%_100%,100%_0px] rounded-tl-[12px] rounded-tr-[12px] rounded-br-[12px] p-[10px] mt-[10px] mb-[10px] animate-[dash_5s_linear_infinite] cursor-default z-[1]">
                                            <svg width="40" height="40" viewBox="0 0 40 40" fill="none"
                                                 xmlns="http://www.w3.org/2000/svg"
                                                 className="absolute w-[30px] h-[30px] top-0 left-[19px] z-[2]">
                                                <path
                                                    d="M26.6667 8.33328L26.6667 31.6666M16.6667 6.66662L16.6667 33.3333M5 19.9999H35M5 9.9819L5 30.018C5 32.2914 5 33.4281 5.4689 34.216C5.88004 34.9068 6.527 35.4258 7.29057 35.6773C8.16141 35.9641 9.27104 35.7175 11.4903 35.2243L30.8236 30.928C32.3138 30.5969 33.0589 30.4313 33.6151 30.0306C34.1057 29.6772 34.4909 29.197 34.7295 28.6414C35 28.0115 35 27.2483 35 25.7217V14.2782C35 12.7516 35 11.9884 34.7295 11.3585C34.4909 10.8029 34.1057 10.3227 33.6151 9.9693C33.0589 9.5686 32.3138 9.40303 30.8236 9.07187L11.4903 4.77557C9.27104 4.2824 8.16141 4.03582 7.29057 4.32264C6.527 4.57413 5.88004 5.0931 5.4689 5.78393C5 6.57181 5 7.70851 5 9.9819Z"
                                                    stroke="#fff" strokeWidth="3" strokeLinecap="round"
                                                    strokeLinejoin="round"/>
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="details_wrap">
                                        <div
                                            className="title_wrap flex h-[55px] items-center justify-between gap-[10px]">
                                            <h3 className="title text-[18px] font-medium font-[var(--primary-font)] text-[var(text-1)] uppercase m-0">
                                                Architectural Design
                                            </h3>
                                            <div className="button">
                                                <button
                                                    className="ar_btn inline-block w-[38px] h-[38px] bg-[var(--text-1)] rounded-bl-[12px] rounded-tl-[0px] rounded-tr-[12px] rounded-br-[12px] p-[6px] transition-all duration-[0.3s] hover:bg-[var(--primary-color)]">
                                                    <svg width="24" height="24" viewBox="0 0 28 28" fill="none"
                                                         xmlns="http://www.w3.org/2000/svg"
                                                         className="transition-all duration-[0.3s]">
                                                        <path d="M7 21L21 7M21 7H11.6667M21 7V16.3333" stroke="white"
                                                              strokeWidth="3"
                                                              strokeLinecap="round" strokeLinejoin="round"/>
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                        <p
                                            className="paragraph text-[16px] leading-[20px] !text-left font-normal m-0 font-secondary text-[var(text-1)]">
                                            Creating innovative and functional architectural designs
                                            tailored to bring your vision to life with style and
                                            precision.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Detail Card 4 */}
                            <div className="w-full lg:w-1/3 px-4 mb-4 flex items-stretch">
                                <div
                                    className="offer_details flex items-start bg-[var(--secondary-color)] p-[14px] rounded-[16px] gap-[20px]">
                                    <div className="icons flex justify-center items-center">
                                        <div
                                            className="icon relative w-[52px] h-[52px] bg-[linear-gradient(90deg,#5AA469_50%,transparent_50%),linear-gradient(90deg,#5AA469_50%,transparent_50%),linear-gradient(0deg,#5AA469_50%,transparent_50%),linear-gradient(0deg,#5AA469_50%,transparent_50%)] bg-repeat bg-[length:9px_2px,9px_2px,2px_9px,2px_9px] bg-[position:0%_0%,100%_100%,0%_100%,100%_0px] rounded-tl-[12px] rounded-tr-[12px] rounded-br-[12px] p-[10px] mt-[10px] mb-[10px] animate-[dash_5s_linear_infinite] cursor-default z-[1]">
                                            <svg width="40" height="40" viewBox="0 0 40 40" fill="none"
                                                 xmlns="http://www.w3.org/2000/svg"
                                                 className="absolute w-[30px] h-[30px] top-0 left-[19px] z-[2]">
                                                <path
                                                    d="M31.6667 7.49992C31.6667 8.27434 31.6667 8.66156 31.6026 8.98355C31.3396 10.3059 30.3059 11.3395 28.9836 11.6025C28.6616 11.6666 28.2744 11.6666 27.5 11.6666H9.16667C8.39224 11.6666 8.00503 11.6666 7.68303 11.6025C6.36073 11.3395 5.32707 10.3059 5.06405 8.98355C5 8.66156 5 8.27434 5 7.49992C5 6.72549 5 6.33828 5.06405 6.01628C5.32707 4.69398 6.36073 3.66032 7.68303 3.3973C8.00503 3.33325 8.39224 3.33325 9.16667 3.33325H27.5C28.2744 3.33325 28.6616 3.33325 28.9836 3.3973C30.3059 3.66032 31.3396 4.69398 31.6026 6.01628C31.6667 6.33828 31.6667 6.72549 31.6667 7.49992ZM31.6667 7.49992C33.2198 7.49992 33.9964 7.49992 34.6089 7.75365C35.4257 8.09197 36.0746 8.74088 36.4129 9.55764C36.6667 10.1702 36.6667 10.9468 36.6667 12.4999V12.9999C36.6667 14.8668 36.6667 15.8002 36.3034 16.5132C35.9838 17.1404 35.4738 17.6504 34.8466 17.9699C34.1336 18.3333 33.2002 18.3333 31.3333 18.3333H25.3333C23.4665 18.3333 22.5331 18.3333 21.82 18.6966C21.1928 19.0161 20.6829 19.5261 20.3633 20.1533C20 20.8663 20 21.7997 20 23.6666V24.9999M19.3333 36.6666H20.6667C21.6001 36.6666 22.0668 36.6666 22.4233 36.4849C22.7369 36.3251 22.9919 36.0702 23.1517 35.7566C23.3333 35.4 23.3333 34.9333 23.3333 33.9999V27.6666C23.3333 26.7332 23.3333 26.2665 23.1517 25.9099C22.9919 25.5963 22.7369 25.3414 22.4233 25.1816C22.0668 24.9999 21.6001 24.9999 20.6667 24.9999H19.3333C18.3999 24.9999 17.9332 24.9999 17.5767 25.1816C17.2631 25.3414 17.0081 25.5963 16.8483 25.9099C16.6667 26.2665 16.6667 26.7332 16.6667 27.6666V33.9999C16.6667 34.9333 16.6667 35.4 16.8483 35.7566C17.0081 36.0702 17.2631 36.3251 17.5767 36.4849C17.9332 36.6666 18.3999 36.6666 19.3333 36.6666Z"
                                                    stroke="#fff" strokeWidth="3" strokeLinecap="round"
                                                    strokeLinejoin="round"/>
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="details_wrap">
                                        <div
                                            className="title_wrap flex h-[55px] items-center justify-between gap-[10px]">
                                            <h3 className="title text-[18px] font-medium font-[var(--primary-font)] text-[var(text-1)] uppercase m-0">
                                                Interior Design
                                            </h3>
                                            <div className="button">
                                                <button
                                                    className="ar_btn inline-block w-[38px] h-[38px] bg-[var(--text-1)] rounded-bl-[12px] rounded-tl-[0px] rounded-tr-[12px] rounded-br-[12px] p-[6px] transition-all duration-[0.3s] hover:bg-[var(--primary-color)]">
                                                    <svg width="24" height="24" viewBox="0 0 28 28" fill="none"
                                                         xmlns="http://www.w3.org/2000/svg"
                                                         className="transition-all duration-[0.3s]">
                                                        <path d="M7 21L21 7M21 7H11.6667M21 7V16.3333" stroke="white"
                                                              strokeWidth="3"
                                                              strokeLinecap="round" strokeLinejoin="round"/>
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                        <p
                                            className="paragraph text-[16px] leading-[20px] !text-left font-normal m-0 font-secondary text-[var(text-1)]">
                                            Transforming spaces with personalized interior design
                                            solutions that blend functionality, aesthetics, and comfort
                                            seamlessly.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Detail Card 5 */}
                            <div className="w-full lg:w-1/3 px-4 mb-4 flex items-stretch">
                                <div
                                    className="offer_details flex items-start bg-[var(--secondary-color)] p-[14px] rounded-[16px] gap-[20px]">
                                    <div className="icons flex justify-center items-center">
                                        <div
                                            className="icon relative w-[52px] h-[52px] bg-[linear-gradient(90deg,#5AA469_50%,transparent_50%),linear-gradient(90deg,#5AA469_50%,transparent_50%),linear-gradient(0deg,#5AA469_50%,transparent_50%),linear-gradient(0deg,#5AA469_50%,transparent_50%)] bg-repeat bg-[length:9px_2px,9px_2px,2px_9px,2px_9px] bg-[position:0%_0%,100%_100%,0%_100%,100%_0px] rounded-tl-[12px] rounded-tr-[12px] rounded-br-[12px] p-[10px] mt-[10px] mb-[10px] animate-[dash_5s_linear_infinite] cursor-default z-[1]">
                                            <svg width="40" height="40" viewBox="0 0 40 40" fill="none"
                                                 xmlns="http://www.w3.org/2000/svg"
                                                 className="absolute w-[30px] h-[30px] top-0 left-[19px] z-[2]">
                                                <path
                                                    d="M22.5491 13.9197C21.5951 14.5998 20.4276 14.9999 19.1666 14.9999C15.945 14.9999 13.3333 12.3882 13.3333 9.16659C13.3333 5.94492 15.945 3.33325 19.1666 3.33325C21.255 3.33325 23.087 4.43061 24.1175 6.08016M9.99998 33.4785H14.3505C14.9177 33.4785 15.4815 33.546 16.0313 33.681L20.6281 34.7981C21.6256 35.041 22.6646 35.0647 23.6724 34.8689L28.7549 33.8801C30.0976 33.6186 31.3326 32.9757 32.3005 32.0341L35.8965 28.5361C36.9234 27.5389 36.9234 25.9206 35.8965 24.9217C34.9719 24.0223 33.5079 23.9211 32.4619 24.6838L28.271 27.7413C27.6708 28.1801 26.9405 28.4163 26.1894 28.4163H22.1425L24.7184 28.4162C26.1703 28.4162 27.3464 27.2721 27.3464 25.8598V25.3485C27.3464 24.1758 26.5259 23.1532 25.3568 22.8697L21.381 21.9028C20.7339 21.7459 20.0713 21.6666 19.4052 21.6666C17.7972 21.6666 14.8865 22.9979 14.8865 22.9979L9.99998 25.0414M33.3333 10.8333C33.3333 14.0549 30.7216 16.6666 27.5 16.6666C24.2783 16.6666 21.6666 14.0549 21.6666 10.8333C21.6666 7.61159 24.2783 4.99992 27.5 4.99992C30.7216 4.99992 33.3333 7.61159 33.3333 10.8333ZM3.33331 24.3333L3.33331 33.9999C3.33331 34.9333 3.33331 35.4 3.51497 35.7566C3.67476 36.0702 3.92973 36.3251 4.24333 36.4849C4.59985 36.6666 5.06656 36.6666 5.99998 36.6666H7.33331C8.26673 36.6666 8.73344 36.6666 9.08996 36.4849C9.40357 36.3251 9.65854 36.0702 9.81832 35.7566C9.99998 35.4001 9.99998 34.9333 9.99998 33.9999V24.3333C9.99998 23.3998 9.99998 22.9331 9.81832 22.5766C9.65854 22.263 9.40357 22.008 9.08996 21.8482C8.73344 21.6666 8.26673 21.6666 7.33331 21.6666L5.99998 21.6666C5.06656 21.6666 4.59985 21.6666 4.24333 21.8482C3.92973 22.008 3.67476 22.263 3.51497 22.5766C3.33331 22.9331 3.33331 23.3998 3.33331 24.3333Z"
                                                    stroke="#fff" strokeWidth="3" strokeLinecap="round"
                                                    strokeLinejoin="round"/>
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="details_wrap">
                                        <div
                                            className="title_wrap flex h-[55px] items-center justify-between gap-[10px]">
                                            <h3 className="title text-[18px] font-medium font-[var(--primary-font)] text-[var(text-1)] uppercase m-0">
                                                Estimating & Costing
                                            </h3>
                                            <div className="button">
                                                <button
                                                    className="ar_btn inline-block w-[38px] h-[38px] bg-[var(--text-1)] rounded-bl-[12px] rounded-tl-[0px] rounded-tr-[12px] rounded-br-[12px] p-[6px] transition-all duration-[0.3s] hover:bg-[var(--primary-color)]">
                                                    <svg width="24" height="24" viewBox="0 0 28 28" fill="none"
                                                         xmlns="http://www.w3.org/2000/svg"
                                                         className="transition-all duration-[0.3s]">
                                                        <path d="M7 21L21 7M21 7H11.6667M21 7V16.3333" stroke="white"
                                                              strokeWidth="3"
                                                              strokeLinecap="round" strokeLinejoin="round"/>
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                        <p
                                            className="paragraph text-[16px] leading-[20px] !text-left font-normal m-0 font-secondary text-[var(text-1)]">
                                            Providing precise estimating and costing services to plan
                                            your construction budget effectively and ensure financial
                                            clarity.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Detail Card 6 */}
                            <div className="w-full lg:w-1/3 px-4 mb-4 flex items-stretch">
                                <div
                                    className="offer_details flex items-start bg-[var(--secondary-color)] p-[14px] rounded-[16px] gap-[20px]">
                                    <div className="icons flex justify-center items-center">
                                        <div
                                            className="icon relative w-[52px] h-[52px] bg-[linear-gradient(90deg,#5AA469_50%,transparent_50%),linear-gradient(90deg,#5AA469_50%,transparent_50%),linear-gradient(0deg,#5AA469_50%,transparent_50%),linear-gradient(0deg,#5AA469_50%,transparent_50%)] bg-repeat bg-[length:9px_2px,9px_2px,2px_9px,2px_9px] bg-[position:0%_0%,100%_100%,0%_100%,100%_0px] rounded-tl-[12px] rounded-tr-[12px] rounded-br-[12px] p-[10px] mt-[10px] mb-[10px] animate-[dash_5s_linear_infinite] cursor-default z-[1]">
                                            <svg width="40" height="40" viewBox="0 0 40 40" fill="none"
                                                 xmlns="http://www.w3.org/2000/svg"
                                                 className="absolute w-[30px] h-[30px] top-0 left-[19px] z-[2]">
                                                <path
                                                    d="M20 29.9999C27.3638 29.9999 33.3333 24.0304 33.3333 16.6666C33.3333 9.30279 27.3638 3.33325 20 3.33325C12.6362 3.33325 6.66663 9.30279 6.66663 16.6666C6.66663 24.0304 12.6362 29.9999 20 29.9999ZM20 29.9999V36.6666M20 36.6666H11.6666M20 36.6666H28.3333M25 16.6666C25 19.428 22.7614 21.6666 20 21.6666C17.2385 21.6666 15 19.428 15 16.6666C15 13.9052 17.2385 11.6666 20 11.6666C22.7614 11.6666 25 13.9052 25 16.6666Z"
                                                    stroke="#fff" strokeWidth="3" strokeLinecap="round"
                                                    strokeLinejoin="round"/>
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="details_wrap">
                                        <div
                                            className="title_wrap flex h-[55px] items-center justify-between gap-[10px]">
                                            <h3 className="title text-[18px] font-medium font-[var(--primary-font)] text-[var(text-1)] uppercase m-0">
                                                Land Survey
                                            </h3>
                                            <div className="button">
                                                <button
                                                    className="ar_btn inline-block w-[38px] h-[38px] bg-[var(--text-1)] rounded-bl-[12px] rounded-tl-[0px] rounded-tr-[12px] rounded-br-[12px] p-[6px] transition-all duration-[0.3s] hover:bg-[var(--primary-color)]">
                                                    <svg width="24" height="24" viewBox="0 0 28 28" fill="none"
                                                         xmlns="http://www.w3.org/2000/svg"
                                                         className="transition-all duration-[0.3s]">
                                                        <path d="M7 21L21 7M21 7H11.6667M21 7V16.3333" stroke="white"
                                                              strokeWidth="3"
                                                              strokeLinecap="round" strokeLinejoin="round"/>
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                        <p
                                            className="paragraph text-[16px] leading-[20px] !text-left font-normal m-0 font-secondary text-[var(text-1)]">
                                            Offering accurate land survey services to provide essential
                                            data for planning and executing your projects with
                                            precision.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>
                {`
                .offer .icon::before {
                content: "";
                position: absolute;
                top: -10px;
                width: 50px;
                height: 50px;
                border-radius: 12px 12px 12px 0px;
                background-color: var(--primary-color);
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                font-size: 16px;
                z-index: -1;
                font-weight: bold;
            }
            
            .offer .icon {
                position: relative;
                width: 52px;
                height: 52px;
                background: linear-gradient(90deg, #5AA469 50%, transparent 50%),
                            linear-gradient(90deg, #5AA469 50%, transparent 50%),
                            linear-gradient(0deg, #5AA469 50%, transparent 50%),
                            linear-gradient(0deg, #5AA469 50%, transparent 50%);
                background-repeat: repeat-x, repeat-x, repeat-y, repeat-y;
                background-size: 9px 2px, 9px 2px, 2px 9px, 2px 9px;
                background-position: 0% 0%, 100% 100%, 0% 100%, 100% 0%;
                border-radius: 12px 12px 12px 0px;
                padding: 10px;
                margin-top: 10px;
                margin-bottom: 10px;
                animation: dash 5s linear infinite;
                cursor: default;
                z-index: 1;
            }
            
            @keyframes dash {
                to {
                    background-position: 100% 0%, 0% 100%, 0% 0%, 100% 100%;
                }
            }
            `}
            </style>
            {/* We Offer End */}


            {/* counter Wrapper Start */}
            <div className="counter_wrapper pt-[60px]">
                <div className="custom-container">
                    <div className="counter_container">
                        <div className="items-center">
                            <div ref={counterStatsRef} className="stats grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 gap-2 justify-center rounded-[8px] w-full text-center">
                                <div className="stats_item py-[6px]">
                                    <h2 className="counter flex justify-center items-center gap-[4px] m-0">
                                    <span className="numbers text-[48px] text-[var(--text-1)] font-bold font-[var(--primary-font)] m-0"
                                          data-target="1000">0</span>
                                        <span className="suffix text-[48px] text-[var(--primary-color)] font-medium">+</span>
                                    </h2>
                                    <h5
                                        className="counter_title text-[18px] font-[var(--secondary-font)] text-[var(--text-1)] font-medium uppercase">
                                        Total Tenders
                                    </h5>
                                </div>
                                <div className="stats_item py-[6px]">
                                    <h2 className="counter flex justify-center items-center gap-[4px] m-0">
                                    <span className="numbers text-[48px] text-[var(--text-1)] font-bold font-[var(--primary-font)] m-0"
                                          data-target="700">0</span>
                                        <span className="suffix text-[48px] text-[var(--primary-color)] font-medium">+</span>
                                    </h2>
                                    <h5
                                        className="counter_title text-[18px] font-[var(--secondary-font)] text-[var(--text-1)] font-medium uppercase">
                                        Design Clients
                                    </h5>
                                </div>
                                <div className="stats_item py-[6px]">
                                    <h2 className="counter flex justify-center items-center gap-[4px] m-0">
                                    <span className="numbers text-[48px] text-[var(--text-1)] font-bold font-[var(--primary-font)] m-0"
                                          data-target="200">0</span>
                                        <span className="suffix text-[48px] text-[var(--primary-color)] font-medium">+</span>
                                    </h2>
                                    <h5
                                        className="counter_title text-[18px] font-[var(--secondary-font)] text-[var(--text-1)] font-medium uppercase">
                                        Projects
                                    </h5>
                                </div>
                                <div className="stats_item py-[6px]">
                                    <h2 className="counter flex justify-center items-center gap-[4px] m-0">
                                    <span className="numbers text-[48px] text-[var(--text-1)] font-bold font-[var(--primary-font)] m-0"
                                          data-target="86">0</span>
                                        <span className="suffix percent text-[30px] text-[var(--primary-color)] font-bold">%</span>
                                    </h2>
                                    <h5
                                        className="counter_title text-[18px] font-[var(--secondary-font)] text-[var(--text-1)] font-medium uppercase">
                                        Success Rate
                                    </h5>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* counter Wrapper End */}


            {/* About Section Start */}
            <div className="about_section bg-[var(--secondary-color)] pt-[80px]">
                <div className="custom-container">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                        <div className="img_counter flex justify-center items-center max-w-full pb-[46px] md:pb-0">
                            <div className="image_container relative max-w-[80%] aspect-square rounded-3xl transition-all duration-400 hover:scale-105" ref={aboutStatsRef}>
                                <img src={AboutImage} alt="Building" className="responsive_image w-full h-full rounded-3xl transition-all duration-400" />

                                <div className="counter_box1 absolute top-[110px] left-[-50px] bg-[var(--secondary-color)] text-center p-[10px] rounded-2xl shadow-[0px_6px_10px_0px_rgba(0,0,0,0.1)]">
                                    <div className="item flex items-center justify-center">
                                        <h2
                                            className="counters text-[38px] md:text-[32px] sm:text-[24px] xs:text-[14px] font-[var(--primary-font)] text-[var(--text-1)] font-medium m-0"
                                            data-target="1000">
                                            0
                                        </h2>
                                        <span className="plus text-[34px] md:text-[32px] sm:text-[24px] xs:text-[14px]">+</span>
                                    </div>
                                    <p
                                        className="text-[16px] xs:text-[12px] font-[var(--primary-font)] text-[var(--text-2)] font-normal leading-[18px] whitespace-nowrap m-0">
                                        Tenderer
                                    </p>
                                </div >

                                <div className="counter_box2 absolute bottom-[160px] right-[-50px] bg-[var(--secondary-color)] text-center p-[10px] rounded-2xl shadow-[0px_6px_10px_0px_rgba(0,0,0,0.1)]">
                                    <div className="item flex items-center justify-center">
                                        <h2
                                            className="counters text-[38px] md:text-[32px] sm:text-[24px] xs:text-[14px] font-[var(--primary-font)] text-[var(--text-1)] font-medium m-0"
                                            data-target="700">
                                            0
                                        </h2>
                                        <span className="plus text-[34px] md:text-[32px] sm:text-[24px] xs:text-[14px]">+</span>
                                    </div>
                                    <p
                                        className="text-[16px] xs:text-[12px] font-[var(--primary-font)] text-[var(--text-2)] font-normal leading-[18px] whitespace-nowrap m-0">
                                        Design Clients
                                    </p>
                                </div>

                                <div className="counter_box3 absolute bottom-[-85px] sm:bottom-[-50px] xs:bottom-[-90px] left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[var(--secondary-color)] text-center p-[10px] rounded-2xl shadow-[0px_6px_10px_0px_rgba(0,0,0,0.1)]">
                                    <div className="item flex items-center justify-center">
                                        <h2
                                            className="counters text-[38px] md:text-[32px] sm:text-[24px] xs:text-[14px] font-[var(--primary-font)] text-[var(--text-1)] font-medium m-0"
                                            data-target="200">
                                            0
                                        </h2>
                                        <span className="plus text-[34px] md:text-[32px] sm:text-[24px] xs:text-[14px]">+</span>
                                    </div>
                                    <p
                                        className="text-[16px] xs:text-[12px] font-[var(--primary-font)] text-[var(--text-2)] font-normal leading-[18px] whitespace-nowrap m-0">
                                        Projects
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="text_content mt-[40px] lg:mt-[0px]">
                            <div className="heading_wrap">
                            <span
                                className="tag text-[16px] font-medium font-[var(--primary-font)] text-[var(--secondary-color)] bg-[var(--primary-color)] py-[5px] px-[20px] rounded-[30px]">ABOUT
                                US</span>
                                <h2
                                    className="title text-[38px] md:text-[32px] font-medium font-[var(--primary-font)] text-[var(--text-1)] pt-[20px] m-0 uppercase">
                                    Precision, Quality, and Excellence in Every Project
                                </h2>
                                <p
                                    className="paragraph text-[16px] !text-left leading-[20px] font-medium text-left my-[30px] text-[var(--text-2)] font-[var(--secondary-font)]">
                                    We specialize in delivering top-tier construction services,
                                    including soil testing, architectural design, interior design,
                                    land surveys, and more. Our expert team is committed to ensuring
                                    the success of your projects with precision, creativity, and a
                                    focus on quality. We bring innovative solutions and reliable
                                    results to every step of the construction process, transforming
                                    your vision into reality.
                                </p>
                                <div className="button">
                                    <button
                                        className="read_more_btn bg-[var(--primary-color)] relative inline-block py-[10px] px-[30px] rounded-tl-none rounded-tr-[12px] rounded-br-[12px] rounded-bl-[12px] border-none cursor-pointer overflow-hidden z-[1] group">
                                    <span
                                        className="text-[var(--secondary-color)] transition-all duration-400 font-[var(--secondary-font)] text-[16px] font-semibold">READ
                                        MORE</span>
                                        <span
                                            className="absolute bottom-0 left-0 w-full h-0 rounded-tl-[6px] rounded-tr-[6px] bg-[var(--text-1)] transition-all duration-400 -z-[1] group-hover:h-full group-hover:rounded-tl-none"></span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* About Section End */}


            {/* Our_project Start */}
            <div id="projects" className="Our_project bg-[var(--secondary-color)] mt-[80px] lg:mt-[140px]">
                <div className="custom-container">
                    <div className="top_section flex justify-between items-end max-md:flex-col max-md:items-start">
                        <div className="heading_wrap text-left">
                        <span
                            className="tag bg-[var(--primary-color)] text-[var(--secondary-color)] font-[var(--primary-font)] font-medium text-[16px] rounded-[30px] py-[5px] px-[20px]">
                            OUR BEST PROJECTS
                        </span>
                            <h2
                                className="title text-[var(--text-1)] font-[var(--primary-font)] font-medium text-[38px] max-w-[490px] pt-[20px] uppercase max-md:max-w-full lg:text-[32px]">
                                Showcasing excellence in every build.
                            </h2>
                        </div>
                        <div className="button max-md:mt-[30px]">
                            <button
                                className="browse_btn bg-[var(--primary-color)] relative inline-block py-[10px] px-[30px] rounded-tl-none rounded-tr-[12px] rounded-br-[12px] rounded-bl-[12px] border-none cursor-pointer overflow-hidden z-[1] group">
                            <span
                                className="text-[var(--secondary-color)] transition-all duration-400 font-[var(--secondary-font)] text-[16px] font-semibold">BROWSE
                                ALL PROJECTS</span>
                                <span
                                    className="absolute bottom-0 left-0 w-full h-0 rounded-tl-[6px] rounded-tr-[6px] bg-[var(--text-1)] transition-all duration-400 -z-[1] group-hover:h-full group-hover:rounded-tl-none"></span>
                            </button>
                        </div>
                    </div>

                    <div className="projects mt-[40px]">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Project Item 1 */}
                            <div className="flex items-stretch">
                                <div className="project_item w-full transition duration-400">
                                    <div className="image relative w-full aspect-[16/11] rounded-[24px] overflow-hidden">
                                        <img src={ProjectImage1} alt=""
                                             className="w-full h-full object-cover transition duration-400 group-hover:scale-[1.08]" />
                                        <span
                                            className="tag absolute bottom-[14px] left-[14px] bg-[var(--shade-1)] text-[var(--text-1)] font-[var(--primary-font)] font-medium text-[16px] rounded-[30px] py-[5px] px-[20px]">
                                        SHOPPING MALL
                                    </span>
                                    </div>
                                    <Link to="#">
                                        <h3
                                            className="header text-[var(--text-1)] font-[var(--primary-font)] font-medium text-[18px] uppercase py-[12px]">
                                            West End Business Center, Dhaka
                                        </h3>
                                    </Link>
                                    <div className="calender flex items-center gap-[10px]">
                                        <div className="icon flex items-center justify-center w-[40px] h-[40px] rounded-full bg-[var(--shade-1)]">
                                            <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path
                                                    d="M12 19.9998H20M28 10.6665H4M21.3333 2.6665V6.6665M10.6667 2.6665V6.6665M10.4 29.3332H21.6C23.8402 29.3332 24.9603 29.3332 25.816 28.8972C26.5686 28.5137 27.1805 27.9018 27.564 27.1491C28 26.2935 28 25.1734 28 22.9332V11.7332C28 9.49296 28 8.37286 27.564 7.51721C27.1805 6.76456 26.5686 6.15264 25.816 5.76914C24.9603 5.33317 23.8402 5.33317 21.6 5.33317H10.4C8.15979 5.33317 7.03969 5.33317 6.18404 5.76914C5.43139 6.15264 4.81947 6.76456 4.43597 7.51721C4 8.37286 4 9.49296 4 11.7332V22.9332C4 25.1734 4 26.2935 4.43597 27.1491C4.81947 27.9018 5.43139 28.5137 6.18404 28.8972C7.03969 29.3332 8.15979 29.3332 10.4 29.3332Z"
                                                    stroke="#5AA469" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                        <div className="duration">
                                            <h4
                                                className="name text-[var(--primary-color)] font-[var(--primary-font)] font-medium text-[16px] mb-[4px]">
                                                Project Duration
                                            </h4>
                                            <span className="date font-secondary text-[16px]">2023-2024</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/*Project Item 2*/}
                            <div className="flex items-stretch">
                                <div className="project_item w-full transition duration-400">
                                    <div className="image relative w-full aspect-[16/11] rounded-[24px] overflow-hidden">
                                        <img src={ProjectImage2} alt=""
                                             className="w-full h-full object-cover transition duration-400 group-hover:scale-[1.08]" />
                                        <span
                                            className="tag absolute bottom-[14px] left-[14px] bg-[var(--shade-1)] text-[var(--text-1)] font-[var(--primary-font)] font-medium text-[16px] rounded-[30px] py-[5px] px-[20px]">
                                        EDUCATIONAL INSTITUTE
                                    </span>
                                    </div>
                                    <Link to="#">
                                        <h3
                                            className="header text-[var(--text-1)] font-[var(--primary-font)] font-medium text-[18px] uppercase py-[12px]">
                                            UNIVERSITY OF CONNECTICUL, Sylhet
                                        </h3>
                                    </Link>
                                    <div className="calender flex items-center gap-[10px]">
                                        <div className="icon flex items-center justify-center w-[40px] h-[40px] rounded-full bg-[var(--shade-1)]">
                                            <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path
                                                    d="M12 19.9998H20M28 10.6665H4M21.3333 2.6665V6.6665M10.6667 2.6665V6.6665M10.4 29.3332H21.6C23.8402 29.3332 24.9603 29.3332 25.816 28.8972C26.5686 28.5137 27.1805 27.9018 27.564 27.1491C28 26.2935 28 25.1734 28 22.9332V11.7332C28 9.49296 28 8.37286 27.564 7.51721C27.1805 6.76456 26.5686 6.15264 25.816 5.76914C24.9603 5.33317 23.8402 5.33317 21.6 5.33317H10.4C8.15979 5.33317 7.03969 5.33317 6.18404 5.76914C5.43139 6.15264 4.81947 6.76456 4.43597 7.51721C4 8.37286 4 9.49296 4 11.7332V22.9332C4 25.1734 4 26.2935 4.43597 27.1491C4.81947 27.9018 5.43139 28.5137 6.18404 28.8972C7.03969 29.3332 8.15979 29.3332 10.4 29.3332Z"
                                                    stroke="#5AA469" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                        <div className="duration">
                                            <h4
                                                className="name text-[var(--primary-color)] font-[var(--primary-font)] font-medium text-[16px] mb-[4px]">
                                                Project Duration
                                            </h4>
                                            <span className="date font-secondary text-[16px]">2023-2024</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/*Project Item 3*/}
                            <div className="flex items-stretch">
                                <div className="project_item w-full transition duration-400">
                                    <div className="image relative w-full aspect-[16/11] rounded-[24px] overflow-hidden">
                                        <img src={ProjectImage3} alt=""
                                             className="w-full h-full object-cover transition duration-400 group-hover:scale-[1.08]" />
                                        <span
                                            className="tag absolute bottom-[14px] left-[14px] bg-[var(--shade-1)] text-[var(--text-1)] font-[var(--primary-font)] font-medium text-[16px] rounded-[30px] py-[5px] px-[20px]">
                                        HOME
                                    </span>
                                    </div>
                                    <Link to="#">
                                        <h3
                                            className="header text-[var(--text-1)] font-[var(--primary-font)] font-medium text-[18px] uppercase py-[12px]">
                                            VIVALA MENSION, SYLHET
                                        </h3>
                                    </Link>
                                    <div className="calender flex items-center gap-[10px]">
                                        <div className="icon flex items-center justify-center w-[40px] h-[40px] rounded-full bg-[var(--shade-1)]">
                                            <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path
                                                    d="M12 19.9998H20M28 10.6665H4M21.3333 2.6665V6.6665M10.6667 2.6665V6.6665M10.4 29.3332H21.6C23.8402 29.3332 24.9603 29.3332 25.816 28.8972C26.5686 28.5137 27.1805 27.9018 27.564 27.1491C28 26.2935 28 25.1734 28 22.9332V11.7332C28 9.49296 28 8.37286 27.564 7.51721C27.1805 6.76456 26.5686 6.15264 25.816 5.76914C24.9603 5.33317 23.8402 5.33317 21.6 5.33317H10.4C8.15979 5.33317 7.03969 5.33317 6.18404 5.76914C5.43139 6.15264 4.81947 6.76456 4.43597 7.51721C4 8.37286 4 9.49296 4 11.7332V22.9332C4 25.1734 4 26.2935 4.43597 27.1491C4.81947 27.9018 5.43139 28.5137 6.18404 28.8972C7.03969 29.3332 8.15979 29.3332 10.4 29.3332Z"
                                                    stroke="#5AA469" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                        <div className="duration">
                                            <h4
                                                className="name text-[var(--primary-color)] font-[var(--primary-font)] font-medium text-[16px] mb-[4px]">
                                                Project Duration
                                            </h4>
                                            <span className="date font-secondary text-[16px]">2023-2024</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Project Item 4 */}
                            <div className="flex items-stretch">
                                <div className="project_item w-full transition duration-400">
                                    <div className="image relative w-full aspect-[16/11] rounded-[24px] overflow-hidden">
                                        <img src={ProjectImage4} alt=""
                                             className="w-full h-full object-cover transition duration-400 group-hover:scale-[1.08]" />
                                        <span
                                            className="tag absolute bottom-[14px] left-[14px] bg-[var(--shade-1)] text-[var(--text-1)] font-[var(--primary-font)] font-medium text-[16px] rounded-[30px] py-[5px] px-[20px]">
                                        OFFICE
                                    </span>
                                    </div>
                                    <Link to="#">
                                        <h3
                                            className="header text-[var(--text-1)] font-[var(--primary-font)] font-medium text-[18px] uppercase py-[12px]">
                                            CENTER OF ROYAL, Dhaka
                                        </h3>
                                    </Link>
                                    <div className="calender flex items-center gap-[10px]">
                                        <div className="icon flex items-center justify-center w-[40px] h-[40px] rounded-full bg-[var(--shade-1)]">
                                            <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path
                                                    d="M12 19.9998H20M28 10.6665H4M21.3333 2.6665V6.6665M10.6667 2.6665V6.6665M10.4 29.3332H21.6C23.8402 29.3332 24.9603 29.3332 25.816 28.8972C26.5686 28.5137 27.1805 27.9018 27.564 27.1491C28 26.2935 28 25.1734 28 22.9332V11.7332C28 9.49296 28 8.37286 27.564 7.51721C27.1805 6.76456 26.5686 6.15264 25.816 5.76914C24.9603 5.33317 23.8402 5.33317 21.6 5.33317H10.4C8.15979 5.33317 7.03969 5.33317 6.18404 5.76914C5.43139 6.15264 4.81947 6.76456 4.43597 7.51721C4 8.37286 4 9.49296 4 11.7332V22.9332C4 25.1734 4 26.2935 4.43597 27.1491C4.81947 27.9018 5.43139 28.5137 6.18404 28.8972C7.03969 29.3332 8.15979 29.3332 10.4 29.3332Z"
                                                    stroke="#5AA469" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                        <div className="duration">
                                            <h4
                                                className="name text-[var(--primary-color)] font-[var(--primary-font)] font-medium text-[16px] mb-[4px]">
                                                Project Duration
                                            </h4>
                                            <span className="date font-secondary text-[16px]">2023-2024</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Project Item 5 */}
                            <div className="flex items-stretch">
                                <div className="project_item w-full transition duration-400">
                                    <div className="image relative w-full aspect-[16/11] rounded-[24px] overflow-hidden">
                                        <img src={ProjectImage5} alt=""
                                             className="w-full h-full object-cover transition duration-400 group-hover:scale-[1.08]" />
                                        <span
                                            className="tag absolute bottom-[14px] left-[14px] bg-[var(--shade-1)] text-[var(--text-1)] font-[var(--primary-font)] font-medium text-[16px] rounded-[30px] py-[5px] px-[20px]">
                                        SHOPPING MALL
                                    </span>
                                    </div>
                                    <Link to="#">
                                        <h3
                                            className="header text-[var(--text-1)] font-[var(--primary-font)] font-medium text-[18px] uppercase py-[12px]">
                                            ABDALI MALL, RAJSHAHI
                                        </h3>
                                    </Link>
                                    <div className="calender flex items-center gap-[10px]">
                                        <div className="icon flex items-center justify-center w-[40px] h-[40px] rounded-full bg-[var(--shade-1)]">
                                            <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path
                                                    d="M12 19.9998H20M28 10.6665H4M21.3333 2.6665V6.6665M10.6667 2.6665V6.6665M10.4 29.3332H21.6C23.8402 29.3332 24.9603 29.3332 25.816 28.8972C26.5686 28.5137 27.1805 27.9018 27.564 27.1491C28 26.2935 28 25.1734 28 22.9332V11.7332C28 9.49296 28 8.37286 27.564 7.51721C27.1805 6.76456 26.5686 6.15264 25.816 5.76914C24.9603 5.33317 23.8402 5.33317 21.6 5.33317H10.4C8.15979 5.33317 7.03969 5.33317 6.18404 5.76914C5.43139 6.15264 4.81947 6.76456 4.43597 7.51721C4 8.37286 4 9.49296 4 11.7332V22.9332C4 25.1734 4 26.2935 4.43597 27.1491C4.81947 27.9018 5.43139 28.5137 6.18404 28.8972C7.03969 29.3332 8.15979 29.3332 10.4 29.3332Z"
                                                    stroke="#5AA469" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                        <div className="duration">
                                            <h4
                                                className="name text-[var(--primary-color)] font-[var(--primary-font)] font-medium text-[16px] mb-[4px]">
                                                Project Duration
                                            </h4>
                                            <span className="date font-secondary text-[16px]">2023-2024</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Project Item 6 */}
                            <div className="flex items-stretch">
                                <div className="project_item w-full transition duration-400">
                                    <div className="image relative w-full aspect-[16/11] rounded-[24px] overflow-hidden">
                                        <img src={ProjectImage6} alt=""
                                             className="w-full h-full object-cover transition duration-400 group-hover:scale-[1.08]" />
                                        <span
                                            className="tag absolute bottom-[14px] left-[14px] bg-[var(--shade-1)] text-[var(--text-1)] font-[var(--primary-font)] font-medium text-[16px] rounded-[30px] py-[5px] px-[20px]">
                                        HOSPITAL
                                    </span>
                                    </div>
                                    <Link to="#">
                                        <h3
                                            className="header text-[var(--text-1)] font-[var(--primary-font)] font-medium text-[18px] uppercase py-[12px]">
                                            FINHA HOSPITAL, Dhaka
                                        </h3>
                                    </Link>
                                    <div className="calender flex items-center gap-[10px]">
                                        <div className="icon flex items-center justify-center w-[40px] h-[40px] rounded-full bg-[var(--shade-1)]">
                                            <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path
                                                    d="M12 19.9998H20M28 10.6665H4M21.3333 2.6665V6.6665M10.6667 2.6665V6.6665M10.4 29.3332H21.6C23.8402 29.3332 24.9603 29.3332 25.816 28.8972C26.5686 28.5137 27.1805 27.9018 27.564 27.1491C28 26.2935 28 25.1734 28 22.9332V11.7332C28 9.49296 28 8.37286 27.564 7.51721C27.1805 6.76456 26.5686 6.15264 25.816 5.76914C24.9603 5.33317 23.8402 5.33317 21.6 5.33317H10.4C8.15979 5.33317 7.03969 5.33317 6.18404 5.76914C5.43139 6.15264 4.81947 6.76456 4.43597 7.51721C4 8.37286 4 9.49296 4 11.7332V22.9332C4 25.1734 4 26.2935 4.43597 27.1491C4.81947 27.9018 5.43139 28.5137 6.18404 28.8972C7.03969 29.3332 8.15979 29.3332 10.4 29.3332Z"
                                                    stroke="#5AA469" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                        <div className="duration">
                                            <h4
                                                className="name text-[var(--primary-color)] font-[var(--primary-font)] font-medium text-[16px] mb-[4px]">
                                                Project Duration
                                            </h4>
                                            <span className="date font-secondary text-[16px]">2023-2024</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Project Item 7 */}
                            <div className="flex items-stretch">
                                <div className="project_item w-full transition duration-400">
                                    <div className="image relative w-full aspect-[16/11] rounded-[24px] overflow-hidden">
                                        <img src={ProjectImage7} alt=""
                                             className="w-full h-full object-cover transition duration-400 group-hover:scale-[1.08]" />
                                        <span
                                            className="tag absolute bottom-[14px] left-[14px] bg-[var(--shade-1)] text-[var(--text-1)] font-[var(--primary-font)] font-medium text-[16px] rounded-[30px] py-[5px] px-[20px]">
                                        COMMERCIAL
                                    </span>
                                    </div>
                                    <Link to="#">
                                        <h3
                                            className="header text-[var(--text-1)] font-[var(--primary-font)] font-medium text-[18px] uppercase py-[12px]">
                                            ALEXA COMPLAX, RAJSHAHI
                                        </h3>
                                    </Link>
                                    <div className="calender flex items-center gap-[10px]">
                                        <div className="icon flex items-center justify-center w-[40px] h-[40px] rounded-full bg-[var(--shade-1)]">
                                            <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path
                                                    d="M12 19.9998H20M28 10.6665H4M21.3333 2.6665V6.6665M10.6667 2.6665V6.6665M10.4 29.3332H21.6C23.8402 29.3332 24.9603 29.3332 25.816 28.8972C26.5686 28.5137 27.1805 27.9018 27.564 27.1491C28 26.2935 28 25.1734 28 22.9332V11.7332C28 9.49296 28 8.37286 27.564 7.51721C27.1805 6.76456 26.5686 6.15264 25.816 5.76914C24.9603 5.33317 23.8402 5.33317 21.6 5.33317H10.4C8.15979 5.33317 7.03969 5.33317 6.18404 5.76914C5.43139 6.15264 4.81947 6.76456 4.43597 7.51721C4 8.37286 4 9.49296 4 11.7332V22.9332C4 25.1734 4 26.2935 4.43597 27.1491C4.81947 27.9018 5.43139 28.5137 6.18404 28.8972C7.03969 29.3332 8.15979 29.3332 10.4 29.3332Z"
                                                    stroke="#5AA469" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                        <div className="duration">
                                            <h4
                                                className="name text-[var(--primary-color)] font-[var(--primary-font)] font-medium text-[16px] mb-[4px]">
                                                Project Duration
                                            </h4>
                                            <span className="date font-secondary text-[16px]">2023-2024</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Project Item 8 */}
                            <div className="flex items-stretch">
                                <div className="project_item w-full transition duration-400">
                                    <div className="image relative w-full aspect-[16/11] rounded-[24px] overflow-hidden">
                                        <img src={ProjectImage8} alt=""
                                             className="w-full h-full object-cover transition duration-400 group-hover:scale-[1.08]" />
                                        <span
                                            className="tag absolute bottom-[14px] left-[14px] bg-[var(--shade-1)] text-[var(--text-1)] font-[var(--primary-font)] font-medium text-[16px] rounded-[30px] py-[5px] px-[20px]">
                                        COMMERCIAL
                                    </span>
                                    </div>
                                    <Link to="#">
                                        <h3
                                            className="header text-[var(--text-1)] font-[var(--primary-font)] font-medium text-[18px] uppercase py-[12px]">
                                            ORIENT STADIUM, RONGPUR
                                        </h3>
                                    </Link>
                                    <div className="calender flex items-center gap-[10px]">
                                        <div className="icon flex items-center justify-center w-[40px] h-[40px] rounded-full bg-[var(--shade-1)]">
                                            <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path
                                                    d="M12 19.9998H20M28 10.6665H4M21.3333 2.6665V6.6665M10.6667 2.6665V6.6665M10.4 29.3332H21.6C23.8402 29.3332 24.9603 29.3332 25.816 28.8972C26.5686 28.5137 27.1805 27.9018 27.564 27.1491C28 26.2935 28 25.1734 28 22.9332V11.7332C28 9.49296 28 8.37286 27.564 7.51721C27.1805 6.76456 26.5686 6.15264 25.816 5.76914C24.9603 5.33317 23.8402 5.33317 21.6 5.33317H10.4C8.15979 5.33317 7.03969 5.33317 6.18404 5.76914C5.43139 6.15264 4.81947 6.76456 4.43597 7.51721C4 8.37286 4 9.49296 4 11.7332V22.9332C4 25.1734 4 26.2935 4.43597 27.1491C4.81947 27.9018 5.43139 28.5137 6.18404 28.8972C7.03969 29.3332 8.15979 29.3332 10.4 29.3332Z"
                                                    stroke="#5AA469" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                        <div className="duration">
                                            <h4
                                                className="name text-[var(--primary-color)] font-[var(--primary-font)] font-medium text-[16px] mb-[4px]">
                                                Project Duration
                                            </h4>
                                            <span className="date font-secondary text-[16px]">2023-2024</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Project Item 9 */}
                            <div className="flex items-stretch">
                                <div className="project_item w-full transition duration-400">
                                    <div className="image relative w-full aspect-[16/11] rounded-[24px] overflow-hidden">
                                        <img src={ProjectImage9} alt=""
                                             className="w-full h-full object-cover transition duration-400 group-hover:scale-[1.08]" />
                                        <span
                                            className="tag absolute bottom-[14px] left-[14px] bg-[var(--shade-1)] text-[var(--text-1)] font-[var(--primary-font)] font-medium text-[16px] rounded-[30px] py-[5px] px-[20px]">
                                        HOME
                                    </span>
                                    </div>
                                    <Link to="#">
                                        <h3
                                            className="header text-[var(--text-1)] font-[var(--primary-font)] font-medium text-[18px] uppercase py-[12px]">
                                            AURA VILLA, Dhaka
                                        </h3>
                                    </Link>
                                    <div className="calender flex items-center gap-[10px]">
                                        <div className="icon flex items-center justify-center w-[40px] h-[40px] rounded-full bg-[var(--shade-1)]">
                                            <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path
                                                    d="M12 19.9998H20M28 10.6665H4M21.3333 2.6665V6.6665M10.6667 2.6665V6.6665M10.4 29.3332H21.6C23.8402 29.3332 24.9603 29.3332 25.816 28.8972C26.5686 28.5137 27.1805 27.9018 27.564 27.1491C28 26.2935 28 25.1734 28 22.9332V11.7332C28 9.49296 28 8.37286 27.564 7.51721C27.1805 6.76456 26.5686 6.15264 25.816 5.76914C24.9603 5.33317 23.8402 5.33317 21.6 5.33317H10.4C8.15979 5.33317 7.03969 5.33317 6.18404 5.76914C5.43139 6.15264 4.81947 6.76456 4.43597 7.51721C4 8.37286 4 9.49296 4 11.7332V22.9332C4 25.1734 4 26.2935 4.43597 27.1491C4.81947 27.9018 5.43139 28.5137 6.18404 28.8972C7.03969 29.3332 8.15979 29.3332 10.4 29.3332Z"
                                                    stroke="#5AA469" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                        <div className="duration">
                                            <h4
                                                className="name text-[var(--primary-color)] font-[var(--primary-font)] font-medium text-[16px] mb-[4px]">
                                                Project Duration
                                            </h4>
                                            <span className="date font-secondary text-[16px]">2023-2024</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Our_project End */}


            {/* Client Start */}
            <div className="our_client bg-[var(--ac-2)] py-[60px] mt-[60px]">
                <div className="heading_wrap text-center mb-[40px]">
          <span
              className="tag text-[16px] font-medium font-[var(--primary-font)] text-[var(--secondary-color)] bg-[var(--primary-color)] py-[5px] px-[20px] rounded-[30px]"
          >
            OUR TOP CLIENTS
          </span>
                    <h2
                        className="title text-[32px] lg:text-[38px] font-medium font-[var(--primary-font)] text-[var(--text-1)] py-[20px] px-[10px] pt-[20px] pb-0 uppercase max-w-[680px] mx-auto"
                    >
                        Trusted by innovators, leaders, and visionaries worldwide.
                    </h2>
                </div>

                <div
                    className="logo_slider mb-4 scroller2 max-w-full overflow-hidden"
                    data-speed="fast"
                    data-animated="true"
                    ref={(el) => (scrollerRefs.current[0] = el)}
                    onMouseEnter={() => handleMouseEnter(0)}
                    onMouseLeave={() => handleMouseLeave(0)}
                >
                    <div
                        className="logos_slide tag-list scroller__inner2 w-max flex flex-nowrap gap-[2.4rem] items-center py-[1rem]"
                    >
                        <Link to="#" className="logo">
                            <img
                                src={ClientLogo1}
                                className="w-[247px] h-[110px] rounded-[12px]"
                                alt=""
                            />
                        </Link>
                        <Link to="#" className="logo">
                            <img
                                src={ClientLogo2}
                                className="w-[247px] h-[110px] rounded-[12px]"
                                alt=""
                            />
                        </Link>
                        <Link to="#" className="logo">
                            <img
                                src={ClientLogo3}
                                className="w-[247px] h-[110px] rounded-[12px]"
                                alt=""
                            />
                        </Link>
                        <Link to="#" className="logo">
                            <img
                                src={ClientLogo4}
                                className="w-[247px] h-[110px] rounded-[12px]"
                                alt=""
                            />
                        </Link>
                        <Link to="#" className="logo">
                            <img
                                src={ClientLogo5}
                                className="w-[247px] h-[110px] rounded-[12px]"
                                alt=""
                            />
                        </Link>
                        <Link to="#" className="logo">
                            <img
                                src={ClientLogo6}
                                className="w-[247px] h-[110px] rounded-[12px]"
                                alt=""
                            />
                        </Link>
                    </div>
                </div>

                <div
                    className="logo_slider2 scroller max-w-full overflow-hidden"
                    data-speed="fast"
                    data-direction="right"
                    ref={(el) => (scrollerRefs.current[1] = el)}
                    onMouseEnter={() => handleMouseEnter(1)}
                    onMouseLeave={() => handleMouseLeave(1)}
                >
                    <div
                        className="logos_slide2 tag-list scroller__inner w-max flex flex-nowrap gap-[2.4rem] items-center py-[1rem]"
                    >
                        <Link to="#" className="logo">
                            <img
                                src={ClientLogo7}
                                className="w-[247px] h-[110px] rounded-[12px]"
                                alt=""
                            />
                        </Link>
                        <Link to="#" className="logo">
                            <img
                                src={ClientLogo8}
                                className="w-[247px] h-[110px] rounded-[12px]"
                                alt=""
                            />
                        </Link>
                        <Link to="#" className="logo">
                            <img
                                src={ClientLogo9}
                                className="w-[247px] h-[110px] rounded-[12px]"
                                alt=""
                            />
                        </Link>
                        <Link to="#" className="logo">
                            <img
                                src={ClientLogo10}
                                className="w-[247px] h-[110px] rounded-[12px]"
                                alt=""
                            />
                        </Link>
                        <Link to="#" className="logo">
                            <img
                                src={ClientLogo11}
                                className="w-[247px] h-[110px] rounded-[12px]"
                                alt=""
                            />
                        </Link>
                        <Link to="#" className="logo">
                            <img
                                src={ClientLogo12}
                                className="w-[247px] h-[110px] rounded-[12px]"
                                alt=""
                            />
                        </Link>
                    </div>
                </div>
            </div>
            {/* Client End */}

        </>
    );
};

export default Home;