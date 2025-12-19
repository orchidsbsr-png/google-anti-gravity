"use client";
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { useNavigate } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);

const products = [
    { name: 'Apples', video: '/videos/apples.mp4' },
    { name: 'Orange Persimmons', video: '/videos/orange-persimmons.mp4' },
    { name: 'Fuzzy Kiwis', video: '/videos/fuzzy-kiwis.mp4' },
    { name: 'Plums', video: '/videos/plums.mp4' },
    { name: 'Pears', video: '/videos/pears.mp4' },
    { name: 'Cherries', video: '/videos/cherries.mp4' }
];

export default function ProductShowcase() {
    const sectionRef = useRef(null);
    const triggerRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const pin = gsap.fromTo(
            sectionRef.current,
            { translateX: 0 },
            {
                translateX: "-500vw",
                ease: "none",
                duration: 1,
                scrollTrigger: {
                    trigger: triggerRef.current,
                    start: "top top",
                    end: "3000 top",
                    scrub: 0.6,
                    pin: true,
                    anticipatePin: 1,
                },
            }
        );
        return () => {
            pin.kill();
        };
    }, []);

    return (
        <div ref={triggerRef} style={{ overflow: 'hidden' }}>
            <div ref={sectionRef} style={{
                height: '100vh',
                width: '600vw',
                display: 'flex',
                flexDirection: 'row',
                position: 'relative',
                backgroundColor: '#2d3319' // Dark green
            }}>
                {products.map((product, index) => (
                    <div key={index}
                        onClick={() => navigate(`/search?query=${product.name}`)}
                        style={{
                            width: '100vw',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '5vw',
                            cursor: 'pointer'
                        }}>
                        <div style={{
                            width: '50vw',
                            height: '60vh',
                            position: 'relative',
                            borderRadius: '15px',
                            overflow: 'hidden',
                            boxShadow: '0 40px 100px rgba(0,0,0,0.4)',
                            marginBottom: '3rem'
                        }}>
                            <video
                                src={product.video}
                                autoPlay
                                loop
                                muted
                                playsInline
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                }}
                            />
                        </div>
                        <h3 style={{ fontSize: '3.5rem', color: '#f5f5f0', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                            {product.name}
                        </h3>
                        {index === products.length - 1 && (
                            <p style={{
                                marginTop: '1rem',
                                color: '#f5f5f0',
                                opacity: 0.6,
                                textTransform: 'uppercase',
                                letterSpacing: '0.2em',
                                fontSize: '0.9rem'
                            }}>
                                Keep scrolling for full menu →
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
