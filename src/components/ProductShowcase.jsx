"use client";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProductShowcase.css';

const products = [
    { name: 'Apples', video: '/videos/apples.mp4' },
    { name: 'Persimmons', video: '/videos/orange-persimmons.mp4' },
    { name: 'Fuzzy Kiwis', video: '/videos/fuzzy-kiwis.mp4' },
    { name: 'Plums', video: '/videos/plums.mp4' },
    { name: 'Pears', video: '/videos/pears.mp4' },
    { name: 'Cherries', video: '/videos/cherries.mp4' }
];

const SLIDE_MS = 5000;

export default function ProductShowcase() {
    const navigate = useNavigate();
    const [active, setActive] = useState(0);

    // Auto-rotate; selecting a fruit restarts the clock
    useEffect(() => {
        const timer = setInterval(() => {
            setActive(a => (a + 1) % products.length);
        }, SLIDE_MS);
        return () => clearInterval(timer);
    }, [active]);

    return (
        <section className="showcase-v3">
            {/* Crossfading video layers */}
            {products.map((product, i) => (
                <video
                    key={product.name}
                    src={product.video}
                    className={`stage-video ${active === i ? 'active' : ''}`}
                    autoPlay
                    loop
                    muted
                    playsInline
                />
            ))}
            <div className="stage-scrim" />

            {/* Head */}
            <div className="stage-head">
                <span className="stage-eyebrow">The Orchard</span>
                <span className="stage-counter">
                    {String(active + 1).padStart(2, '0')} / {String(products.length).padStart(2, '0')}
                </span>
            </div>

            {/* Centered name — re-keyed so it fades anew on every change */}
            <div
                className="stage-center"
                onClick={() => navigate(`/search?query=${products[active].name}`)}
            >
                <h3 key={active} className="stage-title">
                    {products[active].name}
                </h3>
                <span key={`cta-${active}`} className="stage-cta">
                    Shop {products[active].name} &rarr;
                </span>
            </div>

            {/* Fruit selector */}
            <div className="stage-menu">
                {products.map((product, i) => (
                    <button
                        key={product.name}
                        className={`stage-menu-item ${active === i ? 'active' : ''}`}
                        onClick={() => setActive(i)}
                    >
                        {product.name}
                        {active === i && (
                            <span className="stage-progress" style={{ animationDuration: `${SLIDE_MS}ms` }} />
                        )}
                    </button>
                ))}
            </div>
        </section>
    );
}
