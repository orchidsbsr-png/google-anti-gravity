import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import './BottomNav.css';

const iconProps = {
    width: 21,
    height: 21,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
};

export const Icons = {
    home: (
        <svg {...iconProps}>
            <path d="M3 10.5L12 3l9 7.5" />
            <path d="M5 9.5V21h14V9.5" />
            <path d="M9.5 21v-6h5v6" />
        </svg>
    ),
    kitchen: (
        <svg {...iconProps}>
            <path d="M7 3v7" />
            <path d="M4.5 3v4a2.5 2.5 0 0 0 5 0V3" />
            <path d="M7 10v11" />
            <path d="M17 3c-2 2-2.5 5-2.5 8H17v10" />
        </svg>
    ),
    search: (
        <svg {...iconProps}>
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.2" y2="16.2" />
        </svg>
    ),
    cart: (
        <svg {...iconProps}>
            <circle cx="9" cy="20" r="1.4" />
            <circle cx="17.5" cy="20" r="1.4" />
            <path d="M3 3.5h2.5l2.2 12h11l2.3-8.5H6" />
        </svg>
    ),
    profile: (
        <svg {...iconProps}>
            <circle cx="12" cy="8" r="4" />
            <path d="M4.5 20.5c1.5-3.5 4.2-5 7.5-5s6 1.5 7.5 5" />
        </svg>
    ),
    sun: (
        <svg {...iconProps}>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
    ),
    moon: (
        <svg {...iconProps}>
            <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" />
        </svg>
    ),
    close: (
        <svg {...iconProps}>
            <line x1="6" y1="6" x2="18" y2="18" />
            <line x1="18" y1="6" x2="6" y2="18" />
        </svg>
    ),
};

const BottomNav = () => {
    const { getCartItemCount } = useCart();
    const { t } = useLanguage();
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

    // Distraction-free checkout: hide global nav while paying
    if (location.pathname === '/payment') {
        return null;
    }

    return (
        <nav ref={navRef} className={`bottom-nav ${isOpen ? 'expanded' : 'collapsed'}`}>
            {/* The Hamburger Button that triggers the expansion */}
            <button className="nav-toggle hamburger" onClick={handleMenuToggle} aria-label="Open menu">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <line x1="4" y1="8" x2="20" y2="8"></line>
                    <line x1="4" y1="16" x2="14" y2="16"></line>
                </svg>
            </button>

            {/* The original full navigation pill list */}
            <div className="nav-items-container">
                <button className="nav-item close-btn" onClick={handleMenuToggle} aria-label="Close menu">
                    <span className="icon">{Icons.close}</span>
                    <span className="label">{t('nav.close')}</span>
                </button>

                <NavLink to="/" onClick={handleLinkClick} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                    <span className="icon">{Icons.home}</span>
                    <span className="label">{t('nav.home')}</span>
                </NavLink>

                <NavLink to="/recipes" onClick={handleLinkClick} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                    <span className="icon">{Icons.kitchen}</span>
                    <span className="label">{t('nav.kitchen')}</span>
                </NavLink>

                <NavLink to="/search" onClick={handleLinkClick} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                    <span className="icon">{Icons.search}</span>
                    <span className="label">{t('nav.shop')}</span>
                </NavLink>

                <NavLink to="/cart" onClick={handleLinkClick} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                    <div className="icon-wrapper">
                        <span className="icon">{Icons.cart}</span>
                        {cartCount > 0 && <span className="badge">{cartCount}</span>}
                    </div>
                    <span className="label">{t('nav.cart')}</span>
                </NavLink>

                <NavLink to="/profile" onClick={handleLinkClick} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                    <span className="icon">{Icons.profile}</span>
                    <span className="label">{t('nav.profile')}</span>
                </NavLink>
            </div>
        </nav>
    );
};

export default BottomNav;
