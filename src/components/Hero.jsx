"use client";
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { useLanguage } from '../context/LanguageContext';
import Logo from './Logo';
import LiquidButton from './LiquidButton';

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
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'clamp(70px, 9vh, 110px) 0 clamp(60px, 8vh, 90px)'
        }}>
            {/* Background Image */}
            <img
                ref={bgRef}
                src="/images/landing/hero_orchard.png"
                alt="Himachal Orchard"
                fetchPriority="high"
                style={{
                    position: 'absolute', top: '-10%', left: 0, width: '100%', height: '120%', zIndex: 0,
                    objectFit: 'cover', willChange: 'transform'
                }}
            />
            {/* Cinematic vignette */}
            <div style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.45) 100%)',
                zIndex: 0
            }} />

            {/* Hero brand mark — the centerpiece of the landing page.
                Sits in normal flow above the headline so it can never
                overlap the text on any screen size. The inner div carries
                the GSAP reveal (which animates transform). */}
            <div className="hero-brand" style={{
                display: 'flex',
                justifyContent: 'center',
                zIndex: 3,
                color: '#F7F4EC',
                pointerEvents: 'none',
                marginBottom: 'clamp(18px, 3.5vh, 38px)'
            }}>
                <div className="hero-reveal" style={{ filter: 'drop-shadow(0 3px 14px rgba(0, 0, 0, 0.35))' }}>
                    <Logo variant="full" size={104} stacked dark />
                </div>
            </div>

            {/* Hero Text */}
            <div ref={textRef} className="hero-text" style={{ textAlign: 'center', color: '#F7F4EC', zIndex: 3, padding: '0 20px', maxWidth: '1100px', willChange: 'transform, opacity' }}>
                <p className="hero-reveal hero-eyebrow" style={{
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    marginBottom: '28px',
                    opacity: 0.85
                }}>
                    {t('hero.eyebrow')}
                </p>
                <h1 className="hero-reveal hero-title" style={{
                    fontFamily: "'Fraunces', Georgia, serif",
                    fontWeight: 400,
                    lineHeight: '1.02',
                    letterSpacing: '-0.02em',
                    color: 'var(--gold-bright, #E0B028)',
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
                    maxWidth: '620px',
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    opacity: 0.92
                }}>
                    {t('hero.sub')}
                </p>
                <p className="hero-reveal" style={{
                    fontSize: 'clamp(0.82rem, 1.2vw, 0.92rem)',
                    marginTop: '16px',
                    fontWeight: 300,
                    lineHeight: 1.7,
                    letterSpacing: '0.04em',
                    maxWidth: '540px',
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    opacity: 0.7
                }}>
                    {t('hero.sub2')}
                </p>
                <div className="hero-reveal" style={{
                    marginTop: '44px',
                    display: 'flex',
                    justifyContent: 'center'
                }}>
                    <LiquidButton to="/search" tint="terracotta">{t('hero.shop')}</LiquidButton>
                </div>
            </div>

            {/* Scroll cue — sits in flow below the CTA so it can never
                overlap it, whatever the screen height. Hidden on phones. */}
            <div className="hero-reveal hero-cue" style={{
                marginTop: 'clamp(40px, 7vh, 80px)',
                zIndex: 3,
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
