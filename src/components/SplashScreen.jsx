import React, { useEffect, useRef, useState } from 'react';
import './SplashScreen.css';

/**
 * App-open splash: "Naliban Farms" types itself out at the centre of a
 * deep-forest screen, holds a beat, then fades into the site.
 *
 * Typing engine ported from Kokonut UI's Typewriter (MIT, kokonutui.com),
 * trimmed to a single non-looping sequence and rebuilt without the
 * motion dependency — CSS keyframes handle the cursor blink and fade.
 *
 * Shows once per browser session, so launching the site feels like
 * opening an app while refreshes and in-site navigation stay instant.
 */

const BRAND_TEXT = 'Naliban Farms';
const TYPING_SPEED = 55;
const START_DELAY = 350;
const HOLD_AFTER_TYPED = 650;
const FADE_MS = 650;
const SPLASH_KEY = 'splash_shown';

// Natural human rhythm from the kokonut original: occasional hesitation,
// occasional burst, otherwise +/- 40% around the base speed.
const getTypingDelay = () => {
    const random = Math.random();
    if (random < 0.1) return TYPING_SPEED * 2;
    if (random > 0.9) return TYPING_SPEED * 0.5;
    const variance = 0.4;
    const min = TYPING_SPEED * (1 - variance);
    const max = TYPING_SPEED * (1 + variance);
    return Math.random() * (max - min) + min;
};

const SplashScreen = () => {
    const [show, setShow] = useState(() => !sessionStorage.getItem(SPLASH_KEY));
    const [fading, setFading] = useState(false);
    const [displayText, setDisplayText] = useState('');
    const timeoutRef = useRef(null);

    useEffect(() => {
        if (!show) return undefined;
        sessionStorage.setItem(SPLASH_KEY, 'true');

        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        const beginFade = () => {
            setFading(true);
            timeoutRef.current = setTimeout(() => setShow(false), FADE_MS);
        };

        if (reduceMotion) {
            // No typing animation — show the full name, hold, fade.
            setDisplayText(BRAND_TEXT);
            timeoutRef.current = setTimeout(beginFade, 900);
            return () => clearTimeout(timeoutRef.current);
        }

        let charIndex = 0;
        const type = () => {
            if (charIndex < BRAND_TEXT.length) {
                charIndex += 1;
                setDisplayText(BRAND_TEXT.slice(0, charIndex));
                timeoutRef.current = setTimeout(type, getTypingDelay());
            } else {
                timeoutRef.current = setTimeout(beginFade, HOLD_AFTER_TYPED);
            }
        };

        timeoutRef.current = setTimeout(type, START_DELAY);
        return () => clearTimeout(timeoutRef.current);
    }, [show]);

    if (!show) return null;

    return (
        <div className={`splash-screen ${fading ? 'fading' : ''}`} aria-hidden="true">
            <div className="splash-inner">
                <span className="splash-text">{displayText}</span>
                <span className="splash-cursor" />
            </div>
            <span className="splash-tagline">Jubbal-Kotkhai · Himachal Pradesh</span>
        </div>
    );
};

export default SplashScreen;
