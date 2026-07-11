import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import Logo from './Logo';
import { Icons } from './BottomNav';
import './TopNav.css';

// Desktop-only auto-hiding left rail (>=1024px). Rests off-screen with a
// frosted handle on the edge; hovering the edge (or keyboard focus)
// slides the glass panel in. Phones keep the bottom dock.
const TopNav = () => {
    const { getCartItemCount } = useCart();
    const { t } = useLanguage();
    const cartCount = getCartItemCount();

    const links = [
        { to: '/', label: t('nav.home'), icon: Icons.home, end: true },
        { to: '/search', label: t('nav.shop'), icon: Icons.search },
        { to: '/recipes', label: t('nav.kitchen'), icon: Icons.kitchen },
        { to: '/profile', label: t('nav.profile'), icon: Icons.profile },
    ];

    return (
        <div className="side-zone">
            {/* Edge handle — the only thing visible at rest */}
            <div className="side-hint" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 6l6 6-6 6" />
                </svg>
            </div>

            <aside className="side-nav">
                <div className="side-nav-logo">
                    <Logo variant="full" size={64} to="/" stacked />
                </div>

                <nav className="side-links" aria-label="Primary">
                    {links.map(link => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            end={link.end}
                            className={({ isActive }) => isActive ? 'side-link active' : 'side-link'}
                        >
                            <span className="side-link-icon">{link.icon}</span>
                            {link.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="side-bottom">
                    <Link to="/cart" className="side-cart" aria-label={`Cart, ${cartCount} items`}>
                        <span className="side-link-icon">
                            {Icons.cart}
                            {cartCount > 0 && <span className="side-cart-badge">{cartCount}</span>}
                        </span>
                        {t('nav.cart')}
                    </Link>
                </div>
            </aside>
        </div>
    );
};

export default TopNav;
