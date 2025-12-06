import React from 'react';
import { NavLink } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import './BottomNav.css';

const BottomNav = () => {
    const { getCartItemCount } = useCart();
    const { isDarkMode, toggleTheme } = useTheme();
    const cartCount = getCartItemCount();

    return (
        <nav className="bottom-nav glass-strong">
            <NavLink to="/" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                <span className="icon">🏠</span>
                <span className="label">Home</span>
            </NavLink>

            <NavLink to="/search" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                <span className="icon">🔍</span>
                <span className="label">Search</span>
            </NavLink>

            <NavLink to="/cart" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                <div className="icon-wrapper">
                    <span className="icon">🛒</span>
                    {cartCount > 0 && <span className="badge">{cartCount}</span>}
                </div>
                <span className="label">Cart</span>
            </NavLink>

            <NavLink to="/profile" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                <span className="icon">👤</span>
                <span className="label">Profile</span>
            </NavLink>

            <button onClick={toggleTheme} className="nav-item theme-toggle" aria-label="Toggle dark mode">
                <span className="icon">{isDarkMode ? '☀️' : '🌙'}</span>
                <span className="label">{isDarkMode ? 'Light' : 'Dark'}</span>
            </button>
        </nav>
    );
};

export default BottomNav;

