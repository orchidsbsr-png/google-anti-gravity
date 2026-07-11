import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Naliban Farms brand mark — a sun rising over a twin-peak Himalayan
 * ridge, above three terraced orchard contours, ringed like an estate
 * seal. Draws in currentColor so it adapts to light/dark surfaces.
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
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        {/* Seal ring */}
        <circle cx="32" cy="32" r="30" strokeWidth="1.2" opacity="0.55" />
        {/* Rising sun */}
        <circle cx="43" cy="17.5" r="4.2" strokeWidth="1.7" />
        {/* Himalayan ridge */}
        <path d="M13.5 38 L23.5 24 L29.5 31 L36.5 21 L50.5 38" strokeWidth="1.8" />
        {/* Orchard terraces (valley contours) */}
        <path d="M16 44 Q32 40.5 48 44" strokeWidth="1.5" />
        <path d="M19 49.5 Q32 46.5 45 49.5" strokeWidth="1.5" />
        <path d="M23.5 55 Q32 52.8 40.5 55" strokeWidth="1.5" />
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
