import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import './BottomNav.css';

const BottomNav = () => {
    const { getCartItemCount } = useCart();
    const { isDarkMode, toggleTheme } = useTheme();
    const cartCount = getCartItemCount();

    const [isOpen, setIsOpen] = useState(false);
    const navRef = useRef(null);
    const location = useLocation();

    // Close menu when clicking outside of it
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (navRef.current && !navRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close menu when navigating to a new page
    useEffect(() => {
        setIsOpen(false);
    }, [location]);

    const handleMenuToggle = () => setIsOpen(!isOpen);
    const handleLinkClick = () => setIsOpen(false);

    return (
        <nav ref={navRef} className={`bottom-nav ${isOpen ? 'expanded' : 'collapsed'}`}>
            {/* The Hamburger Button that triggers the expansion */}
            <button className="nav-toggle hamburger" onClick={handleMenuToggle} aria-label="Open menu">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
            </button>

            {/* The original full navigation pill list */}
            <div className="nav-items-container">
                <button className="nav-item close-btn" onClick={handleMenuToggle} aria-label="Close menu">
                    <span className="icon">✖</span>
                    <span className="label">Close</span>
                </button>

                <NavLink to="/" onClick={handleLinkClick} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                    <span className="icon">🏠</span>
                    <span className="label">Home</span>
                </NavLink>

                <NavLink to="/recipes" onClick={handleLinkClick} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                    <span className="icon">🍳</span>
                    <span className="label">Kitchen</span>
                </NavLink>

                <NavLink to="/search" onClick={handleLinkClick} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                    <span className="icon">🔍</span>
                    <span className="label">Search</span>
                </NavLink>

                <NavLink to="/cart" onClick={handleLinkClick} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                    <div className="icon-wrapper">
                        <span className="icon">🛒</span>
                        {cartCount > 0 && <span className="badge">{cartCount}</span>}
                    </div>
                    <span className="label">Cart</span>
                </NavLink>

                <NavLink to="/profile" onClick={handleLinkClick} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                    <span className="icon">👤</span>
                    <span className="label">Profile</span>
                </NavLink>

                <button onClick={() => { toggleTheme(); handleLinkClick(); }} className="nav-item theme-toggle" aria-label="Toggle dark mode">
                    <span className="icon">{isDarkMode ? '☀️' : '🌙'}</span>
                    <span className="label">{isDarkMode ? 'Light' : 'Dark'}</span>
                </button>
            </div>
        </nav>
    );
};

export default BottomNav;
