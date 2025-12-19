"use client";
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
    const containerRef = useRef(null);
    const textRef = useRef(null);
    const bgRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Animation 1: Parallax Background
            gsap.to(bgRef.current, {
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top top",
                    end: "bottom top",
                    scrub: true,
                },
                yPercent: 20,
                scale: 1.15,
            });

            // Animation 2: Text fades and scales out on scroll
            gsap.to(textRef.current, {
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top top",
                    end: "bottom top",
                    scrub: true,
                },
                opacity: 0,
                scale: 0.8,
                y: -100,
            });

            // Initial Entrance
            gsap.fromTo(textRef.current,
                { y: 50, opacity: 0 },
                { y: 0, opacity: 1, duration: 2, ease: "expo.out", delay: 0.5 }
            );

        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={containerRef} style={{
            height: '110vh',
            overflow: 'hidden',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            {/* Background Image */}
            <img
                ref={bgRef}
                src="/images/landing/hero_orchard.png"
                alt="Himachal Orchard"
                style={{
                    position: 'absolute', top: '-10%', left: 0, width: '100%', height: '120%', zIndex: 0,
                    objectFit: 'cover'
                }}
            />
            {/* Dark Overlay */}
            <div style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 0
            }} />

            {/* Hero Text */}
            <div ref={textRef} style={{ textAlign: 'center', color: '#fff', zIndex: 1, padding: '0 20px' }}>
                <h1 style={{
                    fontSize: 'clamp(3rem, 10vw, 8rem)',
                    fontWeight: '800',
                    lineHeight: '0.9',
                    letterSpacing: '-0.02em',
                    textTransform: 'uppercase',
                    margin: 0
                }}>
                    Mountain <br /> To Table
                </h1>
                <p style={{
                    fontSize: 'clamp(1rem, 2vw, 1.5rem)',
                    marginTop: '30px',
                    fontWeight: '300',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    opacity: 0.8
                }}>
                    Premium Organic • Himachal Pradesh
                </p>
            </div>
        </section>
    );
}
