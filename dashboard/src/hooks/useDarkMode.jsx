// client/src/hooks/useDarkMode.js
import { useEffect, useState } from "react";

const useDarkMode = () => {
    const [dark, setDark] = useState(() => {
        const saved = localStorage.getItem("darkMode");
        return saved ? JSON.parse(saved) :
               window.matchMedia("(prefers-color-scheme: dark)").matches;
    });

    useEffect(() => {
        localStorage.setItem("darkMode", JSON.stringify(dark));
        if (dark) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, [dark]);

    return [dark, setDark];
};

export default useDarkMode;