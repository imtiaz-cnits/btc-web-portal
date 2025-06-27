"use client";
import React, { useEffect } from "react";

const JavaScriptClient = () => {
    useEffect(() => {
        const scriptApp = document.createElement("script");
        scriptApp.src = "/admin/js/app.js"; // Updated to include /admin
        scriptApp.async = true;
        document.body.appendChild(scriptApp);

        const scriptSidebar = document.createElement("script");
        scriptSidebar.src = "/admin/js/sidebar.js"; // Updated to include /admin
        scriptSidebar.async = true;
        document.body.appendChild(scriptSidebar);

        return () => {
            document.body.removeChild(scriptApp);
            document.body.removeChild(scriptSidebar);
        };
    }, []);

    return null;
};

export default JavaScriptClient;