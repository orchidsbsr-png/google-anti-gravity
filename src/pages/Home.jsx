import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
    const [offset, setOffset] = useState(0);

    // Parallax Effect
    useEffect(() => {
        const handleScroll = () => setOffset(window.scrollY);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="home-container">
            {/* 1. HERO SECTION - Parallax */}
            <section className="hero-section">
                <div
                    className="hero-background"
                    style={{ transform: `translateY(${offset * 0.5}px)` }}
                ></div>
                <div className="hero-content">
                    <h1 className="hero-headline">Taste the Difference<br />Thin Air Makes.</h1>
                    <p className="hero-subheadline">
                        100% Organic fruit, hand-plucked at 2,600 meters and delivered straight from our mountain farm to your door.
                    </p>
                    <Link to="/search" className="cta-button primary">Shop the Harvest</Link>
                </div>
                <div className="scroll-indicator">
                    <span>Descend into the orchard</span>
                    <div className="arrow-down">↓</div>
                </div>
            </section>

            {/* 2. WHY 2600M? - ZigZag Layout */}
            <section className="why-section">
                <div className="content-wrapper">
                    <div className="split-layout">
                        <div className="text-block">
                            <h2 className="section-title">Grown Harder to<br />Taste Better.</h2>
                            <p className="story-text">
                                At 2,600 meters, survival isn’t easy. Our trees face intense ultraviolet sunlight, chilly nights, and thinner air.
                                <br /><br />
                                This natural stress forces the fruit to fight back by producing higher concentrations of sugars, antioxidants, and complex flavor compounds. It’s fruit that hasn't had it easy, and you can taste the victory in every bite.
                            </p>
                            <div className="comparison-graphic">
                                <div className="comp-item plain">
                                    <span className="label">Standard Farm</span>
                                    <span className="desc">Watered Down Flavor</span>
                                </div>
                                <div className="comp-item premium">
                                    <span className="label">Our Farm (2600m)</span>
                                    <span className="desc">Concentrated Nectar</span>
                                </div>
                            </div>
                        </div>
                        <div className="image-block altitude-shot">
                            {/* Placeholder for Mountain/Altitude Shot */}
                            <img src="/images/products/landing_image.jpg" alt="High Altitude Farm" />
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. HAND-PLUCKED EXPERIENCE - Carousel */}
            <section className="showcase-section">
                <div className="section-header">
                    <h2>The High-Altitude Collection</h2>
                    <p>Harvested yesterday. In your kitchen tomorrow.</p>
                </div>

                <div className="fruit-carousel">
                    {/* Card 1 */}
                    <Link to="/search" className="visual-card">
                        <div className="card-image">
                            <img src="/images/products/Red Delicious.png" alt="Honeycrisp Apple" />
                            <span className="season-tag">CURRENTLY IN SEASON</span>
                        </div>
                        <div className="card-details">
                            <h3>The High-Altitude Honeycrisp</h3>
                            <p>Shatteringly crisp skin giving way to sweet, effervescent flesh.</p>
                        </div>
                    </Link>

                    {/* Card 2 */}
                    <Link to="/search" className="visual-card">
                        <div className="card-image">
                            <img src="/images/products/Orange Persimmons.png" alt="Persimmon" />
                            <span className="season-tag">CURRENTLY IN SEASON</span>
                        </div>
                        <div className="card-details">
                            <h3>Mountain Golden Persimmon</h3>
                            <p>Custard-like texture with deep, honeyed sweetness.</p>
                        </div>
                    </Link>

                    {/* Card 3 */}
                    <Link to="/search" className="visual-card">
                        <div className="card-image">
                            <img src="/images/products/Fuzzy Kiwis.png" alt="Kiwi" />
                            <span className="season-tag">CURRENTLY IN SEASON</span>
                        </div>
                        <div className="card-details">
                            <h3>Emerald Frost Kiwi</h3>
                            <p>Tangy, vibrant green flesh with a tropical kick.</p>
                        </div>
                    </Link>
                </div>
            </section>

            {/* 4. THE JOURNEY - Timeline */}
            <section className="journey-section">
                <h2 className="section-title center">Farm to Doorstep</h2>
                <div className="timeline-container">
                    <div className="timeline-line"></div>

                    <div className="timeline-step">
                        <div className="step-number">01</div>
                        <div className="step-content">
                            <h3>The Dawn Pick</h3>
                            <p>We only harvest when you order. Plucked at peak ripeness by human hands, never machines.</p>
                        </div>
                    </div>

                    <div className="timeline-step">
                        <div className="step-number">02</div>
                        <div className="step-content">
                            <h3>The Mountain Descent</h3>
                            <p>Packed gently and immediately transported down the mountain in climate-controlled vehicles.</p>
                        </div>
                    </div>

                    <div className="timeline-step">
                        <div className="step-number">03</div>
                        <div className="step-content">
                            <h3>The Direct Route</h3>
                            <p>No warehouses, no middlemen, no weeks in cold storage.</p>
                        </div>
                    </div>

                    <div className="timeline-step">
                        <div className="step-number">04</div>
                        <div className="step-content">
                            <h3>Your Doorstep</h3>
                            <p>Arrives at your home fresh, fragrant, and full of life.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. SOCIAL PROOF */}
            <section className="social-section">
                <div className="content-wrapper">
                    <h2 className="section-title">Pure Mountain, Pure Food.</h2>
                    <p className="manifesto-text">
                        We don't just avoid chemicals because it's trendy. We do it because at this altitude,
                        the ecosystem is fragile and pristine. Our farming honors the mountain.
                        Certified Organic and lab-tested for purity.
                    </p>
                    <div className="testimonial-card">
                        <p className="quote">"I didn't know an apricot could taste like this. It’s like I’ve been eating watered-down versions my whole life."</p>
                        <p className="author">— Sarah K., City Resident</p>
                    </div>
                </div>
            </section>

            {/* 6. FOOTER CTA */}
            <section className="footer-cta-section">
                <div className="cta-content">
                    <h2>Your slice of paradise is waiting.</h2>
                    <p>Download the app to see what’s ripe this week and secure your box. Seasonal quantities are extremely limited by nature.</p>
                    <div className="app-buttons">
                        <Link to="/search" className="cta-button primary">Shop Now</Link>
                        {/* <button className="cta-button outline">Download App</button> */}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
