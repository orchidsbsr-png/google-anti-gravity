"use client";
import React from 'react';
import SmoothScroll from '../components/SmoothScroll';
import Hero from '../components/Hero';
import Origin from '../components/Origin';
import ProductShowcase from '../components/ProductShowcase';
import Reviews from '../components/Reviews';
import Process from '../components/Process';
import OrchardTicker from '../components/OrchardTicker';
import Logo from '../components/Logo';
import { Link } from 'react-router-dom';
import { whatsappLink } from '../config/brand';
import { useLanguage } from '../context/LanguageContext';

const footerLink = {
    color: 'rgba(247, 244, 236, 0.65)',
    textDecoration: 'none',
    fontSize: '0.85rem',
    lineHeight: 2.1,
    display: 'block',
    transition: 'color 0.25s ease'
};

const Home = () => {
    const { t } = useLanguage();
    return (
        <SmoothScroll>
            <main style={{ backgroundColor: '#F7F4EC' }}>
                <Hero />
                <OrchardTicker />
                <Origin />
                <ProductShowcase />
                <Reviews />
                <Process />

                {/* Harvest Club */}
                <section style={{
                    padding: 'clamp(80px, 9vw, 140px) 6vw',
                    backgroundColor: '#F7F4EC',
                    textAlign: 'center'
                }}>
                    <p style={{
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.35em',
                        color: '#C9A227',
                        marginBottom: '20px'
                    }}>
                        {t('club.eyebrow')}
                    </p>
                    <h2 style={{
                        fontFamily: "'Fraunces', Georgia, serif",
                        fontSize: 'clamp(2.4rem, 4.8vw, 4rem)',
                        fontWeight: 400,
                        lineHeight: 1.08,
                        color: 'var(--gold-deep, #A5821B)',
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
                </section>

                {/* Adopt a Tree CTA */}
                <section style={{
                    padding: 'clamp(90px, 10vw, 160px) 6vw',
                    backgroundColor: '#E9ECD3',
                    color: '#1C2313',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{
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
                                color: 'var(--gold-deep, #A5821B)',
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
                            color: 'var(--gold-bright, #E3C568)',
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
                                <Logo variant="full" size={50} />
                            </div>
                            <p style={{ fontSize: '0.85rem', lineHeight: 1.8, opacity: 0.6, fontWeight: 300, maxWidth: '260px' }}>
                                A four-generation family orchard in the Jubbal-Kotkhai
                                valley, above Hatkoti — growing fruit the slow way,
                                father to son.
                            </p>
                        </div>
                        <div>
                            <p style={{
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                letterSpacing: '0.28em',
                                textTransform: 'uppercase',
                                color: '#C9A227',
                                marginBottom: '16px'
                            }}>{t('footer.explore')}</p>
                            <Link to="/search" style={footerLink}>Shop the Harvest</Link>
                            <Link to="/adopt-a-tree" style={footerLink}>Adopt a Tree</Link>
                            <Link to="/recipes" style={footerLink}>The Kitchen</Link>
                            <Link to="/health-benefits" style={footerLink}>Health Benefits</Link>
                        </div>
                        <div>
                            <p style={{
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                letterSpacing: '0.28em',
                                textTransform: 'uppercase',
                                color: '#C9A227',
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
                                color: '#C9A227',
                                marginBottom: '16px'
                            }}>{t('footer.legal')}</p>
                            <Link to="/legal" style={footerLink}>Terms of Service</Link>
                            <Link to="/legal" style={footerLink}>Privacy Policy</Link>
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
                        <span>&copy; 2026 Naliban Farms &middot; Shimla.</span>
                        <span>Grown at 2,300m &middot; Shipped across India</span>
                    </div>
                </footer>
            </main>
        </SmoothScroll>
    );
};

export default Home;
