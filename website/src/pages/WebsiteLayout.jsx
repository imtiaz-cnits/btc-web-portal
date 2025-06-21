import React from 'react';
import Navbar from "../components/Navbar.jsx";
import { Outlet } from "react-router-dom";
import Footer from "../components/Footer.jsx";
import JavaScriptClient from "../components/JavaScriptClient.jsx";

const WebsiteLayout = () => {
    return (
        <div>
            <Navbar />
            <Outlet />
            <Footer />
            <JavaScriptClient />
        </div>
    );
};

export default WebsiteLayout;