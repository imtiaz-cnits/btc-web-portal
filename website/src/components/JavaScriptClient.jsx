import React, { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const JavaScriptClient = () => {
    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger);

        // Load other scripts if needed
        const navbarScript = document.createElement('script');
        navbarScript.src = './assets/js/navbar.js';
        navbarScript.async = true;
        document.body.appendChild(navbarScript);

        const backToTopScript = document.createElement('script');
        backToTopScript.src = './assets/js/back-to-top.js';
        backToTopScript.async = true;
        document.body.appendChild(backToTopScript);

        return () => {
            document.body.removeChild(navbarScript);
            document.body.removeChild(backToTopScript);
        };
    }, []);

    return null;
};

export default JavaScriptClient;