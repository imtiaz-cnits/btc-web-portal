import React from 'react';
import { Routes, Route } from 'react-router-dom';
import WebsiteLayout from './pages/WebsiteLayout.jsx';
import Home from './pages/Home.jsx';
import EGPNotice from './pages/EGPNotice.jsx';
import ViewEgpNotice from './pages/ViewEgpNotice.jsx';
import ViewWinnerNotice from './pages/ViewWinnerNotice.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import WinnerListNotice from './pages/WinnerListNotice.jsx';

const App = () => {
    return (
        <Routes>
            <Route element={<WebsiteLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/egp-notice" element={<EGPNotice />} />
                <Route path="/winner-list" element={<WinnerListNotice />} />
                <Route path="/view-egp-notice/:id" element={<ViewEgpNotice />} />
                <Route path="/view-winner-notice/:id" element={<ViewWinnerNotice />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
            </Route>
        </Routes>
    );
};

export default App;