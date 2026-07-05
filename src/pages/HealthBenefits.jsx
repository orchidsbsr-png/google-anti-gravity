import React from 'react';
import { Link } from 'react-router-dom';
import { healthBenefits } from '../data/healthBenefits';
import './HealthBenefits.css';

const HealthBenefits = () => {
    return (
        <div className="benefits-page">
            <header className="benefits-header">
                <p className="benefits-eyebrow">Nature&rsquo;s Pharmacy</p>
                <h1 className="benefits-title">
                    Why fruit, <em>every day.</em>
                </h1>
                <p className="benefits-sub">
                    Grown slowly at altitude, without chemicals &mdash; every fruit from
                    our orchard carries the mountain&rsquo;s medicine with it.
                </p>
            </header>

            <div className="benefits-list">
                {healthBenefits.map((item, index) => (
                    <article key={item.id} className="benefit-card">
                        <div className="benefit-visual">
                            <img src={item.image} alt={item.fruit} loading="lazy" />
                        </div>
                        <div className="benefit-content">
                            <span className="benefit-index">{String(index + 1).padStart(2, '0')}</span>
                            <h3>{item.fruit}</h3>
                            <p className="benefit-line">{item.line}</p>
                            <p className="benefit-text">{item.benefits}</p>
                            <div className="nutrient-chips">
                                {item.nutrients.map(n => (
                                    <span key={n} className="nutrient-chip">{n}</span>
                                ))}
                            </div>
                            <Link to={`/search?query=${item.fruit}`} className="benefit-shop-link">
                                Shop {item.fruit} &rarr;
                            </Link>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
};

export default HealthBenefits;
