import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { BRAND, whatsappLink } from '../config/brand';
import { LogoMark } from './Logo';
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
    heart: (
        <svg {...iconProps}>
            <path d="M20.4 4.6a5.5 5.5 0 0 0-7.8 0L12 5.2l-.6-.6a5.5 5.5 0 0 0-7.8 7.8l.6.6L12 20.8l7.8-7.8.6-.6a5.5 5.5 0 0 0 0-7.8z" />
        </svg>
    ),
    burger: (
        <svg {...iconProps}>
            <line x1="4" y1="7" x2="20" y2="7" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="17" x2="13" y2="17" />
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
    info: (
        <svg {...iconProps}>
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
    ),
    tree: (
        <svg {...iconProps}>
            <path d="M12 3l5 6h-3l4 5h-4l3 4H7l3-4H6l4-5H7l5-6z" />
            <path d="M12 18v3" />
        </svg>
    ),
    mail: (
        <svg {...iconProps}>
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
    ),
};

// Mobile-only fixed top bar (the desktop rail handles >=1024px).
// Logo left; wishlist / cart / profile / burger right. The burger opens
// a full menu where "Shop" is a heading with its subcategories listed —
// not a clickable link itself.
const BottomNav = () => {
    const { getCartItemCount } = useCart();
    const { count: wishCount } = useWishlist();
    const navigate = useNavigate();
    const location = useLocation();
    const cartCount = getCartItemCount();

    const [menuOpen, setMenuOpen] = useState(false);

    // Close the menu on navigation and lock page scroll while it's open
    useEffect(() => { setMenuOpen(false); }, [location]);
    useEffect(() => {
        document.body.style.overflow = menuOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [menuOpen]);

    // Distraction-free checkout, and the admin has its own fixed bar
    if (location.pathname === '/payment' || location.pathname === '/admin') {
        return null;
    }

    const goToStory = () => {
        setMenuOpen(false);
        if (location.pathname === '/') {
            document.querySelector('.origin-section')?.scrollIntoView({ behavior: 'smooth' });
        } else {
            navigate('/');
            setTimeout(() => {
                document.querySelector('.origin-section')?.scrollIntoView({ behavior: 'smooth' });
            }, 450);
        }
    };

    // Only what's on sale right now — coming-soon categories live in the footer
    const shopLinks = [
        { to: '/search', label: 'All Fruits' },
        { to: '/search?query=Walnut', label: 'Walnuts (Akhrot)' },
    ];

    const exploreLinks = [
        { to: '/recipes', label: 'The Kitchen' },
        { to: '/information-centre', label: 'Information Centre' },
        { to: '/adopt-a-tree', label: 'Adopt a Tree' },
        { to: '/orders', label: 'My Orders' },
    ];

    return (
        <>
            <header className="mtb" role="banner">
                <Link to="/" className="mtb-logo" aria-label="Naliban Farms — home">
                    <LogoMark size={50} />
                </Link>

                <div className="mtb-actions">
                    <NavLink to="/wishlist" className={({ isActive }) => `mtb-btn ${isActive ? 'active' : ''}`} aria-label={`Wishlist, ${wishCount} items`}>
                        {Icons.heart}
                        {wishCount > 0 && <span className="mtb-badge">{wishCount}</span>}
                    </NavLink>
                    <NavLink to="/cart" className={({ isActive }) => `mtb-btn ${isActive ? 'active' : ''}`} aria-label={`Cart, ${cartCount} items`}>
                        {Icons.cart}
                        {cartCount > 0 && <span className="mtb-badge">{cartCount}</span>}
                    </NavLink>
                    <NavLink to="/profile" className={({ isActive }) => `mtb-btn ${isActive ? 'active' : ''}`} aria-label="Profile">
                        {Icons.profile}
                    </NavLink>
                    <button
                        className="mtb-btn"
                        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                        aria-expanded={menuOpen}
                        onClick={() => setMenuOpen(o => !o)}
                    >
                        {menuOpen ? Icons.close : Icons.burger}
                    </button>
                </div>
            </header>

            {menuOpen && (
                <div className="mtb-sheet-backdrop" onClick={() => setMenuOpen(false)}>
                    <nav className="mtb-sheet" aria-label="Menu" onClick={(e) => e.stopPropagation()}>
                        <div className="mtb-sheet-top">
                            <button className="mtb-btn" aria-label="Close menu" onClick={() => setMenuOpen(false)}>
                                {Icons.close}
                            </button>
                        </div>
                        <button className="mtb-sheet-item mtb-sheet-link" onClick={goToStory}>
                            Our Story
                        </button>

                        <p className="mtb-sheet-item mtb-sheet-head">Shop</p>
                        {shopLinks.map(l => (
                            <Link key={l.label} to={l.to} className="mtb-sheet-item mtb-sheet-sub">
                                {l.label}
                            </Link>
                        ))}

                        <p className="mtb-sheet-item mtb-sheet-head">Explore</p>
                        {exploreLinks.map(l => (
                            <Link key={l.label} to={l.to} className="mtb-sheet-item mtb-sheet-sub">
                                {l.label}
                            </Link>
                        ))}

                        <p className="mtb-sheet-item mtb-sheet-head">Contact</p>
                        <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="mtb-sheet-item mtb-sheet-sub">
                            WhatsApp Us
                        </a>
                        <a href={`mailto:${BRAND.supportEmail}`} className="mtb-sheet-item mtb-sheet-sub">
                            {BRAND.supportEmail}
                        </a>
                    </nav>
                </div>
            )}
        </>
    );
};

export default BottomNav;
