"use client";
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { useNavigate } from 'react-router-dom';
import './ProductShowcase.css';

gsap.registerPlugin(ScrollTrigger);

const products = [
    { name: 'Apples', video: '/videos/apples.mp4' },
    { name: 'Persimmons', video: '/videos/orange-persimmons.mp4' }, // Consolidated category
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
        <div ref={triggerRef} className="showcase-slider-container">
            <div ref={sectionRef} className="showcase-scroll-wrapper">
                {products.map((product, index) => (
                    <div key={index}
                        onClick={() => navigate(`/search?query=${product.name}`)}
                        className="showcase-slide">
                        <div className="showcase-media-container">
                            <video
                                src={product.video}
                                autoPlay
                                loop
                                muted
                                playsInline
                            />
                        </div>
                        <h3 className="showcase-title">
                            {product.name}
                        </h3>
                        {index === products.length - 1 && (
                            <p className="showcase-prompt">
                                Keep scrolling for full menu →
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
