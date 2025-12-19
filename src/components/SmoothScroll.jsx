"use client";
import { useEffect } from 'react';
import Lenis from '@studio-freight/lenis';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

export default function SmoothScroll({ children }) {
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

        // 4. Disable GSAP's native lag smoothing
        gsap.ticker.lagSmoothing(0);

        return () => {
            // Cleanup
            gsap.ticker.remove(lenis.raf);
            lenis.destroy();
        };
    }, []);

    return <div id="smooth-wrapper">{children}</div>;
}
