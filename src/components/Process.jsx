"use client";
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const steps = [
    { title: 'Harvest', desc: 'Hand-picked at peak ripeness.' },
    { title: 'Clean', desc: 'Washed with clean water.' },
    { title: 'Packaging', desc: 'Eco-friendly materials.' },
    { title: 'Ship', desc: 'Fast, temperature-controlled delivery.' },
    { title: 'Doorstep', desc: 'Direct to your home.' }
];

export default function Process() {
    const sectionRef = useRef(null);
    const pathRef = useRef(null);
    const containerRef = useRef(null);
    const stepsRef = useRef([]);

    useEffect(() => {
        const updatePath = () => {
            if (!stepsRef.current[0] || !stepsRef.current[steps.length - 1] || !containerRef.current) return;

            const containerRect = containerRef.current.getBoundingClientRect();
            const firstRect = stepsRef.current[0].getBoundingClientRect();
            const lastRect = stepsRef.current[steps.length - 1].getBoundingClientRect();

            // Calculate start and end points relative to the SVG container
            // Start at the vertical center of the first item
            const startY = firstRect.top - containerRect.top + (firstRect.height / 2);
            // End at the vertical center of the last item
            const endY = lastRect.top - containerRect.top + (lastRect.height / 2);

            // X center is 50% of container (100px since width is 200px)
            const x = 100;

            const pathString = `M ${x} ${startY} V ${endY}`;

            // Update both background and foreground paths
            const paths = containerRef.current.querySelectorAll('path');
            paths.forEach(p => p.setAttribute('d', pathString));

            // Update bead position to start
            gsap.set("#slider-bead", { x: x, y: startY });

            return { startY, endY };
        };

        // Initial update
        const coords = updatePath();

        // Recalculate on resize
        window.addEventListener('resize', updatePath);

        // GSAP Animation
        const path = pathRef.current;
        const pathLength = path.getTotalLength();

        // Initial state: path hidden (offset = length)
        gsap.set(path, { strokeDasharray: pathLength, strokeDashoffset: pathLength });

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: sectionRef.current,
                start: "top center",
                end: "bottom center",
                scrub: 1,
            }
        });

        // Animate line
        tl.to(path, {
            strokeDashoffset: 0,
            ease: "none"
        });

        // Animate bead along the path
        if (coords) {
            tl.to("#slider-bead", {
                y: coords.endY,
                ease: "none"
            }, "<");
        }

        return () => window.removeEventListener('resize', updatePath);

    }, []);

    return (
        <section ref={sectionRef} style={{
            padding: '10vw 0',
            backgroundColor: '#f5f5f0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative'
        }}>
            <h2 style={{ fontSize: '4rem', color: '#2d3319', marginBottom: '5vh' }}>The Journey</h2>

            <div ref={containerRef} style={{ position: 'relative', width: '100%', maxWidth: '800px', paddingBottom: '50px' }}>
                {/* SVG Path Container */}
                <svg style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: 0, height: '100%', width: '200px', zIndex: 0, pointerEvents: 'none', overflow: 'visible' }}>
                    <path
                        d=""
                        stroke="#2d3319"
                        strokeWidth="2"
                        fill="none"
                        opacity="0.2"
                    />
                    <path
                        ref={pathRef}
                        d=""
                        stroke="#2d3319"
                        strokeWidth="4" // Slightly thicker for the active line
                        fill="none"
                    />
                    <circle
                        id="slider-bead"
                        r="6"
                        fill="#2d3319"
                        stroke="#f5f5f0"
                        strokeWidth="2"
                    />
                </svg>

                {steps.map((step, index) => (
                    <div
                        key={index}
                        ref={el => stepsRef.current[index] = el}
                        style={{
                            display: 'flex',
                            justifyContent: index % 2 === 0 ? 'flex-start' : 'flex-end',
                            marginBottom: index === steps.length - 1 ? '0' : '80px', // Reduced spacing
                            width: '100%',
                            position: 'relative',
                            zIndex: 1
                        }}>
                        <div style={{
                            width: '40%',
                            backgroundColor: '#fff',
                            padding: '2rem',
                            borderRadius: '15px',
                            border: '1px solid #e0e0d6',
                            textAlign: index % 2 === 0 ? 'left' : 'right',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
                        }}>
                            <span style={{ fontSize: '1rem', color: '#2d3319', fontWeight: 'bold', opacity: 0.5 }}>{`0${index + 1}`}</span>
                            <h4 style={{ fontSize: '2rem', color: '#2d3319', margin: '10px 0' }}>{step.title}</h4>
                            <p style={{ color: '#5c6044', lineHeight: '1.4' }}>{step.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
