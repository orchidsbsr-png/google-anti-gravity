import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
    return (
        <div className="home-page">
            <div className="hero-overlay"></div>

            {/* Top Navigation */}
            <nav className="top-nav">
                <div className="brand-logo">
                    <span className="logo-icon">🍎</span>
                    <span>FARM FRESH</span>
                </div>
                <div className="nav-links">
                    <Link to="/" className="active">Home</Link>
                    <Link to="/search">Search</Link>
                    <Link to="/cart">Cart</Link>
                    <Link to="/profile">Profile</Link>
                </div>
            </nav>

            {/* Main Hero Content */}
            <div className="main-hero-content">
                <h1 className="hero-title">
                    Nature's<br />
                    <span className="highlight">Candy</span>
                </h1>
                <p className="hero-subtitle">
                    Delivered from the Himachal valley to your doorstep.
                </p>
                <Link to="/search" className="shop-fresh-btn">
                    Shop Fresh
                </Link>
            </div>

            {/* Feature Cards at Bottom */}
            <div className="features-grid">
                <Link to="/health-benefits" className="feature-card-new">
                    <div className="card-icon">❤️</div>
                    <h3>Health Benefits</h3>
                </Link>

                <Link to="/recipes" className="feature-card-new">
                    <div className="card-icon">👩‍🍳</div>
                    <h3>Recipes</h3>
                </Link>
            </div>
        </div>
    );
};

export default Home;
