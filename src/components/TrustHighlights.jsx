"use client";
import './TrustHighlights.css';

const highlights = [
    {
        icon: '🌿',
        title: 'Naturally Grown',
        body: 'No unnecessary chemical dependence. Healthy soil, healthy fruit.'
    },
    {
        icon: '🏔️',
        title: 'Grown at 2,300m',
        body: 'Cool Himalayan climate. Slow ripening. Exceptional sweetness.'
    },
    {
        icon: '🍎',
        title: '50+ Years of Orchard Heritage',
        body: 'Decades of experience growing premium mountain fruit.'
    },
    {
        icon: '🚜',
        title: 'Direct From Farmers',
        body: 'Fruit comes straight from our orchards and trusted local growers.'
    },
    {
        icon: '📦',
        title: 'Harvested After Your Order',
        body: 'Picked only when purchased — never from cold storage.'
    },
    {
        icon: '🚚',
        title: 'Pan-India Delivery',
        body: 'Farm → packing → your doorstep. No wholesale chain in between.'
    }
];

export default function TrustHighlights() {
    return (
        <section className="trust-section">
            <p className="trust-eyebrow">The Naliban Promise</p>
            <h2 className="trust-heading">
                Why fruit from here <em>tastes different.</em>
            </h2>
            <div className="trust-grid">
                {highlights.map((h) => (
                    <article className="trust-card" key={h.title}>
                        <span className="trust-icon" aria-hidden="true">{h.icon}</span>
                        <h3 className="trust-title">{h.title}</h3>
                        <p className="trust-body">{h.body}</p>
                    </article>
                ))}
            </div>
        </section>
    );
}
