"use client";
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Origin() {
    const sectionRef = useRef(null);
    useEffect(() => {
        const ctx = gsap.context(() => {
            // Placeholder for new animations
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} style={{
            minHeight: '100vh',
            padding: '10vw 8vw',
            backgroundColor: '#2d3319', // Dark background to match Hero bottom
            position: 'relative',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '6vw',
            alignItems: 'center',
            overflow: 'hidden'
        }}>
            <div style={{ zIndex: 2 }}>
                <p style={{
                    fontSize: '1.2rem',
                    color: '#f5f5f0', // Light text
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    marginBottom: '1rem',
                    opacity: 0.8
                }}>
                    Farm Fresh
                </p>
                <h2 style={{
                    fontSize: 'clamp(3rem, 6vw, 5rem)',
                    color: '#f5f5f0', // Light text
                    marginBottom: '2rem',
                    lineHeight: '1.1',
                    fontWeight: '800'
                }}>
                    Rooted <br /> in the Soil
                </h2>
                <p style={{
                    fontSize: '1.2rem',
                    color: '#f5f5f0', // Light text
                    lineHeight: '1.7',
                    maxWidth: '430px',
                    fontWeight: '400',
                    opacity: 0.9
                }}>
                    Grown with gratitude. Our produce is pure and wholesome, cultivated by local farmers for generations. Taste the difference of nature's best.
                </p>
            </div>

            {/* Unique Content Placeholder */}
            <div style={{ zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
                {/* Ready for the unique element */}
            </div>
        </section>
    );
}
