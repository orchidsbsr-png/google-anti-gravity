import React from 'react';
import { Link } from 'react-router-dom';
import './LiquidButton.css';

/**
 * Liquid-glass CTA button.
 * Ported from Kokonut UI's LiquidButton (MIT, kokonutui.com) into this
 * project's plain-CSS system: an SVG turbulence + displacement filter
 * warps whatever sits behind the button (via backdrop-filter), layered
 * inset shadows draw the glass rim, and a brand tint keeps the label
 * readable. Chromium gets the full refraction; Safari/Firefox fall back
 * to a plain frosted blur.
 *
 * Renders a <Link> when `to` is set, an <a> when `href` is set,
 * otherwise a <button>.
 */

const GlassFilter = ({ id }) => (
    <svg aria-hidden="true" className="liquid-btn-defs" focusable="false">
        <defs>
            <filter id={id} x="-50%" y="-50%" width="200%" height="200%" colorInterpolationFilters="sRGB">
                <feTurbulence type="fractalNoise" baseFrequency="0.05 0.05" numOctaves="1" seed="1" result="turbulence" />
                <feGaussianBlur in="turbulence" stdDeviation="2" result="blurredNoise" />
                <feDisplacementMap in="SourceGraphic" in2="blurredNoise" scale="70" xChannelSelector="R" yChannelSelector="B" result="displaced" />
                <feGaussianBlur in="displaced" stdDeviation="4" result="finalBlur" />
                <feComposite in="finalBlur" in2="finalBlur" operator="over" />
            </filter>
        </defs>
    </svg>
);

const LiquidButton = ({ to, href, tint = 'terracotta', className = '', children, ...props }) => {
    const filterId = React.useId().replace(/[^a-zA-Z0-9_-]/g, '');
    const cls = `liquid-btn liquid-btn--${tint} ${className}`.trim();

    const inner = (
        <>
            <span className="liquid-btn-refract" style={{ backdropFilter: `url("#${filterId}")` }} aria-hidden="true" />
            <span className="liquid-btn-rim" aria-hidden="true" />
            <span className="liquid-btn-label">{children}</span>
        </>
    );

    let el;
    if (to) {
        el = <Link to={to} className={cls} {...props}>{inner}</Link>;
    } else if (href) {
        el = <a href={href} className={cls} {...props}>{inner}</a>;
    } else {
        el = <button type="button" className={cls} {...props}>{inner}</button>;
    }

    return (
        <>
            {el}
            <GlassFilter id={filterId} />
        </>
    );
};

export default LiquidButton;
