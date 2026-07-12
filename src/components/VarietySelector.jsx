import React from 'react';
import { useInventory } from '../context/InventoryContext';
import './VarietySelector.css';

const VarietySelector = ({ varieties, selectedVarietyId, onSelect }) => {
    const { inventory } = useInventory();

    if (!varieties || varieties.length === 0) return null;

    // Live admin-set rate wins over the catalog default
    const perKg = (variety) => {
        const inv = inventory?.find(i => i.variety_id === variety.id);
        return Number(inv?.price_per_kg) > 0 ? Number(inv.price_per_kg) : variety.price_per_kg;
    };

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
                        <div className="variety-price">₹{perKg(variety)}/kg</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default VarietySelector;
