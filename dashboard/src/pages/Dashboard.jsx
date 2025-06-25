import React from 'react';

const Dashboard = () => {
    return (
        <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {/*Card 1*/}
                <div
                    className="db-card flex flex-col md:flex-row text-center md:text-left items-center gap-3 bg-[var(--bg)] dark:bg-[var(--dark-bg2)] rounded-[16px] shadow-md overflow-hidden hover:shadow-lg transition-shadow p-[10px]"
                >
                    <div
                        className="icon-box w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-[var(--secondary-color)] dark:bg-[var(--dark-bg3)] flex items-center justify-center"
                    >
                        <svg
                            width="34"
                            height="34"
                            viewBox="0 0 34 34"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <g clipPath="url(#clip0_201_2503)">
                                <path
                                    d="M9.28393 13.3136H9.55761C10.6113 13.3136 11.4734 14.1757 11.4734 15.2293V24.8082C11.4734 25.8618 10.6113 26.7239 9.55761 26.7239H9.28393C8.23026 26.7239 7.36816 25.8618 7.36816 24.8082V15.2293C7.36816 14.1757 8.23026 13.3136 9.28393 13.3136ZM16.947 7.56628C18.0007 7.56628 18.8627 8.42838 18.8627 9.48205V24.8082C18.8627 25.8618 18.0007 26.7239 16.947 26.7239C15.8933 26.7239 15.0312 25.8618 15.0312 24.8082V9.48205C15.0312 8.42838 15.8933 7.56628 16.947 7.56628ZM24.61 18.5135C25.6637 18.5135 26.5258 19.3756 26.5258 20.4293V24.8082C26.5258 25.8618 25.6637 26.7239 24.61 26.7239C23.5564 26.7239 22.6943 25.8618 22.6943 24.8082V20.4293C22.6943 19.3756 23.5564 18.5135 24.61 18.5135Z"
                                    fill="#4318FF"
                                />
                            </g>
                            <defs>
                                <clipPath id="clip0_201_2503">
                                    <rect
                                        width="32.8417"
                                        height="32.8417"
                                        fill="white"
                                        transform="translate(0.526367 0.724243)"
                                    />
                                </clipPath>
                            </defs>
                        </svg>
                    </div>
                    <div className="details">
                        <span className="txt text-[var(--text-2)]">Earnings</span>
                        <h3
                            className="price lg:text-[26px] text-[20px] font-bold text-[var(--text-1)] dark:text-[var(--text-4)]"
                        >
                            $350.4
                        </h3>
                    </div>
                </div>

                {/*Card 2*/}
                <div
                    className="db-card flex flex-col md:flex-row text-center md:text-left items-center gap-3 bg-[var(--bg)] dark:bg-[var(--dark-bg2)] rounded-[16px] shadow-md overflow-hidden hover:shadow-lg transition-shadow p-[10px]"
                >
                    <div
                        className="icon-box w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-[var(--secondary-color)] dark:bg-[var(--dark-bg3)] flex items-center justify-center"
                    >
                        <svg
                            width="34"
                            height="34"
                            viewBox="0 0 34 34"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <g clipPath="url(#clip0_201_2515)">
                                <path
                                    d="M16.6734 15.6398C13.5672 14.8325 12.5682 13.9978 12.5682 12.6978C12.5682 11.2062 13.9503 10.1662 16.2629 10.1662C18.206 10.1662 19.1776 10.9052 19.5334 12.082C19.6976 12.6294 20.1492 13.0399 20.7239 13.0399H21.1344C22.0376 13.0399 22.6807 12.1504 22.366 11.302C21.7913 9.6873 20.4502 8.34626 18.3155 7.82627V6.88207C18.3155 5.7463 17.3987 4.82947 16.2629 4.82947C15.1271 4.82947 14.2103 5.7463 14.2103 6.88207V7.78522C11.5556 8.35995 9.4209 10.0841 9.4209 12.7252C9.4209 15.8862 12.0345 17.4598 15.8524 18.3767C19.2734 19.1977 19.9576 20.4019 19.9576 21.6745C19.9576 22.6187 19.2871 24.1239 16.2629 24.1239C14.005 24.1239 12.8419 23.3166 12.3903 22.1671C12.1851 21.6335 11.7198 21.2503 11.1588 21.2503H10.7756C9.85879 21.2503 9.21564 22.1808 9.55774 23.0292C10.3377 24.9313 12.1577 26.0534 14.2103 26.4913V27.4081C14.2103 28.5439 15.1271 29.4607 16.2629 29.4607C17.3987 29.4607 18.3155 28.5439 18.3155 27.4081V26.5187C20.9839 26.0123 23.1049 24.466 23.1049 21.6608C23.1049 17.7746 19.7797 16.4472 16.6734 15.6398Z"
                                    fill="#4318FF"
                                />
                            </g>
                            <defs>
                                <clipPath id="clip0_201_2515">
                                    <rect
                                        width="32.8417"
                                        height="32.8417"
                                        fill="white"
                                        transform="translate(0.526367 0.724243)"
                                    />
                                </clipPath>
                            </defs>
                        </svg>
                    </div>
                    <div className="details">
                        <span className="txt text-[var(--text-2)]">Spend this month</span>
                        <h3
                            className="price lg:text-[26px] text-[20px] font-bold text-[var(--text-1)] dark:text-[var(--text-4)]"
                        >
                            $642.39
                        </h3>
                        <p
                            className="rech text-[14px] text-[var(--text-2)] dark:text-[var(--text-2)]"
                        >
                            <strong className="pr-1 text-green-500">+23%</strong>since last
                            month
                        </p>
                    </div>
                </div>

                {/*Card 3*/}
                <div
                    className="db-card flex flex-col md:flex-row text-center md:text-left items-center gap-3 bg-[var(--bg)] dark:bg-[var(--dark-bg2)] rounded-[16px] shadow-md overflow-hidden hover:shadow-lg transition-shadow p-[10px]"
                >
                    <div
                        className="icon-box w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-[var(--secondary-color)] dark:bg-[var(--dark-bg3)] flex items-center justify-center"
                    >
                        <svg
                            width="34"
                            height="34"
                            viewBox="0 0 34 34"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <g clipPath="url(#clip0_201_2515)">
                                <path
                                    d="M16.6734 15.6398C13.5672 14.8325 12.5682 13.9978 12.5682 12.6978C12.5682 11.2062 13.9503 10.1662 16.2629 10.1662C18.206 10.1662 19.1776 10.9052 19.5334 12.082C19.6976 12.6294 20.1492 13.0399 20.7239 13.0399H21.1344C22.0376 13.0399 22.6807 12.1504 22.366 11.302C21.7913 9.6873 20.4502 8.34626 18.3155 7.82627V6.88207C18.3155 5.7463 17.3987 4.82947 16.2629 4.82947C15.1271 4.82947 14.2103 5.7463 14.2103 6.88207V7.78522C11.5556 8.35995 9.4209 10.0841 9.4209 12.7252C9.4209 15.8862 12.0345 17.4598 15.8524 18.3767C19.2734 19.1977 19.9576 20.4019 19.9576 21.6745C19.9576 22.6187 19.2871 24.1239 16.2629 24.1239C14.005 24.1239 12.8419 23.3166 12.3903 22.1671C12.1851 21.6335 11.7198 21.2503 11.1588 21.2503H10.7756C9.85879 21.2503 9.21564 22.1808 9.55774 23.0292C10.3377 24.9313 12.1577 26.0534 14.2103 26.4913V27.4081C14.2103 28.5439 15.1271 29.4607 16.2629 29.4607C17.3987 29.4607 18.3155 28.5439 18.3155 27.4081V26.5187C20.9839 26.0123 23.1049 24.466 23.1049 21.6608C23.1049 17.7746 19.7797 16.4472 16.6734 15.6398Z"
                                    fill="#4318FF"
                                />
                            </g>
                            <defs>
                                <clipPath id="clip0_201_2515">
                                    <rect
                                        width="32.8417"
                                        height="32.8417"
                                        fill="white"
                                        transform="translate(0.526367 0.724243)"
                                    />
                                </clipPath>
                            </defs>
                        </svg>
                    </div>
                    <div className="details">
                        <span className="txt text-[var(--text-2)]">Your balance</span>
                        <h3
                            className="price lg:text-[26px] text-[20px] font-bold text-[var(--text-1)] dark:text-[var(--text-4)]"
                        >
                            $1,000
                        </h3>
                    </div>
                </div>

                {/*Card 4*/}
                <div
                    className="db-card flex flex-col md:flex-row text-center md:text-left items-center gap-3 bg-[var(--bg)] dark:bg-[var(--dark-bg2)] rounded-[16px] shadow-md overflow-hidden hover:shadow-lg transition-shadow p-[10px]"
                >
                    <div
                        className="icon-box w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-[var(--secondary-color)] dark:bg-[var(--dark-bg3)] flex items-center justify-center"
                    >
                        <svg
                            width="26"
                            height="26"
                            viewBox="0 0 26 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M23.6663 4.04337L10.3547 17.3667L5.40801 12.42L7.05301 10.775L10.3547 14.0767L22.0213 2.41004L23.6663 4.04337ZM11.9997 21.3334C6.85467 21.3334 2.66634 17.145 2.66634 12C2.66634 6.85504 6.85467 2.66671 11.9997 2.66671C13.8313 2.66671 15.5463 3.20337 16.993 4.12504L18.6847 2.43337C16.783 1.11504 14.4847 0.333374 11.9997 0.333374C5.55967 0.333374 0.333008 5.56004 0.333008 12C0.333008 18.44 5.55967 23.6667 11.9997 23.6667C14.018 23.6667 15.9197 23.1534 17.5763 22.2434L15.8263 20.4934C14.6597 21.03 13.3647 21.3334 11.9997 21.3334ZM20.1663 15.5H16.6663V17.8334H20.1663V21.3334H22.4997V17.8334H25.9997V15.5H22.4997V12H20.1663V15.5Z"
                                fill="#4318FF"
                            />
                        </svg>
                    </div>
                    <div className="details">
                        <span className="txt text-[var(--text-2)]">New Task</span>
                        <h3
                            className="price lg:text-[26px] text-[20px] font-bold text-[var(--text-1)] dark:text-[var(--text-4)]"
                        >
                            154
                        </h3>
                    </div>
                </div>

                {/*Card 5*/}
                <div
                    className="db-card flex flex-col md:flex-row text-center md:text-left items-center gap-3 bg-[var(--bg)] dark:bg-[var(--dark-bg2)] rounded-[16px] shadow-md overflow-hidden hover:shadow-lg transition-shadow p-[10px]"
                >
                    <div
                        className="icon-box w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-[var(--secondary-color)] dark:bg-[var(--dark-bg3)] flex items-center justify-center"
                    >
                        <svg
                            width="26"
                            height="26"
                            viewBox="0 0 26 26"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <g clipPath="url(#clip0_201_2533)">
                                <path
                                    d="M16.2503 1.08331H4.33366C3.14199 1.08331 2.16699 2.05831 2.16699 3.24998V17.3333C2.16699 17.9291 2.65449 18.4166 3.25033 18.4166C3.84616 18.4166 4.33366 17.9291 4.33366 17.3333V4.33331C4.33366 3.73748 4.82116 3.24998 5.41699 3.24998H16.2503C16.8462 3.24998 17.3337 2.76248 17.3337 2.16665C17.3337 1.57081 16.8462 1.08331 16.2503 1.08331ZM16.8895 6.05581L22.122 11.2883C22.5228 11.6891 22.7503 12.2416 22.7503 12.8158V22.75C22.7503 23.9417 21.7753 24.9166 20.5837 24.9166H8.65616C7.46449 24.9166 6.50033 23.9417 6.50033 22.75L6.51116 7.58331C6.51116 6.39165 7.47533 5.41665 8.66699 5.41665H15.3512C15.9253 5.41665 16.4778 5.64415 16.8895 6.05581ZM16.2503 13H21.1253L15.167 7.04165V11.9166C15.167 12.5125 15.6545 13 16.2503 13Z"
                                    fill="#4318FF"
                                />
                            </g>
                            <defs>
                                <clipPath id="clip0_201_2533">
                                    <rect width="26" height="26" fill="white"/>
                                </clipPath>
                            </defs>
                        </svg>
                    </div>
                    <div className="details">
                        <span className="txt text-[var(--text-2)]">Total Projects</span>
                        <h3
                            className="price lg:text-[26px] text-[20px] font-bold text-[var(--text-1)] dark:text-[var(--text-4)]"
                        >
                            2935
                        </h3>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;