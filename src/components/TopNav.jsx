import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import Logo from './Logo';
import { Icons } from './BottomNav';
import './TopNav.css';

// Desktop-only header (>=1024px). Phones keep the bottom dock —
// TopNav.css hides one or the other per breakpoint.
const TopNav = () => {
    const { getCartItemCount } = useCart();
    const { t } = useLanguage();
    const location = useLocation();
    const cartCount = getCartItemCount();

    // Distraction-free checkout, same as the bottom nav
    if (location.pathname === '/payment') {
        return null;
    }

    const links = [
        { to: '/', label: t('nav.home'), end: true },
        { to: '/search', label: t('nav.shop') },
        { to: '/recipes', label: t('nav.kitchen') },
        { to: '/profile', label: t('nav.profile') },
    ];

    return (
        <header className="top-nav">
            <Logo variant="full" size={34} to="/" className="top-nav-logo" />

            <nav className="top-nav-links" aria-label="Primary">
                {links.map(link => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        end={link.end}
                        className={({ isActive }) => isActive ? 'top-link active' : 'top-link'}
                    >
                        {link.label}
                    </NavLink>
                ))}
            </nav>

            <div className="top-nav-actions">
                <Link to="/cart" className="top-cart" aria-label={`Cart, ${cartCount} items`}>
                    {Icons.cart}
                    {cartCount > 0 && <span className="top-cart-badge">{cartCount}</span>}
                </Link>
            </div>
        </header>
    );
};

export default TopNav;
