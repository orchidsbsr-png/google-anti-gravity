"use client";
import React, { useEffect, useRef } from 'react';
import Lenis from '@studio-freight/lenis';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

export default function SmoothScroll({ children }) {
    const wrapperRef = useRef(null);

    useEffect(() => {
        // 1. Initialize Lenis
        const lenis = new Lenis({
            duration: 1.2, // Higher = smoother/slower
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            smoothWheel: true,
        });

        // 2. Connect Lenis to GSAP ScrollTrigger
        lenis.on('scroll', ScrollTrigger.update);

        // 3. The Animation Loop
        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });

        // 4. Allow GSAP native lag smoothing (reduces INP blocking)
        gsap.ticker.lagSmoothing(1000, 16);

        // 5. Force specific resizes to fix mobile trapping (where height defaults to 100vh)
        let resizeObserver;
        if (wrapperRef.current) {
            resizeObserver = new ResizeObserver(() => {
                lenis.resize(); // Recalculate anytime content changes height (images loading)
            });
            resizeObserver.observe(wrapperRef.current);
            resizeObserver.observe(document.body);
        }

        // Just in case React suspends late
        const timeout = setTimeout(() => lenis.resize(), 500);

        return () => {
            // Cleanup
            if (resizeObserver) resizeObserver.disconnect();
            clearTimeout(timeout);
            gsap.ticker.remove(lenis.raf);
            lenis.destroy();
        };
    }, []);

    return <div id="smooth-wrapper" ref={wrapperRef}>{children}</div>;
}
