import React from 'react';

const Footer = ({ sidebarWidth }) => {
    return (
        <div className="fixed bottom-0 right-0 bg-[var(--bg)] dark:bg-[var(--dark-bg2)] px-[10px] lg:px-[20px] py-3 z-100"
             style={{ left: `${sidebarWidth}px`, transition: 'left 0.4s ease', boxShadow: '0 -2px 2px rgba(0, 0, 0, 0.05)' }}>
            <div className="block text-center sm:flex items-center justify-between text-[var(--text-1)] dark:text-[var(--text-4)]">
                <p className="brand">
                    © 2022 Horizon UI. All Rights Reserved.
                </p>
                <div className="menu sm:flex items-center gap-3">
                    <a href="#">Developed By CodeNext IT</a>
                </div>
            </div>
        </div>
    );
};

export default Footer;