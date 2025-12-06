import React from 'react';
import { healthBenefits } from '../data/healthBenefits';
import './HealthBenefits.css';

const HealthBenefits = () => {
    return (
        <div className="benefits-page">
            <div className="page-header glass-strong">
                <h1>Health Benefits</h1>
                <p>Why you should eat more fruits</p>
            </div>

            <div className="benefits-list">
                {healthBenefits.map(item => (
                    <div key={item.id} className="benefit-card glass">
                        <div className="benefit-icon">{item.icon}</div>
                        <div className="benefit-content">
                            <h3>{item.fruit}</h3>
                            <p>{item.benefits}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HealthBenefits;
