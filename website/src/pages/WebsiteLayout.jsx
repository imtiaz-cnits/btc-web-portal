// WebsiteLayout.jsx
import React from 'react';
import Navbar from "../components/Navbar.jsx";
import { Outlet } from "react-router-dom";
import Footer from "../components/Footer.jsx";
import JavaScriptClient from "../components/JavaScriptClient.jsx";

const WebsiteLayout = () => {
    return (
        <div className="flex flex-col">
            <Navbar />
            <main className="flex-grow pt-[120px] lg:pt-[148px]">
                <Outlet />
            </main>
            <Footer />
            <JavaScriptClient />
        </div>
    );
};

export default WebsiteLayout;