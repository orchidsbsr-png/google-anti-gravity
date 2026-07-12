"use client";
import { useState } from 'react';
import { Link } from 'react-router-dom';
import './ComingSoon.css';

const dryingRoom = [
    {
        icon: '🍎',
        title: 'Dehydrated Apples',
        note: 'Slow-dried orchard slices — nothing added, nothing taken away.'
    },
    {
        icon: '🟣',
        title: 'Dehydrated Plums',
        note: 'Deep, jammy sweetness concentrated into every chewy piece.'
    },
    {
        icon: '🟠',
        title: 'Dehydrated Apricots',
        note: 'Sun-coloured halves with that wild mountain tang.'
    },
    {
        icon: '🎁',
        title: 'Mixed Dry Fruit Packs',
        note: 'The best of the drying room, boxed for gifting and snacking.'
    },
    {
        icon: '🍬',
        title: 'Fruit Leather',
        note: 'Pure pressed fruit, rolled thin. The orchard’s answer to candy.'
    },
    {
        icon: '❄️',
        title: 'Freeze-Dried Fruits',
        note: 'Crisp, featherlight fruit with flavour locked in. A little further out.'
    }
];

const preservingKitchen = [
    {
        icon: '🫙',
        title: 'Apricot Jam',
        note: 'Small-batch, copper-pot apricot jam from Chullu country.'
    },
    {
        icon: '🫐',
        title: 'Plum Jam',
        note: 'Dark, glossy, and tart — plums at their most luxurious.'
    },
    {
        icon: '🌶️',
        title: 'Fruit Chutneys',
        note: 'Traditional Himachali chutneys, made the way the valley makes them.'
    },
    {
        icon: '🌱',
        title: 'Seasonal Produce',
        note: 'Whatever the mountain offers next — announced here first.'
    }
];

export default function ComingSoon() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle'); // idle | busy | done | error

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
                body: JSON.stringify({ email: clean, source: 'coming-soon' })
            });
            setStatus(res.ok ? 'done' : 'error');
        } catch {
            setStatus('error');
        }
    };

    const Card = ({ item }) => (
        <article className="cs-card">
            <span className="cs-badge">Coming Soon</span>
            <span className="cs-icon" aria-hidden="true">{item.icon}</span>
            <h3 className="cs-card-title">{item.title}</h3>
            <p className="cs-card-note">{item.note}</p>
        </article>
    );

    return (
        <main className="cs-page">
            {/* Hero */}
            <header className="cs-hero">
                <p className="cs-eyebrow">The Next Harvest of Ideas</p>
                <h1 className="cs-title">
                    Good things are <em>drying, preserving,</em> and on their way.
                </h1>
                <p className="cs-sub">
                    We preserve the orchard’s peak season so you can taste it all
                    year. Everything below is being perfected in small batches at
                    the farm — join the list and you’ll hear the moment each one
                    is ready.
                </p>
            </header>

            {/* The Drying Room */}
            <section className="cs-section">
                <p className="cs-section-eyebrow">01 · The Drying Room</p>
                <h2 className="cs-section-title">
                    <Link to="/shop/dehydrated" style={{ color: 'inherit', textDecoration: 'none' }}>
                        Dehydrated <em>fruit.</em> <span style={{ fontSize: '0.5em', verticalAlign: 'middle' }}>→</span>
                    </Link>
                </h2>
                <div className="cs-grid">
                    {dryingRoom.map(item => <Card key={item.title} item={item} />)}
                </div>
            </section>

            {/* The Preserving Kitchen */}
            <section className="cs-section">
                <p className="cs-section-eyebrow">02 · The Preserving Kitchen</p>
                <h2 className="cs-section-title">
                    <Link to="/shop/jams" style={{ color: 'inherit', textDecoration: 'none' }}>Jams</Link>
                    {' & '}
                    <Link to="/shop/chutneys" style={{ color: 'inherit', textDecoration: 'none' }}><em>chutneys.</em></Link>
                    {' '}<span style={{ fontSize: '0.5em', verticalAlign: 'middle' }}>→</span>
                </h2>
                <div className="cs-grid">
                    {preservingKitchen.map(item => <Card key={item.title} item={item} />)}
                </div>
            </section>

            {/* Newsletter */}
            <section className="cs-signup">
                <h2 className="cs-signup-title">Be first at the <em>orchard gate.</em></h2>
                <p className="cs-signup-sub">
                    One email when a new product launches. No noise, ever.
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
