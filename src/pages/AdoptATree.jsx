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

    // Integrating Razorpay Standard Checkout
    useEffect(() => {
        const loadRazorpayScript = () => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;
            document.body.appendChild(script);
        };
        loadRazorpayScript();
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

    return (
        <SmoothScroll>
            <main className="adopt-page">
                <section className="adopt-hero">
                    <div className="adopt-hero-overlay"></div>
                    <div className="adopt-hero-content">
                        <h1>Here's how you can rent an organic apple tree at Naaliban Apple Orchards</h1>
                    </div>
                    {/* Seamless Transition Gradient to Page Background (#fdfbf7) */}
                    <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        width: '100%',
                        height: '25vh',
                        background: 'linear-gradient(to bottom, transparent 0%, rgba(253, 251, 247, 0.4) 60%, #fdfbf7 100%)',
                        zIndex: 2,
                        pointerEvents: 'none' // Ensures it doesn't block clicks
                    }} />
                </section>

                {/* Info Content */}
                <section className="adopt-content">
                    <div className="adopt-text-block">
                        <h3>Pick a tree</h3>
                        <p>Based on the variety of apple the tree produces, age of the tree, location in the orchard, you can pick a tree. Or to keep things simple we can pick one for you.</p>
                    </div>

                    <div className="adopt-text-block">
                        <h3>Make it your own</h3>
                        <p>With a small monetary contribution, most of which will go towards the upkeep of the tree, you get a fruit bearing tree to call your own for 11 months.</p>
                    </div>

                    <div className="adopt-text-block">
                        <h3>And with that you get a whole lot more</h3>
                        <ul className="adopt-benefits-list">
                            <li>The tree gets marked as 'adopted'</li>
                            <li>A framed certificate of adoption</li>
                            <li>Round the year, special care will be provided to your tree - pruning, nourishment, etc.</li>
                            <li>5 X 5 kg boxes of certified organic apples delivered at your doorstep</li>
                            <li>A chance to visit the orchard, and harvest apples from your own tree (1 box of 10 kg capacity will be provided - day trips only - stay and transportation can be arranged at the nearest hotel at extra cost)</li>
                        </ul>
                    </div>

                    <div className="adopt-text-block">
                        <h3>You can also gift a tree</h3>
                        <p>Imagine the look on their faces and the joy it will bring to you, when you gift someone their own organic apple tree. We think it will make the best gift ever.</p>
                    </div>

                    {/* Adoption Details Form */}
                    <div className="adopt-form-section">
                        <h3>Adoption Details</h3>
                        <p className="form-subtitle">Information needed for your adoption certificate and updates.</p>

                        <div className="form-group">
                            <label>Your Full Name *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Name as it should appear on certificate"
                                className={formErrors.name ? 'error' : ''}
                            />
                            {formErrors.name && <span className="error-text">{formErrors.name}</span>}
                        </div>

                        <div className="form-row">
                            <div className="form-group half">
                                <label>Email Address *</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="For updates and digital certificate"
                                    className={formErrors.email ? 'error' : ''}
                                />
                                {formErrors.email && <span className="error-text">{formErrors.email}</span>}
                            </div>
                            <div className="form-group half">
                                <label>Phone Number *</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    placeholder="10-digit mobile number"
                                    className={formErrors.phone ? 'error' : ''}
                                />
                                {formErrors.phone && <span className="error-text">{formErrors.phone}</span>}
                            </div>
                        </div>

                        <div className="form-group checkbox-group">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="isGift"
                                    checked={formData.isGift}
                                    onChange={handleInputChange}
                                />
                                <span>This adoption is a gift for someone else</span>
                            </label>
                        </div>

                        {formData.isGift && (
                            <div className="gift-details-section">
                                <h4>Gift Details</h4>
                                <div className="form-group">
                                    <label>Recipient's Full Name *</label>
                                    <input
                                        type="text"
                                        name="recipientName"
                                        value={formData.recipientName}
                                        onChange={handleInputChange}
                                        placeholder="Name for their certificate"
                                        className={formErrors.recipientName ? 'error' : ''}
                                    />
                                    {formErrors.recipientName && <span className="error-text">{formErrors.recipientName}</span>}
                                </div>
                                <div className="form-group">
                                    <label>Message for Certificate (Optional)</label>
                                    <textarea
                                        name="giftMessage"
                                        value={formData.giftMessage}
                                        onChange={handleInputChange}
                                        placeholder="Add a special message for the recipient..."
                                        rows="3"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Pricing / Checkout Action */}
                    <div className="adopt-checkout-section">
                        <div className="price-tag">
                            <span className="currency">₹</span>
                            <span className="amount">31,000</span>
                            <span className="duration">/ season</span>
                        </div>
                        <button className="adopt-btn" onClick={handleAdoptClick} disabled={isProcessing} style={{ opacity: isProcessing ? 0.7 : 1 }}>
                            {isProcessing ? "Processing..." : "Adopt / Gift a Tree Now"}
                        </button>
                        <p className="guarantee">Secure checkout powered by Razorpay</p>
                    </div>
                </section>
            </main>
        </SmoothScroll>
    );
};

export default AdoptATree;
