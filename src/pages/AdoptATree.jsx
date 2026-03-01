import React, { useEffect } from 'react';
import SmoothScroll from '../components/SmoothScroll';
import './AdoptATree.css';

const AdoptATree = () => {

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

    const handleAdoptClick = () => {
        if (!window.Razorpay) {
            alert("Razorpay SDK failed to load. Are you online?");
            return;
        }

        const options = {
            key: "YOUR_KEY_ID", // Placeholder API Key
            amount: "3100000", // ₹31,000 in paise
            currency: "INR",
            name: "Naaliban Apple Orchards",
            description: "Adopt an Organic Apple Tree",
            image: "/images/logo.png",
            handler: function (response) {
                alert(`Payment successful! Payment ID: ${response.razorpay_payment_id}`);
                // In a real app, this is where you would call your backend to verify the signature
            },
            prefill: {
                name: "John Doe",
                email: "customer@example.com",
                contact: "9999999999"
            },
            theme: {
                color: "#2d3319" // Forest green brand color
            }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response) {
            alert(`Payment failed. Reason: ${response.error.description}`);
        });
        rzp.open();
    };

    return (
        <SmoothScroll>
            <main className="adopt-page">
                {/* Hero Section */}
                <section className="adopt-hero">
                    <div className="adopt-hero-overlay"></div>
                    <div className="adopt-hero-content">
                        <h1>Here's how you can rent an organic apple tree at Naaliban Apple Orchards</h1>
                    </div>
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

                    {/* Pricing / Checkout Action */}
                    <div className="adopt-checkout-section">
                        <div className="price-tag">
                            <span className="currency">₹</span>
                            <span className="amount">31,000</span>
                            <span className="duration">/ season</span>
                        </div>
                        <button className="adopt-btn" onClick={handleAdoptClick}>
                            Adopt / Gift a Tree Now
                        </button>
                        <p className="guarantee">Secure checkout powered by Razorpay</p>
                    </div>
                </section>
            </main>
        </SmoothScroll>
    );
};

export default AdoptATree;
