import React, { useState, useEffect } from 'react';
import SmoothScroll from '../components/SmoothScroll';
import './AdoptATree.css';

const AdoptATree = () => {
    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        isGift: false,
        recipientName: '',
        giftMessage: ''
    });
    const [formErrors, setFormErrors] = useState({});

    // Integrating Razorpay Standard Checkout & Scroll Animation Observers
    useEffect(() => {
        // Razorpay Script
        const loadRazorpayScript = () => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;
            document.body.appendChild(script);
        };
        loadRazorpayScript();

        // Scroll Reveal Observer
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('lux-active');
                }
            });
        }, { threshold: 0.1 });

        const revealElements = document.querySelectorAll('.lux-reveal');
        revealElements.forEach(el => observer.observe(el));

        return () => {
            revealElements.forEach(el => observer.unobserve(el));
        };
    }, []);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        // Clear error when user types
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.name.trim()) errors.name = 'Name is required for the certificate';
        if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email)) errors.email = 'Valid email is required';
        if (!formData.phone.trim() || formData.phone.length < 10) errors.phone = 'Valid phone number is required';

        if (formData.isGift) {
            if (!formData.recipientName.trim()) errors.recipientName = 'Recipient name is required for the gift certificate';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const [isProcessing, setIsProcessing] = useState(false);

    const handleAdoptClick = async () => {
        if (!validateForm()) {
            // Scroll to form or show an alert
            alert("Please fill in all required details for the certificate before proceeding.");
            return;
        }

        if (!window.Razorpay) {
            alert("Razorpay SDK failed to load. Are you online?");
            return;
        }

        try {
            setIsProcessing(true);

            // Step 1: Create Order on the Backend
            const response = await fetch('/api/initiate_payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: 31000, // ₹31,000 passed to backend (backend multiplies by 100 to get paise)
                    receipt: `adopt_tree_${Date.now()}`
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Payment initiation failed');
            }

            // Step 2: Open Razorpay Checkout with the returned order_id
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || data.key || "rzp_test_dummykey123456",
                amount: data.amount, // from backend (paise)
                currency: data.currency, // from backend
                name: "Naaliban Apple Orchards",
                description: formData.isGift ? `Gift an Apple Tree to ${formData.recipientName}` : "Adopt an Organic Apple Tree",
                image: "/images/logo.png",
                order_id: data.id, // Mandatory for live payments
                handler: function (response) {
                    alert(`Payment successful! Payment ID: ${response.razorpay_payment_id}. We will contact you soon regarding your certificate!`);
                    // In a real app, send response + formData to your backend to verify payment and store adoption details
                },
                prefill: {
                    name: formData.name,
                    email: formData.email,
                    contact: formData.phone
                },
                notes: {
                    is_gift: formData.isGift ? "Yes" : "No",
                    recipient_name: formData.recipientName,
                    gift_message: formData.giftMessage,
                    certificate_name: formData.isGift ? formData.recipientName : formData.name
                },
                theme: {
                    color: "#2d3319" // Forest green brand color
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                console.error("Razorpay Payment Failed:", response.error);
                alert(`Payment failed. Reason: ${response.error.description}`);
            });
            rzp.open();

        } catch (error) {
            console.error('Error initiating payment:', error);
            alert(`Failed to start payment: ${error.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    // Component UI Render
    return (
        <SmoothScroll>
            {/* The global noise texture creates the "organic paper" feel */}
            <div className="noise-overlay" style={{ position: 'fixed', zIndex: 9999, pointerEvents: 'none' }}></div>

            <main className="lux-adopt-page">
                {/* 1. Hero Section (Parallax & Elegant Hook) */}
                <section className="lux-hero">
                    <div className="lux-hero-bg"></div>
                    <div className="lux-hero-overlay"></div>
                    <div className="lux-hero-content lux-reveal">
                        <span className="lux-kicker">Naaliban Apple Orchards</span>
                        <h1 className="lux-headline">Adopt a Living Legacy.</h1>
                        <p className="lux-subhead">Secure your own piece of the Himalayas. Nurtured by nature, harvested for you.</p>
                    </div>
                </section>

                {/* 2. The Process (Zig-Zag Storytelling) */}
                <section className="lux-story-section">
                    <div className="lux-story-row lux-reveal">
                        <div className="lux-story-image">
                            {/* Placeholder for real orchard tree image */}
                            <img src="/images/adopt apple tree photos/red apple tree.jpg" alt="Apple Tree Selection" />
                        </div>
                        <div className="lux-story-text">
                            <span className="lux-step-number">01</span>
                            <h2>Pick Your Tree</h2>
                            <p>Based on the apple variety, the age of the roots, and its location basking in the mountain sun, you can hand-select your tree. Or, if you prefer, allow our master orchardists to choose the perfect one for you.</p>
                        </div>
                    </div>

                    <div className="lux-story-row reverse lux-reveal">
                        <div className="lux-story-image">
                            <img src="/images/adopt apple tree photos/image 2.png" alt="Orchard Care" />
                        </div>
                        <div className="lux-story-text">
                            <span className="lux-step-number">02</span>
                            <h2>Make It Yours</h2>
                            <p>With a one-time monetary contribution that goes directly towards the organic upkeep and nourishment of the soil, this fruit-bearing tree becomes exclusively yours for an entire 11-month season.</p>
                        </div>
                    </div>
                </section>

                {/* 3. The Perks (Bento Box Grid) */}
                <section className="lux-perks-section lux-reveal">
                    <div className="lux-section-header">
                        <h2>The Harvest Experience</h2>
                        <p>More than just fruit. It's a connection to the land.</p>
                    </div>

                    <div className="lux-bento-grid">
                        <div className="lux-bento-card">
                            <div className="lux-icon">🏷️</div>
                            <h3>Exclusive Marking</h3>
                            <p>Your tree is physically tagged as 'adopted' with your name in our orchard.</p>
                        </div>
                        <div className="lux-bento-card featured">
                            <div className="lux-icon">🍎</div>
                            <h3>The Bounty</h3>
                            <p>Receive five 5kg boxes of premium, certified organic apples delivered straight from your tree to your doorstep.</p>
                        </div>
                        <div className="lux-bento-card">
                            <div className="lux-icon">📜</div>
                            <h3>Official Certificate</h3>
                            <p>A beautifully framed certificate of adoption, documenting your living legacy.</p>
                        </div>
                        <div className="lux-bento-card">
                            <div className="lux-icon">🌱</div>
                            <h3>Expert Care</h3>
                            <p>Round-the-year organic nourishment, pruning, and protection provided by our local farmers.</p>
                        </div>
                        <div className="lux-bento-card wide">
                            <div className="lux-icon">⛰️</div>
                            <h3>Visit Your Tree</h3>
                            <p>A standing invitation to visit the orchard. Harvest apples from your own tree in person (includes 1 box of 10kg capacity for day trips).</p>
                        </div>
                    </div>
                </section>

                {/* 4. The Gift Section (Sage Background) */}
                <section className="lux-gift-section">
                    <div className="lux-gift-container lux-reveal">
                        <div className="lux-gift-text">
                            <h2>The Ultimate Gift</h2>
                            <p>Imagine the joy of gifting someone their very own producing apple tree in the Himalayas. It is a sustainable, breathing gift that keeps giving throughout the season.</p>

                            <div className="lux-gift-toggle">
                                <label className="lux-checkbox">
                                    <input
                                        type="checkbox"
                                        name="isGift"
                                        checked={formData.isGift}
                                        onChange={handleInputChange}
                                    />
                                    <span className="checkmark"></span>
                                    Make this adoption a gift
                                </label>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 5. Pricing & Checkout (Floating Card) */}
                <section className="lux-checkout-section lux-reveal">
                    <div className="lux-pricing-card">
                        <div className="lux-pricing-header">
                            <h3>Adoption Details</h3>
                            <p>Complete your registration below.</p>
                        </div>

                        <div className="lux-form">
                            <div className="lux-input-group">
                                <label>Full Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="For the certificate"
                                    className={formErrors.name ? 'error' : ''}
                                />
                                {formErrors.name && <span className="lux-error">{formErrors.name}</span>}
                            </div>

                            <div className="lux-input-row">
                                <div className="lux-input-group">
                                    <label>Email *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="For updates"
                                        className={formErrors.email ? 'error' : ''}
                                    />
                                    {formErrors.email && <span className="lux-error">{formErrors.email}</span>}
                                </div>
                                <div className="lux-input-group">
                                    <label>Phone *</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        placeholder="Mobile number"
                                        className={formErrors.phone ? 'error' : ''}
                                    />
                                    {formErrors.phone && <span className="lux-error">{formErrors.phone}</span>}
                                </div>
                            </div>

                            {formData.isGift && (
                                <div className="lux-gift-fields">
                                    <div className="lux-input-group">
                                        <label>Recipient's Full Name *</label>
                                        <input
                                            type="text"
                                            name="recipientName"
                                            value={formData.recipientName}
                                            onChange={handleInputChange}
                                            placeholder="Name for their certificate"
                                            className={formErrors.recipientName ? 'error' : ''}
                                        />
                                        {formErrors.recipientName && <span className="lux-error">{formErrors.recipientName}</span>}
                                    </div>
                                    <div className="lux-input-group">
                                        <label>Gift Message (Optional)</label>
                                        <textarea
                                            name="giftMessage"
                                            value={formData.giftMessage}
                                            onChange={handleInputChange}
                                            placeholder="A special note..."
                                            rows="2"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="lux-checkout-action">
                            <div className="lux-price-display">
                                <span className="currency">₹</span>
                                <span className="amount">31,000</span>
                                <span className="duration">/ season</span>
                            </div>

                            <button
                                className={`lux-submit-btn ${isProcessing ? 'processing' : ''}`}
                                onClick={handleAdoptClick}
                                disabled={isProcessing}
                            >
                                <span className="btn-text">{isProcessing ? "Securing Tree..." : "Adopt / Gift a Tree"}</span>
                                <div className="btn-shine"></div>
                            </button>
                            <p className="lux-secure-note">🔒 Secured by Razorpay</p>
                        </div>
                    </div>
                </section>

            </main>
        </SmoothScroll>
    );
};

export default AdoptATree;
