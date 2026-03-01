"use client";
import React from 'react';
import SmoothScroll from '../components/SmoothScroll';
import Hero from '../components/Hero';
import Origin from '../components/Origin';
import ProductShowcase from '../components/ProductShowcase';
import Reviews from '../components/Reviews';
import Process from '../components/Process';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <SmoothScroll>
            <main style={{ backgroundColor: '#f5f5f0' }}>
                <Hero />
                <Origin />
                <ProductShowcase />
                <Reviews />
                <Process />

                {/* Adopt a Tree CTA */}
                <section style={{
                    padding: '8vw 5vw',
                    textAlign: 'center',
                    backgroundColor: '#e9ecd3', // Light, earthy green/beige
                    color: '#2d3319',
                    position: 'relative'
                }}>
                    <h2 style={{ fontSize: '3rem', marginBottom: '20px' }}>You can adopt a tree</h2>
                    <p style={{ fontSize: '1.2rem', opacity: 0.9, marginBottom: '30px', maxWidth: '600px', margin: '0 auto 40px auto' }}>
                        Join us in cultivating the finest apples grown purely by nature. Adopt an organic apple tree today for a sustainable harvest.
                    </p>
                    <Link to="/adopt-a-tree" style={{
                        display: 'inline-block',
                        padding: '15px 40px',
                        fontSize: '1.1rem',
                        backgroundColor: '#2d3319', // Dark forest green
                        color: '#fff',
                        textDecoration: 'none',
                        borderRadius: '50px',
                        cursor: 'pointer',
                        transition: 'transform 0.3s ease, background-color 0.3s ease'
                    }}
                        onMouseEnter={(e) => {
                            e.target.style.transform = 'scale(1.05)';
                            e.target.style.backgroundColor = '#1a1f0e';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'scale(1)';
                            e.target.style.backgroundColor = '#2d3319';
                        }}
                    >
                        Learn More
                    </Link>

                    {/* Transition from CTA to Footer */}
                    <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        width: '100%',
                        height: '20vh',
                        background: 'linear-gradient(to bottom, transparent 0%, rgba(45, 51, 25, 0.4) 60%, #2d3319 100%)',
                        zIndex: 1,
                        pointerEvents: 'none' // Ensures it doesn't block clicks
                    }} />
                </section>

                {/* Contact/Footer Section */}
                <section style={{
                    padding: '10vw',
                    textAlign: 'center',
                    backgroundColor: '#2d3319',
                    color: '#f5f5f0'
                }}>
                    <h2 style={{ fontSize: '3rem', marginBottom: '20px' }}>Join the Movement</h2>
                    <p style={{ fontSize: '1.2rem', opacity: 0.8, marginBottom: '40px' }}>Experience the purest flavors of Himachal.</p>
                    <Link to="/search" style={{
                        display: 'inline-block',
                        padding: '15px 40px',
                        fontSize: '1.1rem',
                        backgroundColor: '#c44536', // Terracotta
                        color: '#fff',
                        textDecoration: 'none',
                        borderRadius: '50px',
                        cursor: 'pointer',
                        transition: 'transform 0.3s ease'
                    }}
                        onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                    >
                        Shop Now
                    </Link>
                </section>

                {/* Legal Links Footer */}
                <footer style={{
                    padding: '40px 20px',
                    textAlign: 'center',
                    backgroundColor: '#242a14',
                    color: 'rgba(245, 245, 240, 0.6)',
                    fontSize: '0.9rem'
                }}>
                    <div style={{ marginBottom: '20px' }}>
                        <Link to="/legal" style={{ color: 'inherit', textDecoration: 'none', margin: '0 10px' }}>Terms</Link>
                        <Link to="/legal" style={{ color: 'inherit', textDecoration: 'none', margin: '0 10px' }}>Privacy</Link>
                    </div>
                    <p>© 2025 Farm Fresh. Pure Himachal.</p>
                </footer>
            </main>
        </SmoothScroll>
    );
};

export default Home;
