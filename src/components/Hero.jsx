"use client";
import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { useLanguage } from '../context/LanguageContext';
import Logo from './Logo';

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
    const { t } = useLanguage();
    const containerRef = useRef(null);
    const textRef = useRef(null);
    const bgRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Parallax background
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

            // Text fades and drifts out on scroll
            gsap.to(textRef.current, {
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top top",
                    end: "bottom top",
                    scrub: true,
                },
                opacity: 0,
                scale: 0.92,
                y: -80,
            });

            // Staggered editorial entrance
            gsap.fromTo('.hero-reveal',
                { y: 60, opacity: 0 },
                { y: 0, opacity: 1, duration: 1.6, ease: "expo.out", stagger: 0.12, delay: 0.4 }
            );
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={containerRef} className="hero-viewport" style={{
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
                fetchPriority="high"
                style={{
                    position: 'absolute', top: '-10%', left: 0, width: '100%', height: '120%', zIndex: 0,
                    objectFit: 'cover'
                }}
            />
            {/* Cinematic vignette */}
            <div style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.45) 100%)',
                zIndex: 0
            }} />

            {/* Brand mark — phone only; the desktop top nav already shows the logo */}
            <div className="hero-reveal hero-brand" style={{
                position: 'absolute',
                top: 'clamp(20px, 3.5vw, 40px)',
                left: 'clamp(20px, 5vw, 64px)',
                zIndex: 3,
                color: '#F7F4EC'
            }}>
                <Logo variant="full" size={54} />
            </div>

            {/* Hero Text */}
            <div ref={textRef} style={{ textAlign: 'center', color: '#F7F4EC', zIndex: 3, padding: '0 20px', maxWidth: '1100px', marginTop: '-5vh' }}>
                <p className="hero-reveal" style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    letterSpacing: '0.42em',
                    textTransform: 'uppercase',
                    marginBottom: '28px',
                    opacity: 0.85
                }}>
                    {t('hero.eyebrow')}
                </p>
                <h1 className="hero-reveal" style={{
                    fontFamily: "'Fraunces', Georgia, serif",
                    fontSize: 'clamp(3.2rem, 9.5vw, 7.5rem)',
                    fontWeight: 400,
                    lineHeight: '1.02',
                    letterSpacing: '-0.02em',
                    color: 'var(--gold-bright, #E3C568)',
                    margin: 0
                }}>
                    {t('hero.title1')}
                    <br />
                    <em style={{ fontWeight: 300 }}>{t('hero.title2')}</em>
                </h1>
                <p className="hero-reveal" style={{
                    fontSize: 'clamp(1rem, 1.6vw, 1.15rem)',
                    marginTop: '32px',
                    fontWeight: 300,
                    lineHeight: 1.7,
                    maxWidth: '520px',
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    opacity: 0.9
                }}>
                    {t('hero.sub')}
                </p>
                <div className="hero-reveal" style={{
                    marginTop: '44px',
                    display: 'flex',
                    gap: '16px',
                    justifyContent: 'center',
                    flexWrap: 'wrap'
                }}>
                    <Link to="/search" className="btn-terracotta">{t('hero.shop')}</Link>
                    <Link to="/adopt-a-tree" style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '1rem 2.4rem',
                        borderRadius: '999px',
                        border: '1px solid rgba(247,244,236,0.5)',
                        color: '#F7F4EC',
                        textDecoration: 'none',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        letterSpacing: '0.18em',
                        textTransform: 'uppercase',
                        backdropFilter: 'blur(6px)',
                        transition: 'background 0.3s ease, border-color 0.3s ease'
                    }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(247,244,236,0.14)'; e.currentTarget.style.borderColor = '#F7F4EC'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(247,244,236,0.5)'; }}
                    >
                        {t('hero.adopt')}
                    </Link>
                </div>
            </div>

            {/* Scroll cue */}
            <div className="hero-reveal" style={{
                position: 'absolute',
                bottom: '4.5vh',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                color: 'rgba(247,244,236,0.75)'
            }}>
                <span style={{ fontSize: '0.65rem', letterSpacing: '0.35em', textTransform: 'uppercase' }}>{t('hero.scroll')}</span>
                <span style={{
                    display: 'block',
                    width: '1px',
                    height: '48px',
                    background: 'linear-gradient(to bottom, rgba(247,244,236,0.9), transparent)',
                    animation: 'scrollPulse 2.2s ease-in-out infinite'
                }} />
                <style>{`
                    @keyframes scrollPulse {
                        0% { transform: scaleY(0); transform-origin: top; opacity: 0; }
                        30% { transform: scaleY(1); transform-origin: top; opacity: 1; }
                        100% { transform: scaleY(1) translateY(10px); opacity: 0; }
                    }
                `}</style>
            </div>

            {/* Seamless transition into the dark Origin section */}
            <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '100%',
                height: '35vh',
                background: 'linear-gradient(to bottom, transparent 0%, rgba(36, 42, 20, 0.2) 30%, rgba(36, 42, 20, 0.6) 65%, #2d3319 100%)',
                zIndex: 2,
                pointerEvents: 'none'
            }} />
        </section>
    );
}
