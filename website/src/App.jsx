import React from 'react';
import { Routes, Route } from 'react-router-dom';
import WebsiteLayout from './pages/WebsiteLayout.jsx';
import Home from './pages/Home.jsx';
import Notice from './pages/Notice.jsx';
import ViewNotice from "./pages/ViewNotice.jsx";
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';

const App = () => {
    return (
        <Routes>
            <Route element={<WebsiteLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/notice" element={<Notice />} />
                <Route path="/view-notice/:id" element={<ViewNotice />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
            </Route>
        </Routes>
    );
};

export default App;