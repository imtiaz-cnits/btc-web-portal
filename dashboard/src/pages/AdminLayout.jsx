import React, { useState } from "react";
import Navbar from "../components/Navbar.jsx";
import Sidebar from "../components/Sidebar.jsx";
import JavaScriptClient from "../components/JavaScriptClient/JavaScriptClient.jsx";
import Footer from "../components/Footer.jsx";
import { Outlet } from "react-router-dom";

const AdminLayout = () => {
    const [sidebarWidth, setSidebarWidth] = useState(270); // Default width when open

    const toggleSidebar = () => {
        setSidebarWidth(sidebarWidth === 0 ? 270 : 0); // Toggle between 0px and 270px
    };

    return (
        <div className="min-h-screen relative bg-[var(--bg)] dark:bg-[var(--dark-bg)] flex flex-col">
            <Sidebar width={sidebarWidth} toggleSidebar={toggleSidebar} />
            <div className="main flex-1 bg-[var(--secondary-color)] dark:bg-[var(--dark-bg)]" style={{ marginLeft: `${sidebarWidth}px` }}>
                <div className="w-full ">
                    <Navbar toggleSidebar={toggleSidebar} />
                    <div className="lg:p-[20px] p-[10px] pb-[80px] bg-[var(--secondary-color)] dark:bg-[var(--dark-bg)] min-screen overflow-auto">
                        <Outlet />
                    </div>
                </div>
            </div>
            <Footer sidebarWidth={sidebarWidth} />
            <JavaScriptClient />
        </div>
    );
};

export default AdminLayout;