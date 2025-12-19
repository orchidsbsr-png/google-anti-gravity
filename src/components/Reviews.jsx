"use client";
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const reviews = [
    {
        text: "The Himachal apples are the best I've ever had. So crisp and sweet! You can really taste the mountain air in every bite.",
        author: "Ananya Sharma",
        location: "Mumbai",
        rating: 5
    },
    {
        text: "I've been looking for organic persimmons for a long time. These are absolutely world-class. Farm Fresh is doing an amazing service.",
        author: "Rahul Varma",
        location: "Delhi",
        rating: 5
    },
    {
        text: "The packaging is so sustainable and beautiful. The pears arrived perfectly ripe and full of flavor. Highly recommended!",
        author: "Priya Iyer",
        location: "Bangalore",
        rating: 5
    },
    {
        text: "Finally, a brand that connects us directly with the orchards. The plums are juicy and incredible. My kids love them!",
        author: "Vikram Malhotra",
        location: "Hyderabad",
        rating: 5
    },
    {
        text: "The quality of the cherries is unmatched. Fresh, vibrant, and delivered right to my doorstep in perfect condition.",
        author: "Sneha Kapoor",
        location: "Chandigarh",
        rating: 5
    }
];

export default function Reviews() {
    const sectionRef = useRef(null);
    const triggerRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(
                sectionRef.current,
                { translateX: `-${(reviews.length - 1) * 100}vw` },
                {
                    translateX: 0,
                    ease: "none",
                    scrollTrigger: {
                        trigger: triggerRef.current,
                        start: "top top",
                        end: `+=${(reviews.length - 1) * 1000}`,
                        scrub: 0.6,
                        pin: true,
                        anticipatePin: 1,
                    },
                }
            );
        }, triggerRef);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={triggerRef} style={{ overflow: 'hidden', backgroundColor: '#242a14' }}>
            <div style={{ padding: '80px 8vw 20px', textAlign: 'center' }}>
                <h2 style={{
                    fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                    color: '#f5f5f0',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    fontWeight: '800',
                    margin: 0
                }}>
                    Amazing Reviews
                </h2>
                <p style={{ color: '#f5f5f0', opacity: 0.6, marginTop: '10px', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                    From our cherished community
                </p>
            </div>

            <div ref={sectionRef} style={{
                height: '70vh',
                width: `${reviews.length * 100}vw`,
                display: 'flex',
                flexDirection: 'row',
                position: 'relative',
            }}>
                {reviews.map((review, index) => (
                    <div key={index} style={{
                        width: '100vw',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0 15vw'
                    }}>
                        <div style={{
                            textAlign: 'center',
                            maxWidth: '800px',
                            position: 'relative'
                        }}>
                            <span style={{
                                fontSize: '10rem',
                                position: 'absolute',
                                top: '-40px',
                                left: '-40px',
                                color: '#f5f5f0',
                                opacity: 0.05,
                                fontFamily: 'serif'
                            }}>"</span>

                            <p style={{
                                fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
                                color: '#f5f5f0',
                                lineHeight: '1.4',
                                fontStyle: 'italic',
                                marginBottom: '2rem',
                                fontWeight: '300'
                            }}>
                                {review.text}
                            </p>

                            <div style={{ height: '2px', width: '60px', backgroundColor: '#f5f5f0', margin: '0 auto 20px', opacity: 0.3 }}></div>

                            <h4 style={{ fontSize: '1.5rem', color: '#f5f5f0', margin: '0', fontWeight: '700' }}>
                                {review.author}
                            </h4>
                            <p style={{ fontSize: '1rem', color: '#f5f5f0', opacity: 0.6, margin: '5px 0' }}>
                                {review.location}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
