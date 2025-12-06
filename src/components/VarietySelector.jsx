import React from 'react';
import './VarietySelector.css';

const VarietySelector = ({ varieties, selectedVarietyId, onSelect }) => {
    if (!varieties || varieties.length === 0) return null;

    return (
        <div className="variety-selector">
            <h3>Select Variety</h3>
            <div className="variety-grid">
                {varieties.map((variety) => (
                    <div
                        key={variety.id}
                        className={`variety-card glass ${selectedVarietyId === variety.id ? 'selected' : ''}`}
                        onClick={() => onSelect(variety)}
                    >
                        <div className="variety-name">{variety.name}</div>
                        <div className="variety-price">₹{variety.price_per_kg}/kg</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default VarietySelector;
