"use client";
import { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import './ComingSoon.css';

// Dedicated pages for upcoming shop categories. Each lives at
// /shop/:category with its own breadcrumb trail, hero, and cards.
const CATEGORIES = {
    dehydrated: {
        crumb: 'Dehydrated Fruits',
        eyebrow: 'The Drying Room',
        title: <>Orchard fruit, <em>slow-dried.</em></>,
        sub: 'Peak-season fruit preserved with nothing but time and warm air — no sugar, no sulphur, nothing added. Being perfected in small batches at the farm.',
        items: [
            { icon: '🍎', title: 'Dehydrated Apples', note: 'Slow-dried orchard slices — nothing added, nothing taken away.' },
            { icon: '🟣', title: 'Dehydrated Plums', note: 'Deep, jammy sweetness concentrated into every chewy piece.' },
            { icon: '🟠', title: 'Dehydrated Apricots', note: 'Sun-coloured halves with that wild mountain tang.' },
            { icon: '🎁', title: 'Mixed Dry Fruit Packs', note: 'The best of the drying room, boxed for gifting and snacking.' },
            { icon: '🍬', title: 'Fruit Leather', note: 'Pure pressed fruit, rolled thin. The orchard’s answer to candy.' },
            { icon: '❄️', title: 'Freeze-Dried Fruits', note: 'Crisp, featherlight fruit with flavour locked in. A little further out.' }
        ]
    },
    jams: {
        crumb: 'Fruit Jams',
        eyebrow: 'The Preserving Kitchen',
        title: <>Small-batch <em>jams.</em></>,
        sub: 'Copper-pot jams made from the same fruit we ship fresh — picked ripe, preserved the same week. First jars are on their way.',
        items: [
            { icon: '🫙', title: 'Apricot Jam', note: 'Wild-apricot brightness from Chullu country, in a jar.' },
            { icon: '🫐', title: 'Plum Jam', note: 'Dark, glossy, and tart — plums at their most luxurious.' },
            { icon: '🍑', title: 'Peach Preserve', note: 'Soft-set peaches in their own syrup. A summer keeper.' }
        ]
    },
    chutneys: {
        crumb: 'Fruit Chutneys',
        eyebrow: 'The Preserving Kitchen',
        title: <>Himachali <em>chutneys.</em></>,
        sub: 'Traditional valley recipes — fruit, spice, and patience. Made the way the mountains have always made them.',
        items: [
            { icon: '🌶️', title: 'Plum Chutney', note: 'Sweet-sour and gently spiced — the valley classic.' },
            { icon: '🟠', title: 'Apricot Chutney', note: 'Chullu apricots with mountain spices. Bold and bright.' },
            { icon: '🌱', title: 'Seasonal Chutney', note: 'Whatever the harvest offers — announced here first.' }
        ]
    }
};

export default function ShopCategory() {
    const { category } = useParams();
    const config = CATEGORIES[category];

    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle');

    useEffect(() => { window.scrollTo(0, 0); }, [category]);

    if (!config) return <Navigate to="/coming-soon" replace />;

    const subscribe = async (e) => {
        e.preventDefault();
        const clean = email.trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
            setStatus('error');
            return;
        }
        setStatus('busy');
        try {
            const res = await fetch('/api/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: clean, source: `category-${category}` })
            });
            setStatus(res.ok ? 'done' : 'error');
        } catch {
            setStatus('error');
        }
    };

    return (
        <main className="cs-page">
            <header className="cs-hero">
                <p className="cs-eyebrow">{config.eyebrow}</p>
                <h1 className="cs-title">{config.title}</h1>
                <p className="cs-sub">{config.sub}</p>
            </header>

            <section className="cs-section">
                <div className="cs-grid">
                    {config.items.map(item => (
                        <article className="cs-card" key={item.title}>
                            <span className="cs-badge">Coming Soon</span>
                            <span className="cs-icon" aria-hidden="true">{item.icon}</span>
                            <h3 className="cs-card-title">{item.title}</h3>
                            <p className="cs-card-note">{item.note}</p>
                        </article>
                    ))}
                </div>
            </section>

            <section className="cs-signup">
                <h2 className="cs-signup-title">Hear it <em>first.</em></h2>
                <p className="cs-signup-sub">
                    One email when {config.crumb.toLowerCase()} go live. No noise, ever.
                </p>
                {status === 'done' ? (
                    <p className="cs-signup-done">🌿 You’re on the list — we’ll write when it’s ready.</p>
                ) : (
                    <form className="cs-form" onSubmit={subscribe}>
                        <input
                            type="email"
                            required
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); if (status === 'error') setStatus('idle'); }}
                            aria-label="Email address"
                        />
                        <button type="submit" className="btn-terracotta" disabled={status === 'busy'}>
                            {status === 'busy' ? 'Joining…' : 'Notify Me'}
                        </button>
                    </form>
                )}
                {status === 'error' && (
                    <p className="cs-signup-error">That didn’t go through — check the address and try again.</p>
                )}
            </section>
        </main>
    );
}
