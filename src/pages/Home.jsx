import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
    return (
        <div className="home-page">
            <div className="hero-section">
                <div className="hero-content glass-strong">
                    <h1>Farm Fresh Fruits</h1>
                    <p>Hand-picked goodness delivered to your doorstep.</p>
                    <Link to="/search" className="btn-primary">Shop Fresh</Link>
                </div>
            </div>

            <div className="features-section">
                <Link to="/health-benefits" className="feature-card glass">
                    <span className="feature-icon">❤️</span>
                    <h3>Health Benefits</h3>
                    <p>Discover why our fruits are good for you.</p>
                </Link>

                <Link to="/recipes" className="feature-card glass">
                    <span className="feature-icon">👩‍🍳</span>
                    <h3>Recipes</h3>
                    <p>Delicious ways to enjoy our produce.</p>
                </Link>
            </div>
        </div>
    );
};

export default Home;
