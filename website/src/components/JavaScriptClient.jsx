import React, { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const JavaScriptClient = () => {
    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger);

        // Load other scripts if needed
        const navbarScript = document.createElement('script');
        navbarScript.src = './src/assets/js/navbar.js';
        navbarScript.async = true;
        document.body.appendChild(navbarScript);

        return () => {
            document.body.removeChild(navbarScript);
        };
    }, []);

    return null;
};

export default JavaScriptClient;