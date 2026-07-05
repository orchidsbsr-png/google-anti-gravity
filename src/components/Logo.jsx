import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Farm Fresh brand mark — an apple holding a Himalayan peak,
 * ringed like an orchard seal. Draws in currentColor so it adapts
 * to light/dark surfaces.
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
        {/* Apple body */}
        <path
            d="M32 23.5 C27.5 17.5 17 20.5 17 31 C17 41 25 49 32 49 C39 49 47 41 47 31 C47 20.5 36.5 17.5 32 23.5 Z"
            strokeWidth="1.8"
        />
        {/* Stem */}
        <path d="M32 22.5 C32 18.5 33.5 16 36 14.5" strokeWidth="1.8" />
        {/* Leaf */}
        <path d="M36 14.5 C40.5 12 44.5 14 44.5 17.5 C41 20 36.5 18.5 36 14.5 Z" strokeWidth="1.6" />
        {/* Himalayan ridge inside the apple */}
        <path d="M20.5 40 L27 31.5 L31 36 L36.5 28.5 L43.5 40" strokeWidth="1.6" />
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
                            fontSize: size * 0.5,
                            letterSpacing: '-0.01em',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        Farm Fresh
                    </span>
                    <span
                        style={{
                            display: 'block',
                            fontFamily: "'Inter', sans-serif",
                            fontWeight: 600,
                            fontSize: Math.max(size * 0.17, 8),
                            letterSpacing: '0.42em',
                            textTransform: 'uppercase',
                            opacity: 0.66,
                            marginTop: '6px',
                        }}
                    >
                        Shimla
                    </span>
                </span>
            )}
        </span>
    );

    return to ? (
        <Link to={to} style={{ color: 'inherit', textDecoration: 'none' }} aria-label="Farm Fresh — home">
            {content}
        </Link>
    ) : content;
};

export default Logo;
