"use client";
import './Reviews.css';

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

const Stars = ({ count }) => (
    <div className="review-stars" aria-label={`${count} star rating`}>
        {Array.from({ length: count }).map((_, i) => (
            <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill="#C9A227" stroke="none">
                <path d="M12 2l2.9 6.6 7.1.6-5.4 4.8 1.6 7-6.2-3.7L5.8 21l1.6-7L2 9.2l7.1-.6L12 2z" />
            </svg>
        ))}
    </div>
);

const ReviewCard = ({ review }) => (
    <figure className="review-card">
        <Stars count={review.rating} />
        <blockquote>&ldquo;{review.text}&rdquo;</blockquote>
        <figcaption>
            <span className="review-author">{review.author}</span>
            <span className="review-location">{review.location}</span>
        </figcaption>
    </figure>
);

export default function Reviews() {
    // Two rows drifting in opposite directions; each list is duplicated
    // so the CSS -50% translate loops seamlessly.
    const rowA = [...reviews, ...reviews];
    const rowB = [...[...reviews].reverse(), ...[...reviews].reverse()];

    return (
        <section className="reviews-v2">
            {/* Seamless transition from the showcase above */}
            <div className="reviews-fade-top" />

            <div className="reviews-head">
                <p className="reviews-eyebrow">Kind Words</p>
                <h2 className="reviews-title">
                    Loved across <em>India</em>
                </h2>
            </div>

            <div className="marquee" aria-hidden="false">
                <div className="marquee-track drift-left">
                    {rowA.map((r, i) => <ReviewCard key={`a-${i}`} review={r} />)}
                </div>
                <div className="marquee-track drift-right">
                    {rowB.map((r, i) => <ReviewCard key={`b-${i}`} review={r} />)}
                </div>
            </div>
        </section>
    );
}
