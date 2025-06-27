import React from "react";
import useDarkMode from "../hooks/useDarkMode.jsx";
import { useSidebar } from "../contexts/SidebarContext.jsx";
import NavbarProfileImage from "../assets/icon/navbar-profile.png";

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

                    {/* Dark Toggle Button */}
                    <DarkModeToggle />

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
                                src={NavbarProfileImage}
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