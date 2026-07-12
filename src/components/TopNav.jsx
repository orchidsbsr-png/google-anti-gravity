import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { BRAND, whatsappLink } from '../config/brand';
import Logo from './Logo';
import { Icons } from './BottomNav';
import './TopNav.css';

// Desktop-only auto-hiding left rail (>=1024px). Rests off-screen with a
// frosted handle on the edge; hovering the edge (or keyboard focus)
// slides the glass panel in. Phones keep the bottom dock.
//
// Shop / Information Centre / Contact are expandable groups — the rail
// equivalent of the requested dropdown menus.
const TopNav = () => {
    const { getCartItemCount } = useCart();
    const { t } = useLanguage();
    const cartCount = getCartItemCount();
    const [openGroup, setOpenGroup] = useState(null);

    // A clicked link keeps focus, and :focus-within pins the panel open
    // even after the mouse leaves. Dropping focus post-click lets the
    // rail follow the pointer again (keyboard tabbing still opens it).
    const releaseFocus = (e) => e.currentTarget.blur();

    const toggleGroup = (name) => setOpenGroup(g => (g === name ? null : name));

    const chevron = (open) => (
        <svg className={`side-chevron ${open ? 'open' : ''}`} width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 9l6 6 6-6" />
        </svg>
    );

    const shopItems = [
        { to: '/search', label: 'All Fruits' },
        { to: '/search?query=Walnut', label: 'Nuts · Walnut (Akhrot)' },
        { to: '/shop/dehydrated', label: 'Dehydrated Fruits · soon' },
        { to: '/shop/jams', label: 'Fruit Jams · soon' },
        { to: '/shop/chutneys', label: 'Chutneys · soon' },
        { to: '/coming-soon', label: 'Everything Coming Soon' },
    ];

    const infoItems = [
        { to: '/information-centre', label: 'Articles & Blogs' },
        { to: '/information-centre#faqs', label: 'FAQs' },
        { to: '/information-centre', label: 'Videos & Gallery · soon' },
    ];

    const contactItems = [
        { href: `mailto:${BRAND.supportEmail}`, label: 'Contact Us' },
        { href: whatsappLink('Hello! I need some help with Naliban Farms.'), label: 'Customer Support' },
        { href: whatsappLink('Hello! I have a wholesale enquiry.'), label: 'Wholesale Enquiries' },
        { href: whatsappLink('Hello! I want to become a partner farmer with Naliban Farms.'), label: 'Partner Farmer' },
        { href: whatsappLink('Hello! I have a question about my order.'), label: 'Order Enquiry' },
    ];

    const renderGroup = (name, icon, label, items, external = false) => (
        <div className={`side-group ${openGroup === name ? 'open' : ''}`}>
            <button
                type="button"
                className="side-link side-group-btn"
                aria-expanded={openGroup === name}
                onClick={() => toggleGroup(name)}
            >
                <span className="side-link-icon">{icon}</span>
                {label}
                {chevron(openGroup === name)}
            </button>
            {openGroup === name && (
                <div className="side-sub">
                    {items.map(item => external || item.href ? (
                        <a key={item.label} href={item.href}
                            target={item.href.startsWith('mailto') ? undefined : '_blank'}
                            rel="noopener noreferrer"
                            className="side-sublink" onClick={releaseFocus}>
                            {item.label}
                        </a>
                    ) : (
                        <Link key={item.label} to={item.to} className="side-sublink" onClick={releaseFocus}>
                            {item.label}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );

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
                    <NavLink to="/" end onClick={releaseFocus}
                        className={({ isActive }) => isActive ? 'side-link active' : 'side-link'}>
                        <span className="side-link-icon">{Icons.home}</span>
                        {t('nav.home')}
                    </NavLink>

                    {renderGroup('shop', Icons.search, t('nav.shop'), shopItems)}

                    <NavLink to="/recipes" onClick={releaseFocus}
                        className={({ isActive }) => isActive ? 'side-link active' : 'side-link'}>
                        <span className="side-link-icon">{Icons.kitchen}</span>
                        {t('nav.kitchen')}
                    </NavLink>

                    {renderGroup('info', Icons.info, 'Info Centre', infoItems)}

                    <NavLink to="/adopt-a-tree" onClick={releaseFocus}
                        className={({ isActive }) => isActive ? 'side-link active' : 'side-link'}>
                        <span className="side-link-icon">{Icons.tree}</span>
                        Adopt a Tree
                    </NavLink>

                    {renderGroup('contact', Icons.mail, 'Contact', contactItems, true)}

                    <NavLink to="/profile" onClick={releaseFocus}
                        className={({ isActive }) => isActive ? 'side-link active' : 'side-link'}>
                        <span className="side-link-icon">{Icons.profile}</span>
                        {t('nav.profile')}
                    </NavLink>
                </nav>

                <div className="side-bottom">
                    <Link to="/cart" className="side-cart" onClick={releaseFocus} aria-label={`Cart, ${cartCount} items`}>
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
