import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

// Theme follows the device (prefers-color-scheme) — there is no manual
// toggle in the UI anymore. Live-updates if the user switches their
// system theme while the app is open.
export const ThemeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(
        () => window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
    );

    useEffect(() => {
        const media = window.matchMedia('(prefers-color-scheme: dark)');
        const onChange = (e) => setIsDarkMode(e.matches);
        media.addEventListener('change', onChange);

        // Manual preference from the old toggle is obsolete
        localStorage.removeItem('darkMode');

        return () => media.removeEventListener('change', onChange);
    }, []);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    }, [isDarkMode]);

    return (
        <ThemeContext.Provider value={{ isDarkMode }}>
            {children}
        </ThemeContext.Provider>
    );
};
