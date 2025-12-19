"use client";
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Origin() {
    const sectionRef = useRef(null);
    const img1Ref = useRef(null);
    const img2Ref = useRef(null);
    const img3Ref = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Different speeds for each image
            gsap.to(img1Ref.current, {
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: 1,
                },
                y: -150,
            });

            gsap.to(img2Ref.current, {
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: 2,
                },
                y: -150,
            });

            gsap.to(img3Ref.current, {
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: 0.5,
                },
                y: -100,
            });
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

            {/* Structured Grid on the Right */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gridTemplateRows: 'auto auto',
                gap: '20px',
                zIndex: 1
            }}>
                <div ref={img1Ref} style={{
                    width: '100%',
                    height: '250px',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                }}>
                    <img src="/images/landing/origin_soil.png" alt="Soil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>

                <div ref={img2Ref} style={{
                    width: '100%',
                    height: '350px',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    marginTop: '-20px',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                }}>
                    <img src="/images/landing/Women_holding_apple.jpg" alt="Woman holding apple" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>

                <div ref={img3Ref} style={{
                    width: '100%',
                    height: '300px',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    gridColumn: '1 / 2',
                    marginTop: '-50px',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                }}>
                    <img src="/images/landing/men_plucking_apple.jpg" alt="Man plucking apple" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
            </div>
        </section>
    );
}
