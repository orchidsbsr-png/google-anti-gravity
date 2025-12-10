import React, { useRef, useEffect, useState } from 'react';

const LazyVideo = ({ src, poster, className }) => {
    const videoRef = useRef(null);
    const [isIntersecting, setIsIntersecting] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsIntersecting(true);
                    observer.disconnect(); // Stop observing once loaded
                }
            },
            {
                threshold: 0.25 // Load when 25% of the video is visible
            }
        );

        if (videoRef.current) {
            observer.observe(videoRef.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <video
            ref={videoRef}
            className={className}
            autoPlay
            loop
            muted
            playsInline
            poster={poster}
            preload="none" // Important: Don't download metadata until source is set
        >
            {isIntersecting && <source src={src} type="video/mp4" />}
        </video>
    );
};

export default LazyVideo;
