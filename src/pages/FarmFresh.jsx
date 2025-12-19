"use client";
import SmoothScroll from '../components/SmoothScroll';
import Hero from '../components/Hero';
import Origin from '../components/Origin';
import ProductShowcase from '../components/ProductShowcase';
import Process from '../components/Process';

export default function FarmFresh() {
    return (
        <SmoothScroll>
            <main style={{ backgroundColor: '#2d3319' }}>
                <Hero />
                <Origin />
                <ProductShowcase />
                <Process />

                {/* Contact/Footer Section */}
                <section style={{
                    padding: '10vw',
                    textAlign: 'center',
                    backgroundColor: '#2d3319',
                    color: '#f5f5f0'
                }}>
                    <h2 style={{ fontSize: '3rem', marginBottom: '20px' }}>Join the Movement</h2>
                    <p style={{ fontSize: '1.2rem', opacity: 0.8, marginBottom: '40px' }}>Experience the purest flavors of Himachal.</p>
                    <button style={{
                        padding: '15px 40px',
                        fontSize: '1.1rem',
                        backgroundColor: '#c44536', // Terracotta
                        color: '#fff',
                        border: 'none',
                        borderRadius: '50px',
                        cursor: 'pointer',
                        transition: 'transform 0.3s ease'
                    }}
                        onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                    >
                        Shop Now
                    </button>
                </section>
            </main>
        </SmoothScroll>
    );
}
