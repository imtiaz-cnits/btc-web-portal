import React from 'react';
import { Routes, Route } from 'react-router-dom';
import WebsiteLayout from './pages/WebsiteLayout.jsx';
import Home from './pages/Home.jsx';
import EGPNotice from './pages/EGPNotice.jsx';
import ViewNotice from "./pages/ViewNotice.jsx";
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import WinnerListNotice from "./pages/WinnerListNotice.jsx";

const App = () => {
    return (
        <Routes>
            <Route element={<WebsiteLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/egp-notice" element={<EGPNotice />} />
                <Route path="/winner-list" element={<WinnerListNotice />} />
                <Route path="/view-notice/:id" element={<ViewNotice />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
            </Route>
        </Routes>
    );
};

export default App;