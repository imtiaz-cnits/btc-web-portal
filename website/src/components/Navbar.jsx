import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from "../../api/index.js";
import Logo from '../assets/icon/Logo.svg';
import { useMarquee } from '../assets/js/style.js';

const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false);
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const dropdownRef = useRef(null);
    const location = useLocation(); // Get current location

    // Fetch notices from backend
    useEffect(() => {
        const fetchNotices = async () => {
            try {
                const response = await api.get('/notices');
                if (response.data.success) {
                    const formattedNotices = response.data.notices.map(notice => ({
                        id: notice._id,
                        title: notice.title,
                        link: `/notice/${notice._id}`,
                    }));
                    setNotices(formattedNotices);
                    setLoading(false);
                } else {
                    throw new Error(response.data.message || 'Failed to fetch notices');
                }
            } catch (err) {
                setError(err.message || 'Failed to load notices.');
                setLoading(false);
                console.error('Error fetching notices:', err);
            }
        };

        fetchNotices();
    }, []);

    // Use marquee animation hook
    const { marqueeRef, handleMouseEnter, handleMouseLeave } = useMarquee(70, notices);

    // Toggle mobile menu
    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(prev => !prev);
        if (isMobileMenuOpen) {
            setIsMobileDropdownOpen(false);
        }
    };

    // Toggle mobile dropdown
    const toggleMobileDropdown = (e) => {
        e.stopPropagation();
        setIsMobileDropdownOpen(prev => !prev);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsMobileDropdownOpen(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    return (
        <div>
            {/* Top Notice Board */}
            <div className="top_notice_board bg-[var(--text-1)] py-[6px]">
                <div className="text_marquee flex items-center overflow-x-hidden">
                    {loading ? (
                        <span
                            className="text-[var(--secondary-color)] text-[16px] font-[400] font-[var(--primary-font)] inline-block mx-auto">
                            Loading notices...
                        </span>
                    ) : error ? (
                        <span
                            className="text-[var(--secondary-color)] text-[16px] font-[400] font-[var(--primary-font)] inline-block mx-auto">
                            {error}
                        </span>
                    ) : notices.length === 0 ? (
                        <span
                            className="text-[var(--secondary-color)] text-[16px] font-[400] font-[var(--primary-font)] inline-block mx-auto">
                            No notices available.
                        </span>
                    ) : (
                        <div
                            className="text_single relative flex items-center whitespace-nowrap p-0 m-0 will-change-transform"
                            ref={marqueeRef}
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                        >
                            {notices.map((notice) => (
                                <Link
                                    key={notice.id}
                                    to={notice.link}
                                    className="js_text text-[var(--secondary-color)] text-[16px] font-[400] font-[var(--primary-font)] inline-block mr-[10px] pr-[10px] relative max-w-[200px] overflow-hidden text-ellipsis"
                                >
                                    {notice.title}
                                    <span
                                        className="absolute top-[3px] right-0 w-[1px] h-[75%] bg-[var(--secondary-color)]"></span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Top Bar */}
            <div className="topbar hidden lg:block">
                <div className="custom-container mx-auto">
                    <div className="flex justify-between items-center py-2.5 border-b border-b-[var(--ac-1)]">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-1">
                                <svg width="20" height="20" viewBox="0 0 32 32" fill="none"
                                     xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M27.75 19.8L21.8875 17.3C21.585 17.1644 21.253 17.1082 20.9227 17.1366C20.5924 17.1651 20.2749 17.2772 20 17.4625L16.8625 19.55C14.9503 18.6213 13.4021 17.0819 12.4625 15.175L14.5375 12C14.7216 11.7249 14.834 11.4081 14.8645 11.0785C14.8951 10.7488 14.8428 10.4168 14.7125 10.1125L12.2 4.25001C12.0247 3.85415 11.7278 3.52443 11.3525 3.30866C10.9771 3.0929 10.5428 3.0023 10.1125 3.05001C8.42449 3.27114 6.87421 4.09773 5.7499 5.37608C4.62559 6.65444 4.00375 8.29758 4 10C4 19.925 12.075 28 22 28C23.7024 27.9963 25.3456 27.3744 26.6239 26.2501C27.9023 25.1258 28.7289 23.5755 28.95 21.8875C28.9977 21.4572 28.9071 21.0229 28.6913 20.6475C28.4756 20.2722 28.1459 19.9753 27.75 19.8Z"
                                        fill="#171717"
                                    />
                                    <path
                                        d="M19.675 5.96249C21.1972 6.37835 22.5846 7.1839 23.7003 8.29967C24.8161 9.41543 25.6217 10.8028 26.0375 12.325C26.0927 12.5387 26.217 12.7281 26.3911 12.8638C26.5652 12.9995 26.7793 13.0737 27 13.075C27.0888 13.0748 27.1772 13.0622 27.2625 13.0375C27.3896 13.0042 27.5088 12.9459 27.6131 12.866C27.7174 12.7861 27.8047 12.6862 27.8699 12.5721C27.9351 12.458 27.9769 12.3321 27.9928 12.2016C28.0087 12.0712 27.9984 11.9389 27.9625 11.8125C27.4625 9.94835 26.4809 8.24856 25.1162 6.88383C23.7514 5.5191 22.0517 4.53746 20.1875 4.03749C20.0571 3.98997 19.9182 3.97013 19.7796 3.97923C19.6411 3.98834 19.506 4.02619 19.3829 4.09037C19.2598 4.15456 19.1514 4.24367 19.0646 4.35204C18.9779 4.4604 18.9146 4.58565 18.8789 4.71981C18.8432 4.85396 18.8358 4.99409 18.8572 5.13126C18.8786 5.26843 18.9283 5.39963 19.0032 5.51653C19.0781 5.63343 19.1765 5.73345 19.2922 5.81023C19.4078 5.88701 19.5382 5.93886 19.675 5.96249Z"
                                        fill="#171717"
                                    />
                                    <path
                                        d="M18.6375 9.82501C19.4836 10.0566 20.2548 10.5046 20.8751 11.1249C21.4954 11.7452 21.9434 12.5164 22.175 13.3625C22.2282 13.5773 22.352 13.768 22.5266 13.904C22.7011 14.04 22.9162 14.1134 23.1375 14.1125C23.2223 14.1133 23.3067 14.1007 23.3875 14.075C23.5158 14.0431 23.6363 13.9858 23.742 13.9065C23.8477 13.8272 23.9364 13.7274 24.0028 13.6132C24.0693 13.499 24.1121 13.3725 24.1288 13.2415C24.1455 13.1104 24.1357 12.9773 24.1 12.85C23.7843 11.6619 23.1602 10.5783 22.291 9.70905C21.4217 8.83978 20.3381 8.21569 19.15 7.90001C19.0196 7.85249 18.8807 7.83265 18.7421 7.84175C18.6036 7.85086 18.4685 7.88871 18.3454 7.95289C18.2223 8.01707 18.1139 8.10619 18.0271 8.21455C17.9403 8.32292 17.8771 8.44817 17.8414 8.58233C17.8057 8.71648 17.7983 8.85661 17.8197 8.99378C17.8411 9.13094 17.8908 9.26215 17.9657 9.37905C18.0406 9.49595 18.139 9.59597 18.2547 9.67275C18.3703 9.74953 18.5007 9.80138 18.6375 9.82501Z"
                                        fill="#171717"
                                    />
                                </svg>
                                <a
                                    href="tel:01711010929"
                                    className="text-text-1 text-base font-normal font-secondary ml-0.5 hover:text-[var(--primary-color)] transition duration-300"
                                >
                                    01711010929(Imran), 01711805086(Shah Alom)
                                </a>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <a href="https://www.facebook.com/egpbtc"
                               className="hover:text-[var(--primary-color)] transition duration-400"
                               style={{ marginTop: '4px', marginBottom: '-4px' }}>
                                <i className="fa-brands fa-facebook-f text-text-1 text-xl hover:text-[var(--primary-color)] transition duration-400"></i>
                            </a>
                            {/*<a href="#" className="hover:text-[var(--primary-color)] transition duration-400">*/}
                            {/*    <i className="fa-brands fa-instagram text-text-1 text-xl hover:text-[var(--primary-color)] transition duration-400"></i>*/}
                            {/*</a>*/}
                            {/*<a href="#" className="hover:text-[var(--primary-color)] transition duration-400">*/}
                            {/*    <i className="fa-brands fa-x-twitter text-text-1 text-xl hover:text-[var(--primary-color)] transition duration-400"></i>*/}
                            {/*</a>*/}
                            {/*<a href="#" className="hover:text-[var(--primary-color)] transition duration-400">*/}
                            {/*    <i className="fa-brands fa-linkedin-in text-text-1 text-xl hover:text-[var(--primary-color)] transition duration-400"></i>*/}
                            {/*</a>*/}

                            <div className="text-text-1 text-xl font-normal mx-2.5">|</div>

                            <div className="flex items-center gap-1">
                                <svg width="20" height="20" viewBox="0 0 32 32" fill="none"
                                     xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M21.4227 18.1333L31.6693 26.916C31.8873 26.4168 31.9999 25.878 32 25.3333V11.3987L21.4227 18.1333Z"
                                        fill="#171717"
                                    />
                                    <path
                                        d="M16.7173 17.964L31.856 8.32934C31.6343 7.47427 31.1358 6.71664 30.4382 6.17467C29.7407 5.6327 28.8834 5.33687 28 5.33334H4.00001C3.11667 5.33687 2.25934 5.6327 1.56179 6.17467C0.864249 6.71664 0.365726 7.47427 0.144012 8.32934L15.284 17.964C15.4985 18.0996 15.747 18.1715 16.0007 18.1715C16.2544 18.1715 16.5029 18.0996 16.7173 17.964Z"
                                        fill="#171717"
                                    />
                                    <path
                                        d="M0 11.3987V25.3333C0.000494642 25.8771 0.113058 26.415 0.330667 26.9133L10.5773 18.1333L0 11.3987Z"
                                        fill="#171717"
                                    />
                                    <path
                                        d="M19.0854 19.6187L18.152 20.2147C17.5093 20.6206 16.7648 20.836 16.0047 20.836C15.2446 20.836 14.500 20.6206 13.8573 20.2147L12.924 19.6173C12.904 19.636 12.896 19.6613 12.876 19.6787L2.15735 28.86C2.72364 29.166 3.35634 29.3286 4.00002 29.3333H28C28.6441 29.3286 29.2772 29.166 29.844 28.86L19.1334 19.6787C19.112 19.6613 19.104 19.636 19.0854 19.6187Z"
                                        fill="#171717"
                                    />
                                </svg>
                                <a
                                    href="mailto:info@egpbtc.com"
                                    className="text-text-1 text-base font-normal font-secondary ml-0.5 hover:text-[var(--primary-color)] transition duration-300"
                                >
                                    info@egpbtc.com
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navbar */}
            <nav className="navBar bg-[var(--secondary-color)] sticky top-0 w-full z-[50]">
                <div className="custom-container">
                    <div className="w-full border-b border-b-[var(--ac-1)]">
                        <div className="flex justify-between h-[80px] items-center">
                            <Link to="/" className="text-2xl font-extrabold">
                                <img className="w-[160px] object-contain" src={Logo} alt=""/>
                            </Link>
                            <div className="hidden lg:flex space-x-6 items-center">
                                <Link to="/"
                                      className={`transition duration-400 font-medium ${
                                          location.pathname === '/' ? 'text-[var(--primary-color)]' : 'text-[var(--text-1)] hover:text-[var(--primary-color)]'
                                      }`}>
                                    HOME
                                </Link>
                                <Link to="/services"
                                      className={`transition duration-400 font-medium ${
                                          location.pathname === '/services' ? 'text-[var(--primary-color)]' : 'text-[var(--text-1)] hover:text-[var(--primary-color)]'
                                      }`}>
                                    SERVICES
                                </Link>
                                <Link to="/projects"
                                      className={`transition duration-400 font-medium ${
                                          location.pathname === '/projects' ? 'text-[var(--primary-color)]' : 'text-[var(--text-1)] hover:text-[var(--primary-color)]'
                                      }`}>
                                    PROJECTS
                                </Link>
                                <div className="relative dropdown group">
                                    <button
                                        className={`flex cursor-pointer items-center transition duration-400 font-medium ${
                                            ['/notice', '/winner'].some(path => location.pathname === path)
                                                ? 'text-[var(--primary-color)]'
                                                : 'text-[var(--text-1)] hover:text-[var(--primary-color)]'
                                        }`}>
                                        NOTICES
                                        <svg className="w-4 h-4 ml-1 rotate-icon" fill="none" stroke="currentColor"
                                             viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                  d="M19 9l-7 7-7-7"/>
                                        </svg>
                                    </button>
                                    <div
                                        className="dropdown-content absolute mt-2 w-56 border border-[var(--ac-2)] rounded-lg shadow-lg">
                                        <Link to="/notice" className={`block px-4 py-2 ${
                                            location.pathname === '/notice' ? 'bg-[var(--primary-color)] text-[var(--secondary-color)]' : 'hover:bg-[var(--primary-color)]'
                                        }`}>
                                            EGP TENDER NOTICE
                                        </Link>
                                        <Link to="/winner" className={`block px-4 py-2 ${
                                            location.pathname === '/winner' ? 'bg-[var(--primary-color)] text-[var(--secondary-color)]' : 'hover:bg-[var(--primary-color)]'
                                        }`}>
                                            WINNER LIST
                                        </Link>
                                    </div>
                                </div>
                                <Link to="/about"
                                      className={`transition duration-400 font-medium ${
                                          location.pathname === '/about' ? 'text-[var(--primary-color)]' : 'text-[var(--text-1)] hover:text-[var(--primary-color)]'
                                      }`}>
                                    ABOUT US
                                </Link>
                            </div>
                            <div className="hidden lg:block">
                                <Link
                                    to="/contact"
                                    className={`contact_btn cursor-pointer relative inline-flex items-center justify-center px-8 py-2.5 overflow-hidden tracking-tighter text-[var(--secondary-color)] bg-[var(--primary-color)] rounded-tl-lg rounded-tr-lg rounded-bl-0 rounded-br-lg group ${
                                        location.pathname === '/contact' ? 'ring-2 ring-[var(--primary-color)]' : ''
                                    }`}
                                >
                                    <span
                                        className="absolute bottom-0 left-0 right-0 h-0 transition-all duration-500 ease-out bg-[var(--text-1)] group-hover:h-full"></span>
                                    <span className="relative text-base font-semibold">CONTACT US</span>
                                </Link>
                            </div>
                            <div className="lg:hidden">
                                <button onClick={toggleMobileMenu} id="menu-btn"
                                        className="text-[var(--text-1)] cursor-pointer">
                                    <svg width="44" height="44" viewBox="0 0 44 44" fill="none"
                                         xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M5.5 22H38.5M5.5 11H38.5M5.5 33H27.5"
                                            stroke="#c26c2a"
                                            strokeWidth="3"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        ></path>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu */}
            <div
                id="mobile-menu"
                className={`fixed overflow-auto top-0 left-0 h-full w-64 bg-[var(--secondary-color)] shadow-lg transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                } transition-transform duration-300 ease-in-out z-[52] lg:hidden`}
            >
                <div className="flex justify-between items-center px-4 py-3 border-b">
                    <Link to="/" className="text-xl font-bold">
                        <img className="w-[100px] object-contain" src={Logo} alt=""/>
                    </Link>
                    <button onClick={toggleMobileMenu} id="close-menu" className="text-[var(--text-1)] cursor-pointer">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                  d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
                <div className="px-4 py-2 space-y-1" ref={dropdownRef}>
                    <Link to="/"
                          className={`block px-3 py-2 rounded-lg ${
                              location.pathname === '/' ? 'text-[var(--primary-color)] bg-[var(--shade-1)]' : 'text-[var(--text-1)] bg-[var(--shade-1)] active:bg-[var(--shade-1)]'
                          }`}>
                        HOME
                    </Link>
                    <Link to="/services"
                          className={`block px-3 py-2 rounded-lg ${
                              location.pathname === '/services' ? 'text-[var(--primary-color)] hover:bg-[var(--shade-1)]' : 'text-[var(--text-1)] hover:bg-[var(--shade-1)]'
                          }`}>
                        SERVICES
                    </Link>
                    <Link to="/tender"
                          className={`block px-3 py-2 rounded-lg ${
                              location.pathname === '/tender' ? 'text-[var(--primary-color)] hover:bg-[var(--shade-1)]' : 'text-[var(--text-1)] hover:bg-[var(--shade-1)]'
                          }`}>
                        TENDER
                    </Link>
                    <Link to="/projects"
                          className={`block px-3 py-2 rounded-lg ${
                              location.pathname === '/projects' ? 'text-[var(--primary-color)] hover:bg-[var(--shade-1)]' : 'text-[var(--text-1)] hover:bg-[var(--shade-1)]'
                          }`}>
                        PROJECTS
                    </Link>
                    <div>
                        <button
                            onClick={toggleMobileDropdown}
                            className={`mobile-dropdown-btn flex justify-between items-center w-full px-3 py-2 rounded-lg ${
                                ['/notice', '/gallery', '/blog', '/privacy-policy', '/terms-conditions'].some(path => location.pathname === path)
                                    ? 'text-[var(--primary-color)] hover:bg-[var(--shade-1)]'
                                    : 'text-[var(--text-1)] hover:bg-[var(--shade-1)]'
                            }`}
                        >
                            PAGES
                            <svg
                                className={`mobile-dropdown-icon w-4 h-4 ml-2 ${isMobileDropdownOpen ? 'open' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                            </svg>
                        </button>
                        <div
                            className={`mobile-dropdown ${isMobileDropdownOpen ? 'open' : ''} bg-[var(--text-1)] rounded-lg`}>
                            <Link to="/notice"
                                  className={`block px-3 py-2 text-[14px] ${
                                      location.pathname === '/notice' ? 'text-[var(--primary-color)] bg-[var(--shade-1)]' : 'text-[var(--secondary-color)] hover:bg-[var(--primary-color)]'
                                  }`}>
                                NOTICE
                            </Link>
                            <Link to="/gallery"
                                  className={`block px-3 py-2 text-[14px] ${
                                      location.pathname === '/gallery' ? 'text-[var(--primary-color)] bg-[var(--shade-1)]' : 'text-[var(--secondary-color)] hover:bg-[var(--primary-color)]'
                                  }`}>
                                GALLERY
                            </Link>
                            <Link to="/blog"
                                  className={`block px-3 py-2 text-[14px] ${
                                      location.pathname === '/blog' ? 'text-[var(--primary-color)] bg-[var(--shade-1)]' : 'text-[var(--secondary-color)] hover:bg-[var(--primary-color)]'
                                  }`}>
                                BLOG
                            </Link>
                            <Link to="/privacy-policy"
                                  className={`block px-3 py-2 text-[14px] ${
                                      location.pathname === '/privacy-policy' ? 'text-[var(--primary-color)] bg-[var(--shade-1)]' : 'text-[var(--secondary-color)] hover:bg-[var(--primary-color)]'
                                  }`}>
                                PRIVACY POLICY
                            </Link>
                            <Link to="/terms-conditions"
                                  className={`block px-3 py-2 text-[14px] ${
                                      location.pathname === '/terms-conditions' ? 'text-[var(--primary-color)] bg-[var(--shade-1)]' : 'text-[var(--secondary-color)] hover:bg-[var(--primary-color)]'
                                  }`}>
                                TERMS & CONDITIONS
                            </Link>
                        </div>
                    </div>
                    <Link to="/about"
                          className={`block px-3 py-2 rounded-lg ${
                              location.pathname === '/about' ? 'text-[var(--primary-color)] hover:bg-[var(--shade-1)]' : 'text-[var(--text-1)] hover:bg-[var(--shade-1)]'
                          }`}>
                        ABOUT US
                    </Link>
                </div>
                <div className="px-4 py-2">
                    <div className="border-t border-t-[var(--ac-1)]"></div>
                    <div className="flex items-center gap-6 my-5">
                        <a href="#" className="hover:text-[var(--primary-color)] transition duration-400">
                            <i className="fa-brands fa-facebook-f text-text-1 text-xl hover:text-[var(--primary-color)] transition duration-400"></i>
                        </a>
                        <a href="#" className="hover:text-[var(--primary-color)] transition duration-400">
                            <i className="fa-brands fa-instagram text-text-1 text-xl hover:text-[var(--primary-color)] transition duration-400"></i>
                        </a>
                        <a href="#" className="hover:text-[var(--primary-color)] transition duration-400">
                            <i className="fa-brands fa-x-twitter text-text-1 text-xl hover:text-[var(--primary-color)] transition duration-400"></i>
                        </a>
                        <a href="#" className="hover:text-[var(--primary-color)] transition duration-400">
                            <i className="fa-brands fa-linkedin-in text-text-1 text-xl hover:text-[var(--primary-color)] transition duration-400"></i>
                        </a>
                    </div>
                    <div className="block lg:hidden">
                        <Link
                            to="/contact"
                            className={`contact_btn w-full cursor-pointer relative inline-flex items-center justify-center px-8 py-2.5 overflow-hidden tracking-tighter text-[var(--secondary-color)] bg-[var(--primary-color)] rounded-tl-lg rounded-tr-lg rounded-bl-0 rounded-br-lg group ${
                                location.pathname === '/contact' ? 'ring-2 ring-[var(--primary-color)]' : ''
                            }`}
                        >
                            <span
                                className="absolute bottom-0 left-0 right-0 h-0 transition-all duration-500 ease-out bg-[var(--text-1)] group-hover:h-full"></span>
                            <span className="relative text-base font-semibold">CONTACT US</span>
                        </Link>
                    </div>
                </div>
            </div>
            <div
                id="menu-overlay"
                className={`fixed top-0 left-0 w-full h-full bg-[#00000036] z-[51] ${isMobileMenuOpen ? 'block' : 'hidden'}`}
                onClick={toggleMobileMenu}
            ></div>
        </div>
    );
};

export default Navbar;