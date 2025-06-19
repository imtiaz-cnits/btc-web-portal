import React from "react";
import useDarkMode from "../hooks/useDarkMode.jsx";
import { useSidebar } from "../contexts/SidebarContext.jsx";

const DarkModeToggle = () => {
    const [dark, setDark] = useDarkMode();

    return (
        <div className="dark_button_box flex justify-center m-0">
            <button
                type="button"
                aria-label="Toggle dark mode"
                onClick={() => setDark(!dark)}
                className="text-[var(--text-2)] hover:text-[var(--text-1)] focus:outline-none hover:bg-[var(--secondary-color)] rounded-full text-sm p-2.5 cursor-pointer transition-colors duration-300" // Added transition
            >
                {dark ? (
                    // Sun icon for light mode
                    <svg className="w-5 h-5" fill="#A3AED0" viewBox="0 0 20 20">
                        <path
                            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                            fillRule="evenodd"
                            clipRule="evenodd"
                        ></path>
                    </svg>
                ) : (
                    // Moon icon for dark mode
                    <svg className="w-5 h-5" fill="#A3AED0" viewBox="0 0 20 20">
                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
                    </svg>
                )}
            </button>
        </div>
    );
};

const Navbar = () => {
    const { toggleSidebar } = useSidebar(); // Add useSidebar to handle mobile toggle

    return (
        <nav
            className="sticky top-0 bg-[var(--secondary-color)] dark:!bg-[var(--dark-bg)] py-[10px] lg:px-[20px] px-[10px] shadow-sm transition-all duration-300"
            style={{ zIndex: 99 }}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center lg:gap-4 gap-2">
                    <button
                        className="sidebar-menu-button lg:hidden"
                        onClick={toggleSidebar}
                    >
                        <i className="fa-solid fa-bars"></i>
                    </button>
                    <div className="bredcrumb lg:block hidden">
                        <div className="flex flex-col gap-[4px]">
                            <div className="flex items-center space-x-2 text-[var(--ac2)]">
                                <span className="page text-base dark:text-[var(--text-4)]">Pages /</span>
                                <span className="page text-base dark:text-[var(--text-4)] font-medium">Dashboard</span>
                            </div>
                            <div className="bredcrumb-title lg:text-2xl text-[18px] font-bold text-[var(--text-1)]">
                                <h1>Main Dashboard</h1>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="nav-icon-menu flex bg-[var(--bg)] dark:bg-[var(--dark-bg2)] items-center px-[8px] py-[6px] space-x-4 rounded-[30px] gap-2">
                    {/* Search Box */}
                    <div className="search-box relative group m-0">
                        <input
                            type="text"
                            placeholder="Search"
                            className="pl-10 pr-4 py-2 rounded-full bg-[var(--secondary-color)] dark:bg-[var(--dark-bg)] outline-hidden text-sm w-64 dark:text-[var(--text-4)] lg:block hidden"
                        />
                        <svg
                            className="w-5 h-5 lg:block hidden text-[var(--text-1)] absolute left-3 top-1/2 transform -translate-y-1/2"
                            fill="none"
                            stroke="#A3AED0"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            ></path>
                        </svg>
                        <button
                            className="lg:hidden block text-[var(--accent)] dark:text-[var(--text-2)] hover:text-[var(--text-1)] focus:outline-none p-2 rounded-full hover:bg-[var(--secondary-color)] search-toggle-button"
                        >
                            <svg
                                className="w-5 h-5 lg:hidden block text-[var(--text-primary)]"
                                fill="none"
                                stroke="#A3AED0"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                ></path>
                            </svg>
                        </button>
                        <div
                            className="dropdown-box w-64 absolute -left-[8px] mt-2 max-w-sm bg-[var(--bg)] rounded-md border border-[var(--border-color2)] py-1 z-[100] hidden group-hover:block"
                        >
                            <input
                                type="text"
                                placeholder="Search"
                                className="block w-full px-4 py-2 bg-[var(--secondary-color)] dark:bg-[var(--dark-bg)] outline-none text-sm dark:text-[var(--text-4)]"
                            />
                        </div>
                    </div>

                    {/* Notification Box */}
                    <div className="notification-box relative group dropdown-parent m-0">
                        <div
                            className="absolute inset-x-0 -top-2 bottom-0 z-20 pointer-events-none group-hover:pointer-events-auto"
                            style={{ height: "calc(100% + 1rem)" }}
                        ></div>
                        <button
                            className="text-[var(--text-2)] hover:text-[var(--text-1)] focus:outline-none p-2 rounded-full hover:bg-[var(--secondary-color)] relative z-30 dropdown-toggle cursor-pointer"
                        >
                            <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <g clipPath="url(#clip0_402_2860)">
                                    <path
                                        d="M19.2901 17.29L18.0001 16V11C18.0001 7.93 16.3601 5.36 13.5001 4.68V4C13.5001 3.17 12.8301 2.5 12.0001 2.5C11.1701 2.5 10.5001 3.17 10.5001 4V4.68C7.63005 5.36 6.00005 7.92 6.00005 11V16L4.71005 17.29C4.08005 17.92 4.52005 19 5.41005 19H18.5801C19.4801 19 19.9201 17.92 19.2901 17.29ZM16.0001 17H8.00005V11C8.00005 8.52 9.51005 6.5 12.0001 6.5C14.4901 6.5 16.0001 8.52 16.0001 11V17ZM12.0001 22C13.1001 22 14.0001 21.1 14.0001 20H10.0001C10.0001 21.1 10.8901 22 12.0001 22Z"
                                        fill="#A3AED0"
                                    />
                                </g>
                                <defs>
                                    <clipPath id="clip0_402_2860">
                                        <rect width="24" height="24" fill="white" />
                                    </clipPath>
                                </defs>
                            </svg>

                            <span
                                className="noti-num w-[16px] h-[16px] absolute flex top-1 right-1 items-center justify-center p-[8px] text-[10px] font-bold leading-none text-[var(--text-4)] bg-red-600 rounded-full"
                            >3</span>
                        </button>
                        <div
                            className="dropdown-box absolute right-0 mt-2 w-[280px] bg-[var(--bg)] dark:bg-[var(--dark-bg2)] rounded-md border border-[var(--border-color2)] dark:border-hidden py-1 z-[100] hidden group-hover:block"
                        >
                            <div className="title-box px-4 py-3 border-b border-[var(--border-color2)]">
                                <p className="text-sm font-semibold text-[var(--text-1)]">
                                    Notifications
                                </p>
                                <p className="text-xs text-[var(--text-2)]">
                                    You have 3 unread messages
                                </p>
                            </div>
                            <a
                                href="#"
                                className="item flex items-start px-4 py-3 hover:bg-[var(--secondary)] dark:text-[var(--text-secondary)] dark:hover:bg-[var(--adm-hover-dark)] border-b border-[var(--border-color2)]"
                            >
                                <img
                                    className="h-8 w-8 rounded-full object-cover mr-3"
                                    src="/icon/navbar-profile.png"
                                    alt="User Avatar"
                                />
                                <div>
                                    <p className="text-sm font-medium text-[var(--text-primary)]">
                                        John Doe sent you a message
                                    </p>
                                    <p className="text-xs text-[var(--text-secondary)] mt-1">
                                        "Hey, check out this new feature!"
                                    </p>
                                    <span className="text-xs text-[var(--primary)] mt-1 block"
                                    >5 minutes ago</span>
                                </div>
                            </a>
                            <a
                                href="#"
                                className="item flex items-start px-4 py-3 hover:bg-[var(--secondary)] dark:text-[var(--text-secondary)] dark:hover:bg-[var(--adm-hover-dark)] border-b border-[var(--border-color2)]"
                            >
                                <img
                                    className="h-8 w-8 rounded-full object-cover mr-3"
                                    src="/icon/navbar-profile.png"
                                    alt="System Icon"
                                />
                                <div>
                                    <p className="text-sm font-medium text-[var(--text-primary)]">
                                        System Update Available
                                    </p>
                                    <p className="text-xs text-[var(--text-secondary)] mt-1">
                                        A new version of the dashboard is ready.
                                    </p>
                                    <span className="text-xs text-green-500 mt-1 block"
                                    >1 hour ago</span>
                                </div>
                            </a>
                            <a
                                href="#"
                                className="item flex items-start px-4 py-3 hover:bg-[var(--secondary)] dark:text-[var(--text-secondary)] dark:hover:bg-[var(--adm-hover-dark)]"
                            >
                                <img
                                    className="h-8 w-8 rounded-full object-cover mr-3"
                                    src="/icon/navbar-profile.png"
                                    alt="Order Icon"
                                />
                                <div>
                                    <p className="text-sm font-medium text-[var(--text-primary)]">
                                        Your order #12345 has shipped!
                                    </p>
                                    <p className="text-xs text-[var(--text-secondary)] mt-1">
                                        Track your delivery here.
                                    </p>
                                    <span className="text-xs text-yellow-500 mt-1 block"
                                    >Yesterday</span>
                                </div>
                            </a>
                            <div className="px-4 py-2 border-t border-[var(--border-color2)] text-center">
                                <a
                                    href="#"
                                    className="view-all-btn text-sm text-[var(--primary)] hover:underline"
                                >View all notifications</a>
                            </div>
                        </div>
                    </div>

                    {/* Dark Toggle Button */}
                    <DarkModeToggle />

                    {/* Information Box */}
                    <div className="information-box relative lg:block hidden group dropdown-parent m-0">
                        <div
                            className="absolute inset-x-0 -top-2 bottom-0 z-20 pointer-events-none group-hover:pointer-events-auto"
                            style={{ height: "calc(100% + 1rem)" }}
                        ></div>
                        <button
                            className="text-[var(--text-2)] hover:text-[var(--text-1)] focus:outline-none p-2 rounded-full hover:bg-[var(--secondary-color)] relative z-30 dropdown-toggle cursor-pointer"
                        >
                            <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <g clipPath="url(#clip0_402_2853)">
                                    <path
                                        d="M11 7H13V9H11V7ZM12 17C12.55 17 13 16.55 13 16V12C13 11.45 12.55 11 12 11C11.45 11 11 11.45 11 12V16C11 16.55 11.45 17 12 17ZM12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z"
                                        fill="#A3AED0"
                                    />
                                </g>
                                <defs>
                                    <clipPath id="clip0_402_2853">
                                        <rect width="24" height="24" fill="white" />
                                    </clipPath>
                                </defs>
                            </svg>
                        </button>
                        <div
                            className="dropdown-box absolute right-0 mt-2 w-[200px] bg-[var(--bg)] dark:bg-[var(--dark-bg2)] rounded-md border border-[var(--border-color2)] dark:border-hidden py-1 z-[100] hidden group-hover:block"
                        >
                            <div className="px-4 py-3 border-b border-[var(--border-color2)]">
                                <p className="text-sm font-semibold text-[var(--text-primary)]">
                                    Need Help?
                                </p>
                                <p className="text-xs text-[var(--text-secondary)]">
                                    Find answers and support
                                </p>
                            </div>
                            <a
                                href="#"
                                className="block px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--secondary)] dark:text-[var(--text-secondary)] dark:hover:bg-[var(--adm-hover-dark)]"
                            >
                                <div className="flex items-center">
                                    <svg
                                        className="w-4 h-4 mr-2 text-[var(--text-primary)]"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                        ></path>
                                    </svg>
                                    Documentation
                                </div>
                            </a>
                            <a
                                href="#"
                                className="block px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--secondary)] dark:text-[var(--text-secondary)] dark:hover:bg-[var(--adm-hover-dark)]"
                            >
                                <div className="flex items-center">
                                    <svg
                                        className="w-4 h-4 mr-2 text-[var(--text-primary)]"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M8.228 9.228a4.5 4.5 0 116.364 0L14 10.364l1.364-1.364a4.5 4.5 0 116.364 6.364L18.636 18H21v-3h-1.364l1.364-1.364a4.5 4.5 0 11-6.364-6.364L10 8.364l-1.364 1.364a4.5 4.5 0 11-6.364-6.364l1.364 1.364z"
                                        ></path>
                                    </svg>
                                    FAQ
                                </div>
                            </a>
                            <a
                                href="#"
                                className="block px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--secondary)] dark:text-[var(--text-secondary)] dark:hover:bg-[var(--adm-hover-dark)]"
                            >
                                <div className="flex items-center">
                                    <svg
                                        className="w-4 h-4 mr-2 text-[var(--text-primary)]"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M3 8l7.94 5.29a2 2 0 002.12 0L21 8m-2 2v7a2 2 0 01-2 2H7a2 2 0 01-2-2v-7"
                                        ></path>
                                    </svg>
                                    Contact Support
                                </div>
                            </a>
                        </div>
                    </div>

                    {/* Profile */}
                    <div className="profile-box relative group dropdown-parent m-0">
                        <div
                            className="absolute inset-x-0 -top-2 bottom-0 z-20 pointer-events-none group-hover:pointer-events-auto"
                            style={{ height: "calc(100% + 1rem)" }}
                        ></div>
                        <button
                            className="w-[40px] h-[40px] rounded-full flex items-center overflow-hidden focus:outline-none relative z-30 dropdown-toggle cursor-pointer"
                        >
                            <img
                                src="/icon/navbar-profile.png"
                                alt="User Avatar"
                                className="w-full h-full object-cover"
                            />
                        </button>
                        <div
                            className="dropdown-box absolute right-0 mt-2 w-[200px] bg-[var(--bg)] dark:bg-[var(--dark-bg2)] rounded-md border border-[var(--border-color2)] dark:border-hidden py-1 z-[100] hidden group-hover:block"
                        >
                            <div className="px-4 py-3 border-b border-[var(--border-color2)]">
                                <p className="text-sm font-semibold text-[var(--text-1)]">
                                    John Doe
                                </p>
                                <p className="text-xs text-[var(--text-2)] truncate">
                                    john.doe@example.com
                                </p>
                            </div>
                            <a
                                href="#"
                                className="block px-4 py-2 text-sm text-[var(--text-1)] hover:bg-[var(--secondary-color)] dark:text-[var(--text-2)] dark:hover:bg-[var(--dark-hover)]"
                            >My Profile</a>
                            <a
                                href="#"
                                className="block px-4 py-2 text-sm text-[var(--text-1)] hover:bg-[var(--secondary-color)] dark:text-[var(--text-2)] dark:hover:bg-[var(--dark-hover)]"
                            >Settings</a>
                            <a
                                href="#"
                                className="block px-4 py-2 text-sm text-red-600 hover:bg-[var(--secondary-color)] dark:text-[var(--text-2)] dark:hover:bg-[var(--dark-hover)]"
                            >Logout</a>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;