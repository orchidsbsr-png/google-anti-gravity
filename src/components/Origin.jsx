"use client";
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { useLanguage } from '../context/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

export default function Origin() {
    const { t } = useLanguage();
    const sectionRef = useRef(null);

    const stats = [
        { value: '50+', label: t('origin.stat1') },
        { value: '2,300m', label: t('origin.stat2') },
        { value: '0', label: t('origin.stat3') },
    ];

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo('.origin-reveal',
                { y: 50, opacity: 0 },
                {
                    y: 0, opacity: 1, duration: 1.2, ease: 'expo.out', stagger: 0.12,
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: 'top 65%',
                    }
                }
            );

            gsap.fromTo('.origin-image-main',
                { clipPath: 'inset(12% 12% 12% 12% round 20px)', scale: 1.12 },
                {
                    clipPath: 'inset(0% 0% 0% 0% round 20px)', scale: 1, ease: 'none',
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: 'top 80%',
                        end: 'center center',
                        scrub: 1,
                    }
                }
            );
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className="origin-section" style={{
            minHeight: '100vh',
            padding: '10vw 8vw',
            backgroundColor: '#2d3319',
            position: 'relative',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '6vw',
            alignItems: 'center',
            overflow: 'hidden'
        }}>
            <div style={{ zIndex: 2 }}>
                <p className="origin-reveal" style={{
                    fontSize: '0.72rem',
                    color: '#D4A017',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.35em',
                    marginBottom: '1.6rem'
                }}>
                    {t('origin.eyebrow')}
                </p>
                <h2 className="origin-reveal" style={{
                    fontFamily: "'Fraunces', Georgia, serif",
                    fontSize: 'clamp(2.8rem, 5.5vw, 4.6rem)',
                    color: 'var(--gold-bright, #E0B028)',
                    marginBottom: '2rem',
                    lineHeight: '1.05',
                    fontWeight: 400
                }}>
                    {t('origin.title1')}
                    <br />
                    <em style={{ fontWeight: 300 }}>{t('origin.title2')}</em>
                </h2>
                <p className="origin-reveal" style={{
                    fontSize: '1.1rem',
                    color: 'rgba(247, 244, 236, 0.85)',
                    lineHeight: '1.8',
                    maxWidth: '440px',
                    fontWeight: 300
                }}>
                    {t('origin.body')}
                </p>

                <div className="origin-reveal" style={{
                    display: 'flex',
                    gap: 'clamp(24px, 4vw, 56px)',
                    marginTop: '3.5rem',
                    paddingTop: '2.2rem',
                    borderTop: '1px solid rgba(247, 244, 236, 0.15)',
                    flexWrap: 'wrap'
                }}>
                    {stats.map((s, i) => (
                        <div key={i}>
                            <div style={{
                                fontFamily: "'Fraunces', Georgia, serif",
                                fontSize: 'clamp(1.8rem, 3vw, 2.6rem)',
                                color: '#F7F4EC',
                                fontWeight: 400,
                                lineHeight: 1
                            }}>{s.value}</div>
                            <div style={{
                                fontSize: '0.72rem',
                                color: 'rgba(247, 244, 236, 0.55)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.18em',
                                marginTop: '10px'
                            }}>{s.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Layered editorial imagery */}
            <div style={{ zIndex: 1, position: 'relative', minHeight: '480px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img
                    className="origin-image-main"
                    src="/images/landing/Women_holding_apple.jpg"
                    alt="Farmer holding a freshly picked apple"
                    loading="lazy"
                    style={{
                        width: '100%',
                        maxWidth: '480px',
                        height: 'clamp(420px, 60vh, 580px)',
                        objectFit: 'cover',
                        borderRadius: '20px',
                        display: 'block',
                        boxShadow: '0 40px 90px -30px rgba(0,0,0,0.6)'
                    }}
                />
                <img
                    className="origin-reveal"
                    src="/images/landing/origin_soil.png"
                    alt="Rich orchard soil"
                    loading="lazy"
                    style={{
                        position: 'absolute',
                        bottom: '-6%',
                        left: '-4%',
                        width: 'clamp(140px, 16vw, 210px)',
                        height: 'clamp(140px, 16vw, 210px)',
                        objectFit: 'cover',
                        borderRadius: '16px',
                        border: '6px solid #2d3319',
                        boxShadow: '0 25px 60px -20px rgba(0,0,0,0.55)'
                    }}
                />
            </div>
        </section>
    );
}
