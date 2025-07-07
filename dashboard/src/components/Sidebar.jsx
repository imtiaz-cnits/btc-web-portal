import React, { useEffect, useState } from 'react';
import { toast } from "sonner";
import sidebarLogo from '../../public/icon/sidebar-logo.png';
import sidebarBrandNameLogo from '../../public/icon/sidebar-brandname-logo.png';
import darkSidebarLogo from '../../public/icon/dark-sidebar-logo.png';
import darkSidebarBrandNameLogo from '../../public/icon/dark-brand-name-logo.png';
import useDarkMode from "../hooks/useDarkMode.jsx";
import { Link, useNavigate } from 'react-router-dom';
import api from "../api/index.js";
import { ShimmerText, ShimmerThumbnail } from "react-shimmer-effects";

const Sidebar = ({ width, toggleSidebar }) => {
    const navigate = useNavigate();
    const [dark] = useDarkMode();
    const [isLoading, setIsLoading] = useState(true);

    // Simulate loading or check authentication status
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await api.post('/is-auth'); // Example endpoint to check auth
                if (!response.data.success) {
                    setIsLoading(false); // Stop loading if not authenticated
                    navigate('/auth');
                } else {
                    setIsLoading(false); // Stop loading if authenticated
                }
            } catch (error) {
                console.error('Auth check error:', error);
                setIsLoading(false);
                navigate('/auth');
            }
        };
        checkAuth();
    }, [navigate]);

    const handleLogout = async () => {
        try {
            // Call backend logout endpoint to clear HTTP-only cookie
            const response = await api.post('/logout');
            if (response.data.success) {
                // Remove any client-side token (optional, as your app uses cookies)
                localStorage.removeItem('token');
                // Show success toast
                toast.success('Logout successful');
                // Navigate to sign-in page
                navigate('/auth');
            }
        } catch (error) {
            // Handle errors (e.g., network issues)
            console.error('Logout error:', error);
            toast.error('Logout failed. Please try again.');
        }
    };

    return (
        <aside
            className="sidebar fixed top-0 left-0 h-screen bg-[var(--bg)] dark:!bg-[var(--dark-bg2)] transition-all duration-[0.4s] ease"
            style={{ width: `${width}px` }}
        >
            <header className="sidebar-header shadow-sm dark:!border-[var(--border-color2)]">
                {/* Light mode logos with shimmer */}
                <div className={`light-logo-box ${dark ? 'hidden' : 'block'}`}>
                    {isLoading ? (
                        <ShimmerThumbnail height={50} width={200} /> // Shimmer for logo area
                    ) : (
                        <Link to="/admin" className="header-logo">
                            <img className="sidebar-logo" src={sidebarLogo} alt="Logo" />
                            <img className="sidebar-brandname-logo" src={sidebarBrandNameLogo} alt="Brand Logo" />
                        </Link>
                    )}
                </div>

                {/* Dark mode logos with shimmer */}
                <div className={`dark-logo-box ${dark ? 'block' : 'hidden'}`}>
                    {isLoading ? (
                        <ShimmerThumbnail height={50} width={200} />
                    ) : (
                        <Link to="/" className="dark-header-logo">
                            <img className="sidebar-logo" src={darkSidebarLogo} alt="Logo" />
                            <img className="sidebar-brandname-logo" src={darkSidebarBrandNameLogo} alt="Brand Logo" />
                        </Link>
                    )}
                </div>

                <button className="sidebar-toggler text-[var(--text-2)] dark:text-[var(--text-4)]" onClick={toggleSidebar}>
                    <i className="fa-solid fa-chevron-left"></i>
                </button>
            </header>

            <nav className="sidebar-nav">
                <ul className="nav-list primary-nav">
                    <li className="nav-item">
                        {isLoading ? (
                            <ShimmerText line={1} gap={10}/>
                        ) : (
                            <>
                                <Link to="/admin" className="nav-link">
                                    <span className="w-[24px]">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                                             xmlns="http://www.w3.org/2000/svg">
                                            <g clipPath="url(#clip0_402_2908)">
                                                <path
                                                    d="M10.0001 19V14H14.0001V19C14.0001 19.55 14.4501 20 15.0001 20H18.0001C18.5501 20 19.0001 19.55 19.0001 19V12H20.7001C21.1601 12 21.3801 11.43 21.0301 11.13L12.6701 3.59997C12.2901 3.25997 11.7101 3.25997 11.3301 3.59997L2.9701 11.13C2.6301 11.43 2.8401 12 3.3001 12H5.0001V19C5.0001 19.55 5.4501 20 6.0001 20H9.0001C9.5501 20 10.0001 19.55 10.0001 19Z"
                                                    fill="var(--text-2)"/>
                                            </g>
                                            <defs><clipPath id="clip0_402_2908"><rect width="24" height="24"
                                                                                      fill="white"/></clipPath></defs>
                                        </svg>
                                    </span>
                                    <span className="nav-label dark:text-[var(--text-4)]">Dashboard</span>
                                </Link>
                                <ul className="dropdown-menu">
                                    <li className="nav-item">
                                        <Link to="/" className="nav-link dropdown-title">Dashboard</Link>
                                    </li>
                                </ul>
                            </>
                        )}
                    </li>

                    {/*<li className="nav-item dropdown-container">*/}
                    {/*    {isLoading ? (*/}
                    {/*        <ShimmerText line={1} gap={10} />*/}
                    {/*    ) : (*/}
                    {/*        <>*/}
                    {/*            <Link to="/tables" className="nav-link dropdown-toggle">*/}
                    {/*                <span className="w-[24px]">*/}
                    {/*                    <svg width="24" height="24" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">*/}
                    {/*                        <g clipPath="url(#clip0_402_2896)">*/}
                    {/*                            <path d="M7.46683 10.7333H7.70016C8.5985 10.7333 9.3335 11.4683 9.3335 12.3667V20.5333C9.3335 21.4317 8.5985 22.1667 7.70016 22.1667H7.46683C6.5685 22.1667 5.8335 21.4317 5.8335 20.5333V12.3667C5.8335 11.4683 6.5685 10.7333 7.46683 10.7333V10.7333ZM14.0002 5.83334C14.8985 5.83334 15.6335 6.56834 15.6335 7.46668V20.5333C15.6335 21.4317 14.8985 22.1667 14.0002 22.1667C13.1018 22.1667 12.3668 21.4317 12.3668 20.5333V7.46668C12.3668 6.56834 13.1018 5.83334 14.0002 5.83334ZM20.5335 15.1667C21.4318 15.1667 22.1668 15.9017 22.1668 16.8V20.5333C22.1668 21.4317 21.4318 22.1667 20.5335 22.1667C19.6352 22.1667 18.9002 21.4317 18.9002 20.5333V16.8C18.9002 15.9017 19.6352 15.1667 20.5335 15.1667V15.1667Z" fill="#A3AED0" />*/}
                    {/*                        </g>*/}
                    {/*                        <defs><clipPath id="clip0_402_2896"><rect width="28" height="28" fill="white" /></clipPath></defs>*/}
                    {/*                    </svg>*/}
                    {/*                </span>*/}
                    {/*                <span className="nav-label dark:text-[var(--text-4)]">Tables</span>*/}
                    {/*                <i className="dropdown-icon fa-solid fa-angle-down"></i>*/}
                    {/*            </Link>*/}
                    {/*            <ul className="dropdown-menu">*/}
                    {/*                <li className="nav-item">*/}
                    {/*                    <Link to="/tables/1" className="nav-link dropdown-link">*/}
                    {/*                        <i className="fa-solid fa-circle"></i> <span>Table-1</span>*/}
                    {/*                    </Link>*/}
                    {/*                </li>*/}
                    {/*                <li className="nav-item">*/}
                    {/*                    <Link to="/tables/2" className="nav-link dropdown-link">*/}
                    {/*                        <i className="fa-solid fa-circle"></i> <span>Table-2</span>*/}
                    {/*                    </Link>*/}
                    {/*                </li>*/}
                    {/*                <li className="nav-item">*/}
                    {/*                    <Link to="/tables/3" className="nav-link dropdown-link">*/}
                    {/*                        <i className="fa-solid fa-circle"></i> <span>Table-3</span>*/}
                    {/*                    </Link>*/}
                    {/*                </li>*/}
                    {/*            </ul>*/}
                    {/*        </>*/}
                    {/*    )}*/}
                    {/*</li>*/}

                    <li className="nav-item">
                        {isLoading ? (
                            <ShimmerText line={1} gap={10}/>
                        ) : (
                            <Link to="/admin/egp-notices" className="nav-link">
                                <span className="w-[24px]">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <path d="M21.4001 17.02L21.2601 17.5C20.8701 18.82 19.8601 19.84 18.6301 20.15L18.4001 20.21C16.3001 20.73 14.1401 21 11.9801 21C9.8201 21 7.6601 20.73 5.5601 20.21L5.4001 20.17C4.1101 19.84 3.0801 18.77 2.7301 17.36C1.8201 13.78 1.7701 10.04 2.5501 6.49L2.6601 6.03C3.0501 4.25 4.4901 3 6.1701 3H7.9601C9.2001 3 10.3301 3.68 11.0001 4.81L11.1901 5.14C11.3801 5.46 11.8001 6 12.4401 6H15.5401C15.2001 6.59 15.0001 7.27 15.0001 8C15.0001 10.21 16.7901 12 19.0001 12C20.1101 12 21.1201 11.54 21.8501 10.81C22.1501 12.88 22.0001 15 21.4001 17.02Z" fill="#A3AED0"/>
                                        <path d="M19 11C20.6569 11 22 9.65685 22 8C22 6.34315 20.6569 5 19 5C17.3431 5 16 6.34315 16 8C16 9.65685 17.3431 11 19 11Z" fill="#A3AED0"/>
                                      </svg>
                                </span>
                                <span className="nav-label dark:text-[var(--text-4)]">EGP Notices</span>
                            </Link>
                        )}
                    </li>

                    <li className="nav-item">
                        {isLoading ? (
                            <ShimmerText line={1} gap={10}/>
                        ) : (
                            <Link to="/admin/winner-list" className="nav-link">
                                <span className="w-[24px]">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <path d="M7.39782 14.6613H2.29976C2.13421 14.6613 2 14.8031 2 14.9778V21.3085C2 21.4832 2.13421 21.625 2.29976 21.625H7.39751C7.56337 21.625 7.69758 21.4832 7.69758 21.3085V14.9778C7.69758 14.8031 7.56337 14.6613 7.39782 14.6613ZM14.9778 11.8125H8.64718C8.47245 11.8125 8.33065 11.9543 8.33065 12.129V21.3085C8.33065 21.4832 8.47245 21.625 8.64718 21.625H14.9778C15.1525 21.625 15.2944 21.4832 15.2944 21.3085V12.129C15.2944 11.9543 15.1525 11.8125 14.9778 11.8125ZM21.3252 16.5605H16.2272C16.0616 16.5605 15.9274 16.7023 15.9274 16.877V21.3085C15.9274 21.4832 16.0616 21.625 16.2272 21.625H21.3249C21.4908 21.625 21.625 21.4832 21.625 21.3085V16.877C21.625 16.7023 21.4908 16.5605 21.3252 16.5605ZM15.9274 2.9496C15.9274 2.7755 15.785 2.63306 15.6109 2.63306H14.3448V2.31653C14.3448 2.14244 14.2023 2 14.0282 2H9.59677C9.42268 2 9.28024 2.14244 9.28024 2.31653V2.63306H8.01411C7.84002 2.63306 7.69758 2.7755 7.69758 2.9496V4.21573C7.69758 5.15583 8.38129 5.93766 9.28024 6.08643V6.11492C9.28024 6.99804 9.79935 7.76089 10.5464 8.1154V9.59677H9.91331C9.56512 9.59677 9.28024 9.88165 9.28024 10.2298V10.8629C9.28024 11.037 9.42268 11.1794 9.59677 11.1794H14.0282C14.2023 11.1794 14.3448 11.037 14.3448 10.8629V10.2298C14.3448 9.88165 14.0599 9.59677 13.7117 9.59677H13.0786V8.1154C13.8256 7.76089 14.3448 6.99804 14.3448 6.11492V6.08643C15.2437 5.93766 15.9274 5.15583 15.9274 4.21573V2.9496ZM9.28024 5.44071C8.73264 5.30143 8.33065 4.80448 8.33065 4.21573V3.26613H9.28024V5.44071ZM15.2944 4.21573C15.2944 4.80448 14.8924 5.30143 14.3448 5.44071V3.26613H15.2944V4.21573Z" fill="#A3AED0"/>
                                      </svg>
                                </span>
                                <span className="nav-label dark:text-[var(--text-4)]">Winner List</span>
                            </Link>
                        )}
                    </li>

                </ul>

                <ul className="nav-list secondary-nav dark:!bg-[var(--dark-bg2)]">
                    <li className="nav-item">
                        {isLoading ? (
                            <ShimmerText line={1} gap={10}/>
                        ) : (
                            <button
                                onClick={handleLogout}
                                className="nav-link w-full text-left flex items-center cursor-pointer"
                            >
                                <span className="w-[24px]">
                                    <i className="fa-solid fa-right-from-bracket text-[var(--text-2)]"></i>
                                </span>
                                <span className="nav-label dark:text-[var(--text-4)]">Sign Out</span>
                            </button>
                        )}
                    </li>
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;