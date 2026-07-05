"use client";
import { useEffect, useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { nowPickingByMonth, HARVEST_SEASONS } from '../data/seasons';
import './OrchardTicker.css';

// Jubbal-Kotkhai, above Hatkoti
const ORCHARD_LAT = 31.11;
const ORCHARD_LON = 77.67;

export default function OrchardTicker() {
    const { settings } = useInventory();
    const [tempC, setTempC] = useState(null);

    useEffect(() => {
        let cancelled = false;
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${ORCHARD_LAT}&longitude=${ORCHARD_LON}&current=temperature_2m`)
            .then(r => r.json())
            .then(data => {
                if (!cancelled && data?.current?.temperature_2m !== undefined) {
                    setTempC(Math.round(data.current.temperature_2m));
                }
            })
            .catch(() => { /* weather is decorative — fail silently */ });
        return () => { cancelled = true; };
    }, []);

    const month = new Date().getMonth() + 1;
    const picking = settings?.now_picking || nowPickingByMonth(month).join(' · ');
    const upcoming = HARVEST_SEASONS.find(s => s.start > month);

    const items = [
        tempC !== null && `${tempC}°C in the orchard right now`,
        picking && `Now picking — ${picking}`,
        upcoming && `${upcoming.fruit} return in ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'][upcoming.start - 1]}`,
        'Four generations · father to son · Jubbal-Kotkhai',
        'Hand-picked after you order',
    ].filter(Boolean);

    // Duplicate so the -50% translate loops seamlessly
    const loop = [...items, ...items];

    return (
        <div className="orchard-ticker" aria-label="Live from the orchard">
            <div className="ticker-track">
                {loop.map((text, i) => (
                    <span key={i} className="ticker-item">
                        {text}
                        <span className="ticker-sep" aria-hidden="true">&#10045;</span>
                    </span>
                ))}
            </div>
        </div>
    );
}
