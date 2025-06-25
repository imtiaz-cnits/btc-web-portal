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
                            <ShimmerText line={1} gap={10} />
                        ) : (
                            <>
                                <Link to="/admin" className="nav-link">
                                    <span className="w-[24px]">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <g clipPath="url(#clip0_402_2908)">
                                                <path d="M10.0001 19V14H14.0001V19C14.0001 19.55 14.4501 20 15.0001 20H18.0001C18.5501 20 19.0001 19.55 19.0001 19V12H20.7001C21.1601 12 21.3801 11.43 21.0301 11.13L12.6701 3.59997C12.2901 3.25997 11.7101 3.25997 11.3301 3.59997L2.9701 11.13C2.6301 11.43 2.8401 12 3.3001 12H5.0001V19C5.0001 19.55 5.4501 20 6.0001 20H9.0001C9.5501 20 10.0001 19.55 10.0001 19Z" fill="var(--text-2)" />
                                            </g>
                                            <defs><clipPath id="clip0_402_2908"><rect width="24" height="24" fill="white" /></clipPath></defs>
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
                            <ShimmerText line={1} gap={10} />
                        ) : (
                            <Link to="/admin/notices" className="nav-link">
                                <span className="w-[24px]">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <g clipPath="url(#clip0_402_2890)">
                                            <path d="M4 13H10C10.55 13 11 12.55 11 12V4C11 3.45 10.55 3 10 3H4C3.45 3 3 3.45 3 4V12C3 12.55 3.45 13 4 13ZM4 21H10C10.55 21 11 20.55 11 20V16C11 15.45 10.55 15 10 15H4C3.45 15 3 15.45 3 16V20C3 20.55 3.45 21 4 21ZM14 21H20C20.55 21 21 20.55 21 20V12C21 11.45 20.55 11 20 11H14C13.45 11 13 11.45 13 12V20C13 20.55 13.45 21 14 21ZM13 4V8C13 8.55 13.45 9 14 9H20C20.55 9 21 8.55 21 8V4C21 3.45 20.55 3 20 3H14C13.45 3 13 3.45 13 4Z" fill="#A3AED0" />
                                        </g>
                                        <defs><clipPath id="clip0_402_2890"><rect width="24" height="24" fill="white" /></clipPath></defs>
                                    </svg>
                                </span>
                                <span className="nav-label dark:text-[var(--text-4)]">Notices</span>
                            </Link>
                        )}
                    </li>

                    {/*<li className="nav-item">*/}
                    {/*    {isLoading ? (*/}
                    {/*        <ShimmerText line={1} gap={10} />*/}
                    {/*    ) : (*/}
                    {/*        <Link to="/profile" className="nav-link">*/}
                    {/*            <span className="w-[24px]">*/}
                    {/*                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">*/}
                    {/*                    <g clipPath="url(#clip0_402_2884)">*/}
                    {/*                        <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V19C4 19.55 4.45 20 5 20H19C19.55 20 20 19.55 20 19V18C20 15.34 14.67 14 12 14Z" fill="#A3AED0" />*/}
                    {/*                    </g>*/}
                    {/*                    <defs><clipPath id="clip0_402_2884"><rect width="24" height="24" fill="white" /></clipPath></defs>*/}
                    {/*                </svg>*/}
                    {/*            </span>*/}
                    {/*            <span className="nav-label dark:text-[var(--text-4)]">Profile</span>*/}
                    {/*        </Link>*/}
                    {/*    )}*/}
                    {/*</li>*/}

                    <li className="nav-item">
                        {isLoading ? (
                            <ShimmerText line={1} gap={10} />
                        ) : (
                            <Link to="/auth" className="nav-link">
                                <span className="w-[24px]">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <g clipPath="url(#clip0_402_2876)">
                                            <path d="M18 8H17V6C17 3.24 14.76 1 12 1C9.24 1 7 3.24 7 6V8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8ZM12 17C10.9 17 10 16.1 10 15C10 13.9 10.9 13 12 13C13.1 13 14 13.9 14 15C14 16.1 13.1 17 12 17ZM9 8V6C9 4.34 10.34 3 12 3C13.66 3 15 4.34 15 6V8H9Z" fill="#A3AED0" />
                                        </g>
                                        <defs><clipPath id="clip0_402_2876"><rect width="24" height="24" fill="white" /></clipPath></defs>
                                    </svg>
                                </span>
                                <span className="nav-label dark:text-[var(--text-4)]">Sign In</span>
                            </Link>
                        )}
                    </li>

                    <li className="nav-item">
                        {isLoading ? (
                            <ShimmerText line={1} gap={10} />
                        ) : (
                            <Link to="/verify-email" className="nav-link">
                                <span className="w-[24px]">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <g clipPath="url(#clip0_402_2876)">
                                            <path d="M18 8H17V6C17 3.24 14.76 1 12 1C9.24 1 7 3.24 7 6V8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8ZM12 17C10.9 17 10 16.1 10 15C10 13.9 10.9 13 12 13C13.1 13 14 13.9 14 15C14 16.1 13.1 17 12 17ZM9 8V6C9 4.34 10.34 3 12 3C13.66 3 15 4.34 15 6V8H9Z" fill="#A3AED0" />
                                        </g>
                                        <defs><clipPath id="clip0_402_2876"><rect width="24" height="24" fill="white" /></clipPath></defs>
                                    </svg>
                                </span>
                                <span className="nav-label dark:text-[var(--text-4)]">Verify Email</span>
                            </Link>
                        )}
                    </li>

                    <li className="nav-item">
                        {isLoading ? (
                            <ShimmerText line={1} gap={10} />
                        ) : (
                            <Link to="/reset-password" className="nav-link">
                                <span className="w-[24px]">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <g clipPath="url(#clip0_402_2876)">
                                            <path d="M18 8H17V6C17 3.24 14.76 1 12 1C9.24 1 7 3.24 7 6V8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8ZM12 17C10.9 17 10 16.1 10 15C10 13.9 10.9 13 12 13C13.1 13 14 13.9 14 15C14 16.1 13.1 17 12 17ZM9 8V6C9 4.34 10.34 3 12 3C13.66 3 15 4.34 15 6V8H9Z" fill="#A3AED0" />
                                        </g>
                                        <defs><clipPath id="clip0_402_2876"><rect width="24" height="24" fill="white" /></clipPath></defs>
                                    </svg>
                                </span>
                                <span className="nav-label dark:text-[var(--text-4)]">Reset Password</span>
                            </Link>
                        )}
                    </li>
                </ul>

                <ul className="nav-list secondary-nav dark:!bg-[var(--dark-bg2)]">
                    <li className="nav-item">
                        {isLoading ? (
                            <ShimmerText line={1} gap={10} />
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