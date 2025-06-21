import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    const notices = [
        { id: 1, date: '24 Dec', title: 'Call for tenders on public procurement', link: '/notice/1' },
        { id: 2, date: '26 Dec', title: 'South Asia regional conference on public procurement in Dhaka Nov 1-3', link: '/notice/2' },
        { id: 3, date: '22 Dec', title: 'South Asia regional conference on public procurement in Dhaka Nov 1-3', link: '/notice/3' },
        { id: 4, date: '23 Dec', title: 'South Asia regional conference on public procurement in Dhaka Nov 1-3', link: '/notice/4' },
        { id: 5, date: '27 Dec', title: 'South Asia regional conference on public procurement in Dhaka Nov 1-3', link: '/notice/5' },
    ];

    return (
        <>
            <div className="hero bg-[var(--secondary-color)] overflow-hidden pt-[60px]">
                <div className="custom-container mx-auto">
                    <div className="flex flex-wrap">
                        <div className="w-full lg:w-1/2">
                            <div className="theame">
                                <div className="flex justify-center lg:justify-start items-center gap-[10px] mb-[20px]">
                                    <h1
                                        className="text-[16px] font-[var(--primary-font)] text-[var(text-1)] bg-[var(--shade-1)] px-[20px] py-[5px] rounded-[30px]">
                                        CONSTRUCTION
                                    </h1>
                                    <h1
                                        className="text-[16px] font-[var(--primary-font)] text-[var(text-1)] bg-[var(--shade-1)] px-[20px] py-[5px] rounded-[30px]">
                                        TENDERING
                                    </h1>
                                </div>
                                <h1
                                    className="text-[38px] lg:text-[52px] text-center lg:text-left font-bold text-[var(text-1)] mb-[20px] uppercase">
                                    Innovative, Reliable, Expert
                                    <span className="text-[var(--primary-color)]">Builders</span>,
                                    Endless Possibilities
                                    <span className="text-[var(--primary-color)]">!!!</span>
                                </h1>
                                <div className="lg:w-[92%] w-[100%] overflow-hidden rounded-[24px_0px_24px_24px]">
                                    <img src="./public/img/home/hero-img1.png" alt="" className="w-full object-cover"/>
                                </div>
                            </div>
                        </div>
                        <div className="w-full lg:w-1/2 overflow-hidden mt-[40px] lg:mt-[0px]">
                            <div
                                className="notice_board w-full bg-[var(--secondary-color)] border border-[var(--ac-1)] rounded-3xl overflow-hidden p-0">
                                <h3 className="header bg-[var(--primary-color)] text-[var(--secondary-color)] font-[var(--primary-font)] text-center py-2.5 px-4 text-[28px] font-medium mb-0">
                                    NOTICE BOARD
                                </h3>
                                <div className="notice_item min-h-[450px] overflow-y-auto">
                                    <ul className="notices overflow-hidden relative">
                                        {notices.map((notice) => (
                                            <li key={notice.id}
                                                className="notice flex items-center border-b border-[var(--ac-1)] py-3 mx-5">
                                                <Link to={notice.link} className="link flex items-center"
                                                      aria-label={`View notice ${notice.title}`}>
                                                    <div className="date relative w-[52px] h-[52px]">
                                                        <div
                                                            className="day absolute top-[-12px] left-[19px] text-[var(--secondary-color)] font-[var(--primary-font)] font-medium text-[26px] z-[2]">
                                                            {notice.date.split(' ')[0]}
                                                        </div>
                                                        <div
                                                            className="month absolute top-[18px] left-[22px] font-medium font-[var(--secondary-font)] text-[var(--secondary-color)] text-base z-[2]">
                                                            {notice.date.split(' ')[1]}
                                                        </div>
                                                    </div>
                                                    <div className="content leading-[18px]">
                                                        <Link
                                                            to={notice.link}
                                                            className="link text-[var(--text-2, #666)] text-base font-[var(--secondary-font)] font-medium transition duration-300 hover:text-[var(--primary-color)]"
                                                            aria-label={`Read more about ${notice.title}`}
                                                        >
                                                            {notice.title}
                                                        </Link>
                                                    </div>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="button text-center">
                                    <Link
                                        to="/notices"
                                        className="view_note_btn cursor-pointer relative inline-flex items-center justify-center px-8 my-5 py-2.5 overflow-hidden tracking-tighter text-[var(--secondary-color)] bg-[var(--primary-color)] rounded-tl-0 rounded-tr-lg rounded-bl-lg rounded-br-lg group"
                                        aria-label="View all notices"
                                    >
                                        <span
                                            className="absolute bottom-0 left-0 right-0 h-0 transition-all duration-500 ease-out bg-[var(--text-1)] group-hover:h-full"></span>
                                        <span className="relative text-base font-semibold">VIEW ALL NOTICE</span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>
                {`
                  @keyframes dash {
                    to {
                      background-position: 100% 0%, 0% 100%, 0% 0%, 100% 100%;
                    }
                  }

                  .hero .notice .date {
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
                    animation: dash 5s linear infinite;
                    cursor: default;
                    z-index: 1;
                  }

                  .hero .notice .date::before {
                    content: "";
                    position: absolute;
                    top: -10px;
                    width: 50px;
                    height: 50px;
                    border-radius: 12px 12px 12px 0px;
                    background-color: var(--primary-color, #c26c2a) !important;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    font-size: 16px;
                    z-index: -1;
                    font-weight: bold;
                  }
                `}
            </style>
        </>
    );
};

export default Home;