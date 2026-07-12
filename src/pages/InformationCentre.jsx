"use client";
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ARTICLES, ARTICLE_CATEGORIES, FAQS } from '../data/articles';
import './InformationCentre.css';

export default function InformationCentre() {
    const [category, setCategory] = useState('All');
    const [openFaq, setOpenFaq] = useState(null);
    const location = useLocation();

    // Nav links arrive as /information-centre#faqs — scroll to the section.
    useEffect(() => {
        if (location.hash) {
            document.querySelector(location.hash)?.scrollIntoView({ behavior: 'smooth' });
        } else {
            window.scrollTo(0, 0);
        }
    }, [location]);

    const shown = category === 'All'
        ? ARTICLES
        : ARTICLES.filter(a => a.category === category);

    return (
        <main className="info-page">
            {/* Hero */}
            <header className="info-hero">
                <p className="info-eyebrow">The Information Centre</p>
                <h1 className="info-title">
                    Everything worth knowing, <em>from the orchard.</em>
                </h1>
                <p className="info-sub">
                    How we farm, how we pack, why mountain fruit tastes the way it
                    does — written at the farm, not in a marketing office.
                </p>
            </header>

            {/* Category filter */}
            <div className="info-filter" role="tablist" aria-label="Article categories">
                {ARTICLE_CATEGORIES.map(c => (
                    <button
                        key={c}
                        role="tab"
                        aria-selected={category === c}
                        className={`info-chip ${category === c ? 'active' : ''}`}
                        onClick={() => setCategory(c)}
                    >
                        {c}
                    </button>
                ))}
            </div>

            {/* Article cards */}
            <section className="info-grid" id="articles">
                {shown.map(a => (
                    <Link to={`/information-centre/${a.slug}`} className="info-card" key={a.slug}>
                        <span className="info-card-icon" aria-hidden="true">{a.icon}</span>
                        <p className="info-card-cat">{a.category} · {a.readMinutes} min read</p>
                        <h2 className="info-card-title">{a.title}</h2>
                        <p className="info-card-excerpt">{a.excerpt}</p>
                        <span className="info-card-cta">Read the story &rarr;</span>
                    </Link>
                ))}
            </section>

            {/* Coming media sections */}
            <section className="info-media">
                <div className="info-media-card">
                    <span className="cs-badge">Coming Soon</span>
                    <span className="info-media-icon" aria-hidden="true">🎥</span>
                    <h3>Farm Videos</h3>
                    <p>Real footage from the orchard — grass cutting, pruning, harvest days, and life at 2,300m.</p>
                </div>
                <div className="info-media-card">
                    <span className="cs-badge">Coming Soon</span>
                    <span className="info-media-icon" aria-hidden="true">📷</span>
                    <h3>Photo Gallery</h3>
                    <p>Seasons of Naliban Khatasu in pictures — bloom, harvest, snow, and everything between.</p>
                </div>
            </section>

            {/* FAQs */}
            <section className="info-faqs" id="faqs">
                <p className="info-eyebrow" style={{ textAlign: 'center' }}>Questions, Answered</p>
                <h2 className="info-faq-heading">Frequently asked, <em>honestly answered.</em></h2>
                <div className="info-faq-list">
                    {FAQS.map((f, i) => (
                        <div className={`info-faq ${openFaq === i ? 'open' : ''}`} key={f.q}>
                            <button
                                className="info-faq-q"
                                aria-expanded={openFaq === i}
                                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                            >
                                {f.q}
                                <span className="info-faq-mark" aria-hidden="true">{openFaq === i ? '−' : '+'}</span>
                            </button>
                            {openFaq === i && <p className="info-faq-a">{f.a}</p>}
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
}
