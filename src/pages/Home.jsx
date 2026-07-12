"use client";
import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import SmoothScroll from '../components/SmoothScroll';
import Hero from '../components/Hero';
import Origin from '../components/Origin';
import TrustHighlights from '../components/TrustHighlights';
import ProductShowcase from '../components/ProductShowcase';
import Reviews from '../components/Reviews';
import Process from '../components/Process';
import OrchardTicker from '../components/OrchardTicker';
import Logo from '../components/Logo';
import { Link } from 'react-router-dom';
import { BRAND, whatsappLink } from '../config/brand';
import { useLanguage } from '../context/LanguageContext';

const footerLink = {
    color: 'rgba(247, 244, 236, 0.65)',
    textDecoration: 'none',
    fontSize: '0.85rem',
    lineHeight: 2.1,
    display: 'block',
    transition: 'color 0.25s ease'
};

gsap.registerPlugin(ScrollTrigger);

const Home = () => {
    const { t } = useLanguage();
    const mainRef = useRef(null);

    // Same feel as the hero: content softly fades, lifts, and blurs away
    // as it scrolls out of the top of the screen.
    useEffect(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const ctx = gsap.context(() => {
            gsap.utils.toArray('.fade-out-up').forEach((el) => {
                // Same geometry as the hero: dimming starts the moment the
                // element nears the top edge, finishing as it leaves.
                gsap.to(el, {
                    opacity: 0,
                    y: -60,
                    scale: 0.96,
                    filter: 'blur(6px)',
                    ease: 'none',
                    scrollTrigger: {
                        trigger: el,
                        start: 'top 12%',
                        end: 'top -35%',
                        scrub: true,
                    }
                });
            });
        }, mainRef);
        return () => ctx.revert();
    }, []);

    return (
        <SmoothScroll>
            <main ref={mainRef} style={{ backgroundColor: '#F7F4EC' }}>
                <Hero />
                <OrchardTicker />
                <Origin />
                {/* Origin (deep green) melts into the Promise (cream) */}
                <div className="section-fade" aria-hidden="true"
                    style={{ background: 'linear-gradient(to bottom, #2D3319, #F7F4EC)' }} />
                <TrustHighlights />
                {/* Promise (cream) melts into the orchard showcase (near-black green) */}
                <div className="section-fade" aria-hidden="true"
                    style={{ background: 'linear-gradient(to bottom, #F7F4EC, #1B2112)' }} />
                <ProductShowcase />
                <Reviews />
                <Process />

                {/* Harvest Club */}
                <section style={{
                    padding: 'clamp(80px, 9vw, 140px) 6vw',
                    backgroundColor: '#F7F4EC',
                    textAlign: 'center'
                }}>
                    <div className="fade-out-up">
                    <p style={{
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.35em',
                        color: '#D4A017',
                        marginBottom: '20px'
                    }}>
                        {t('club.eyebrow')}
                    </p>
                    <h2 style={{
                        fontFamily: "'Fraunces', Georgia, serif",
                        fontSize: 'clamp(2.4rem, 4.8vw, 4rem)',
                        fontWeight: 400,
                        lineHeight: 1.08,
                        color: 'var(--gold-deep, #B8860B)',
                        maxWidth: '760px',
                        margin: '0 auto 22px'
                    }}>
                        {t('club.title1')}
                        <br />
                        <em style={{ fontWeight: 300 }}>{t('club.title2')}</em>
                    </h2>
                    <p style={{
                        fontSize: '1.02rem',
                        lineHeight: 1.8,
                        fontWeight: 300,
                        color: '#4A4F3E',
                        maxWidth: '480px',
                        margin: '0 auto 36px'
                    }}>
                        {t('club.body')}
                    </p>
                    <a
                        href={whatsappLink('Hello! I would like to join the Harvest Club — a box a month.')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary"
                    >
                        {t('club.cta')}
                    </a>
                    <p style={{
                        marginTop: '18px',
                        fontSize: '0.72rem',
                        letterSpacing: '0.18em',
                        textTransform: 'uppercase',
                        color: '#83866F'
                    }}>
                        {t('club.note')}
                    </p>
                    </div>
                </section>

                {/* Harvest Club (cream) melts into the living gift (sage) */}
                <div className="section-fade" aria-hidden="true"
                    style={{ background: 'linear-gradient(to bottom, #F7F4EC, #E9ECD3)' }} />

                {/* Adopt a Tree CTA */}
                <section style={{
                    padding: 'clamp(90px, 10vw, 160px) 6vw',
                    backgroundColor: '#E9ECD3',
                    color: '#1C2313',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div className="fade-out-up" style={{
                        maxWidth: '1200px',
                        margin: '0 auto',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '5vw',
                        alignItems: 'center'
                    }}>
                        <div>
                            <p style={{
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '0.35em',
                                color: '#C44536',
                                marginBottom: '20px'
                            }}>
                                {t('adopt.eyebrow')}
                            </p>
                            <h2 style={{
                                fontFamily: "'Fraunces', Georgia, serif",
                                fontSize: 'clamp(2.6rem, 5vw, 4.2rem)',
                                fontWeight: 400,
                                lineHeight: 1.05,
                                color: 'var(--gold-deep, #B8860B)',
                                marginBottom: '24px'
                            }}>
                                {t('adopt.title1')}
                                <br />
                                <em style={{ fontWeight: 300 }}>{t('adopt.title2')}</em>
                            </h2>
                            <p style={{
                                fontSize: '1.05rem',
                                lineHeight: 1.8,
                                fontWeight: 300,
                                maxWidth: '460px',
                                marginBottom: '36px',
                                color: '#4A4F3E'
                            }}>
                                {t('adopt.body')}
                            </p>
                            <Link to="/adopt-a-tree" className="btn-primary">{t('adopt.cta')}</Link>
                        </div>
                        <div style={{ position: 'relative' }}>
                            <img
                                src="/images/adopt apple tree photos/red apple tree.jpg"
                                alt="An apple tree heavy with fruit"
                                loading="lazy"
                                style={{
                                    width: '100%',
                                    height: 'clamp(340px, 46vh, 480px)',
                                    objectFit: 'cover',
                                    borderRadius: '22px',
                                    boxShadow: '0 35px 80px -30px rgba(28, 35, 19, 0.4)'
                                }}
                            />
                        </div>
                    </div>

                    {/* Transition into the dark footer */}
                    <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        width: '100%',
                        height: '14vh',
                        background: 'linear-gradient(to bottom, transparent 0%, rgba(36, 42, 20, 0.35) 65%, #242a14 100%)',
                        zIndex: 1,
                        pointerEvents: 'none'
                    }} />
                </section>

                {/* Footer */}
                <footer style={{
                    backgroundColor: '#242a14',
                    color: '#F7F4EC',
                    padding: 'clamp(80px, 8vw, 130px) 6vw 0'
                }}>
                    <div style={{
                        maxWidth: '1200px',
                        margin: '0 auto',
                        textAlign: 'center',
                        paddingBottom: 'clamp(60px, 6vw, 100px)',
                        borderBottom: '1px solid rgba(247, 244, 236, 0.12)'
                    }}>
                        <h2 style={{
                            fontFamily: "'Fraunces', Georgia, serif",
                            fontSize: 'clamp(2.4rem, 4.5vw, 3.8rem)',
                            fontWeight: 400,
                            color: 'var(--gold-bright, #E0B028)',
                            marginBottom: '18px'
                        }}>
                            {t('footer.title1')} <em style={{ fontWeight: 300 }}>{t('footer.title2')}</em> {t('footer.title3')}
                        </h2>
                        <p style={{ fontSize: '1rem', opacity: 0.7, fontWeight: 300, marginBottom: '38px' }}>
                            {t('footer.sub')}
                        </p>
                        <Link to="/search" className="btn-terracotta">{t('footer.shopNow')}</Link>
                    </div>

                    <div style={{
                        maxWidth: '1200px',
                        margin: '0 auto',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                        gap: '40px',
                        padding: 'clamp(50px, 5vw, 80px) 0'
                    }}>
                        <div>
                            <div style={{ marginBottom: '16px' }}>
                                <Logo variant="full" size={50} dark />
                            </div>
                            <p style={{ fontSize: '0.85rem', lineHeight: 1.8, opacity: 0.6, fontWeight: 300, maxWidth: '260px' }}>
                                Naturally grown Himalayan fruit from Naliban Khatasu,
                                Jubbal-Kotkhai — our orchards and trusted farming
                                families, direct to your doorstep.
                            </p>
                        </div>
                        <div>
                            <p style={{
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                letterSpacing: '0.28em',
                                textTransform: 'uppercase',
                                color: '#D4A017',
                                marginBottom: '16px'
                            }}>{t('footer.explore')}</p>
                            <Link to="/search" style={footerLink}>Shop the Harvest</Link>
                            <Link to="/coming-soon" style={footerLink}>Coming Soon</Link>
                            <Link to="/adopt-a-tree" style={footerLink}>Adopt a Tree</Link>
                            <Link to="/recipes" style={footerLink}>The Kitchen</Link>
                            <Link to="/information-centre" style={footerLink}>Information Centre</Link>
                            <Link to="/health-benefits" style={footerLink}>Health Benefits</Link>
                        </div>
                        <div>
                            <p style={{
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                letterSpacing: '0.28em',
                                textTransform: 'uppercase',
                                color: '#D4A017',
                                marginBottom: '16px'
                            }}>{t('footer.account')}</p>
                            <Link to="/orders" style={footerLink}>My Orders</Link>
                            <Link to="/profile" style={footerLink}>Profile</Link>
                            <Link to="/cart" style={footerLink}>Cart</Link>
                        </div>
                        <div>
                            <p style={{
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                letterSpacing: '0.28em',
                                textTransform: 'uppercase',
                                color: '#D4A017',
                                marginBottom: '16px'
                            }}>{t('footer.legal')}</p>
                            <Link to="/legal#terms" style={footerLink}>Terms of Service</Link>
                            <Link to="/legal#privacy" style={footerLink}>Privacy Policy</Link>
                            <Link to="/legal#shipping" style={footerLink}>Shipping Policy</Link>
                            <Link to="/legal#refunds" style={footerLink}>Refund Policy</Link>
                        </div>
                        <div>
                            <p style={{
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                letterSpacing: '0.28em',
                                textTransform: 'uppercase',
                                color: '#D4A017',
                                marginBottom: '16px'
                            }}>Contact</p>
                            <a href={`mailto:${BRAND.supportEmail}`} style={footerLink}>{BRAND.supportEmail}</a>
                            <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" style={footerLink}>WhatsApp Us</a>
                            <a href={BRAND.instagram} target="_blank" rel="noopener noreferrer" style={footerLink}>Instagram</a>

                            {/* Social icons */}
                            <div style={{ display: 'flex', gap: '14px', marginTop: '18px' }}>
                                <a href={BRAND.instagram} target="_blank" rel="noopener noreferrer" aria-label="Naliban Farms on Instagram"
                                    style={{ color: 'rgba(247,244,236,0.75)', display: 'inline-flex' }}>
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                                    </svg>
                                </a>
                                <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" aria-label="Chat with Naliban Farms on WhatsApp"
                                    style={{ color: 'rgba(247,244,236,0.75)', display: 'inline-flex' }}>
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
                                    </svg>
                                </a>
                                <a href={`mailto:${BRAND.supportEmail}`} aria-label="Email Naliban Farms"
                                    style={{ color: 'rgba(247,244,236,0.75)', display: 'inline-flex' }}>
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <rect x="2" y="4" width="20" height="16" rx="2" />
                                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>

                    <div style={{
                        maxWidth: '1200px',
                        margin: '0 auto',
                        padding: '26px 0 110px',
                        borderTop: '1px solid rgba(247, 244, 236, 0.12)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '10px',
                        fontSize: '0.78rem',
                        color: 'rgba(247, 244, 236, 0.45)'
                    }}>
                        <span>&copy; 2026 Naliban Farms &middot; Made in Himachal Pradesh 🇮🇳</span>
                        <span>Grown at 2,300m &middot; Shipped across India</span>
                    </div>
                </footer>
            </main>
        </SmoothScroll>
    );
};

export default Home;
