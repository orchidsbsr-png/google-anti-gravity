import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
    return (
        <div className="home-page">
            <div className="hero-overlay"></div>

            {/* Top Navigation / Logo Area */}
            <nav className="top-nav">
                <div className="brand-logo">
                    <img src="/images/logo.png" alt="Farm Fresh" className="logo-image" />
                </div>
            </nav>

            {/* Main Hero Content - Positioned lower-middle */}
            <div className="main-hero-content">
                <h1 className="hero-title">
                    Nature's<br />
                    <span className="highlight">Candy</span>
                </h1>
                <p className="hero-subtitle">
                    Delivered from the mountains to you.
                </p>
                <Link to="/search" className="shop-fresh-btn">
                    Shop Fresh
                </Link>

                {/* Secondary Access Links (Health & Recipes) - Styled cleanly */}
                <div className="mini-features">
                    <Link to="/health-benefits" className="mini-feature-link">
                        <span>❤️ Health</span>
                    </Link>
                    <span className="separator">•</span>
                    <Link to="/recipes" className="mini-feature-link">
                        <span>👩‍🍳 Recipes</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Home;
