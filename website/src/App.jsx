import React from 'react';
import { Routes, Route } from 'react-router-dom';
import WebsiteLayout from './pages/WebsiteLayout.jsx';
import Home from './pages/Home.jsx';
// import Services from './pages/Services.jsx';
// import Tender from './pages/Tender.jsx';
// import Projects from './pages/Projects.jsx';
import Notice from './pages/Notice.jsx';
// import Gallery from './pages/Gallery.jsx';
// import Blog from './pages/Blog.jsx';
// import PrivacyPolicy from './pages/PrivacyPolicy.jsx';
// import TermsConditions from './pages/TermsConditions.jsx';
// import About from './pages/About.jsx';
// import Contact from './pages/Contact.jsx';

const App = () => {
    return (
        <Routes>
            <Route element={<WebsiteLayout />}>
                <Route path="/" element={<Home />} />
                {/*<Route path="/services" element={<Services />} />*/}
                {/*<Route path="/tender" element={<Tender />} />*/}
                {/*<Route path="/projects" element={<Projects />} />*/}
                <Route path="/notice" element={<Notice />} />
                {/*<Route path="/gallery" element={<Gallery />} />*/}
                {/*<Route path="/blog" element={<Blog />} />*/}
                {/*<Route path="/privacy-policy" element={<PrivacyPolicy />} />*/}
                {/*<Route path="/terms-conditions" element={<TermsConditions />} />*/}
                {/*<Route path="/about" element={<About />} />*/}
                {/*<Route path="/contact" element={<Contact />} />*/}
            </Route>
        </Routes>
    );
};

export default App;