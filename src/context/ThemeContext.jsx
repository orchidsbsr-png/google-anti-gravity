import React, { createContext, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

// Light theme only — the cream/paper palette is the brand. The earlier
// device-based dark mode turned pages forest-green on dark-mode phones,
// which read as broken rather than intentional.
export const ThemeProvider = ({ children }) => {
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.removeItem('darkMode');
    }, []);

    return (
        <ThemeContext.Provider value={{ isDarkMode: false }}>
            {children}
        </ThemeContext.Provider>
    );
};
