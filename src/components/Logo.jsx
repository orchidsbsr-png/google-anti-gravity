import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Naliban Farms brand mark — an orchard apple tree in full crown, one
 * fruit ripening in the canopy, rooted on a terraced hillside, ringed
 * like an estate seal. Draws in currentColor so it adapts to
 * light/dark surfaces.
 *
 * variant: "mark" (seal only) | "full" (seal + wordmark)
 * to:      optional route — wraps the logo in a Link when set
 */
export const LogoMark = ({ size = 44 }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        aria-hidden="true"
    >
        {/* Seal ring */}
        <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="1.2" opacity="0.55" fill="none" />
        {/* Solid leafy canopy (overlapping lobes merge into one crown) */}
        <g fill="currentColor" stroke="none">
            <circle cx="32" cy="18.5" r="8.2" />
            <circle cx="24" cy="25.5" r="7.3" />
            <circle cx="40" cy="25.5" r="7.3" />
            <circle cx="32" cy="27.5" r="8.8" />
            {/* Trunk with flared roots */}
            <path d="M30.4 34 L30.4 43.5 C30.4 46.8 29.3 49.6 27.4 51.6 C30.4 50.9 33.6 50.9 36.6 51.6 C34.7 49.6 33.6 46.8 33.6 43.5 L33.6 34 Z" />
            {/* Apple hanging from the crown */}
            <circle cx="41.8" cy="39.8" r="2.6" />
        </g>
        {/* Pedicel connecting the apple */}
        <path d="M40.6 32.5 C41.3 34.4 41.7 35.9 41.8 37.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none" />
        {/* Terraced hillside */}
        <g stroke="currentColor" strokeLinecap="round" fill="none">
            <path d="M16.5 52.5 Q32 49 47.5 52.5" strokeWidth="1.6" />
            <path d="M22.5 57.2 Q32 55 41.5 57.2" strokeWidth="1.4" />
        </g>
    </svg>
);

const Logo = ({ variant = 'full', size = 44, to = null, className = '', stacked = false }) => {
    const content = (
        <span
            className={`brand-logo ${className}`}
            style={{
                display: 'inline-flex',
                flexDirection: stacked ? 'column' : 'row',
                alignItems: 'center',
                gap: stacked ? '14px' : '12px',
                color: 'inherit',
                textDecoration: 'none',
            }}
        >
            <LogoMark size={size} />
            {variant === 'full' && (
                <span style={{ textAlign: stacked ? 'center' : 'left', lineHeight: 1 }}>
                    <span
                        style={{
                            display: 'block',
                            fontFamily: "'Fraunces', Georgia, serif",
                            fontWeight: 450,
                            fontSize: size * 0.44,
                            letterSpacing: '-0.01em',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        Naliban Farms
                    </span>
                    <span
                        style={{
                            display: 'block',
                            fontFamily: "'Inter', sans-serif",
                            fontWeight: 600,
                            fontSize: Math.max(size * 0.16, 8),
                            letterSpacing: '0.3em',
                            textTransform: 'uppercase',
                            opacity: 0.66,
                            marginTop: '6px',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        Orchards of Shimla
                    </span>
                </span>
            )}
        </span>
    );

    return to ? (
        <Link to={to} style={{ color: 'inherit', textDecoration: 'none' }} aria-label="Naliban Farms — home">
            {content}
        </Link>
    ) : content;
};

export default Logo;
