import React, { useEffect } from "react";

const JavaScriptClient = () => {
    useEffect(() => {
        // GSAP CDN scripts
        const gsapScript = document.createElement("script");
        gsapScript.src = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js";
        gsapScript.async = true;
        document.body.appendChild(gsapScript);

        const scrollTriggerScript = document.createElement("script");
        scrollTriggerScript.src = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js";
        scrollTriggerScript.async = true;
        document.body.appendChild(scrollTriggerScript);

        // Local JS scripts
        const navbarScript = document.createElement("script");
        navbarScript.src = "./assets/js/navbar.js";
        navbarScript.async = true;
        document.body.appendChild(navbarScript);

        const styleScript = document.createElement("script");
        styleScript.src = "./assets/js/style.js";
        styleScript.async = true;
        document.body.appendChild(styleScript);

        const backToTopScript = document.createElement("script");
        backToTopScript.src = "./assets/js/back-to-top.js";
        backToTopScript.async = true;
        document.body.appendChild(backToTopScript);

        // Cleanup function to remove scripts
        return () => {
            document.body.removeChild(gsapScript);
            document.body.removeChild(scrollTriggerScript);
            document.body.removeChild(navbarScript);
            document.body.removeChild(styleScript);
            document.body.removeChild(backToTopScript);
        };
    }, []);

    return null;
};

export default JavaScriptClient;