import React, { useEffect, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { whatsappLink } from '../config/brand';
import './OrderConfirmation.css';

const journeySteps = [
    { title: 'Harvest', desc: 'Being hand-picked' },
    { title: 'Pack', desc: 'Eco packaging' },
    { title: 'Ship', desc: 'On its way' },
    { title: 'Doorstep', desc: 'Fresh to you' },
];

const OrderConfirmation = () => {
    const [searchParams] = useSearchParams();
    const location = useLocation();

    // Support both state (COD) and URL param (Online Payment)
    const transactionId = searchParams.get('transactionId');
    const stateOrderId = location.state?.orderId;

    const [status, setStatus] = useState(stateOrderId ? 'success' : 'verifying');
    const [orderId, setOrderId] = useState(stateOrderId || transactionId);

    useEffect(() => {
        const verifyPayment = async () => {
            if (!transactionId) return;

            try {
                // Check status with backend
                const response = await fetch('/api/status', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ transactionId })
                });

                const data = await response.json();

                if (data.code === 'PAYMENT_SUCCESS') {
                    // Update Firestore
                    // Note: Ideally this is done via Webhook, but doing it client-side for MVP
                    const orderRef = doc(db, 'orders', transactionId);
                    await updateDoc(orderRef, {
                        payment_status: 'paid',
                        status: 'confirmed',
                        paid_at: new Date().toISOString()
                    });
                    setStatus('success');
                } else {
                    setStatus('failed');
                }
            } catch (error) {
                console.error("Verification Error:", error);
                setStatus('failed');
            }
        };

        if (transactionId) {
            verifyPayment();
        }
    }, [transactionId]);

    if (status === 'verifying') {
        return (
            <div className="confirmation-page">
                <div className="confirmation-card glass">
                    <div className="loader">↻</div>
                    <h1>Verifying Payment&hellip;</h1>
                    <p>Please wait while we confirm your transaction with the bank.</p>
                </div>
            </div>
        );
    }

    if (status === 'failed') {
        return (
            <div className="confirmation-page">
                <div className="confirmation-card glass error">
                    <div className="error-icon">&#10005;</div>
                    <h1>Payment Failed</h1>
                    <p>We couldn&rsquo;t verify your payment. If money was deducted, it will be refunded automatically.</p>
                    <div className="actions">
                        <Link to="/cart" className="btn-primary">Try Again</Link>
                        <Link to="/" className="btn-secondary">Go Home</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="confirmation-page celebrate">
            <div className="confirmation-hero">
                <div className="check-ring">
                    <svg viewBox="0 0 52 52" aria-hidden="true">
                        <circle className="check-circle" cx="26" cy="26" r="24" fill="none" />
                        <path className="check-mark" fill="none" d="M14 27l8 8 16-17" />
                    </svg>
                </div>

                <p className="confirm-eyebrow">Order Confirmed</p>
                <h1 className="confirm-title">
                    Your fruit is being <em>picked.</em>
                </h1>
                <p className="confirm-sub">
                    Thank you for ordering from our orchard. We harvest only after
                    you order &mdash; that&rsquo;s why it tastes like the mountains.
                </p>

                {orderId && (
                    <div className="order-chip">
                        <span>Order</span> #{String(orderId).slice(-8).toUpperCase()}
                    </div>
                )}

                <div className="journey-tracker">
                    {journeySteps.map((step, i) => (
                        <div key={step.title} className={`journey-step ${i === 0 ? 'active' : ''}`}>
                            <span className="dot" />
                            {i < journeySteps.length - 1 && <span className="line" />}
                            <h4>{step.title}</h4>
                            <p>{step.desc}</p>
                        </div>
                    ))}
                </div>

                <div className="actions">
                    <Link to="/orders" className="btn-primary">Track My Order</Link>
                    <Link to="/search" className="btn-secondary">Continue Shopping</Link>
                </div>

                <a
                    className="whatsapp-link"
                    href={whatsappLink(`Hello! I just placed order #${String(orderId || '').slice(-8).toUpperCase()} and have a question.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-3-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.6.8-.8 1-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4 0-.5.1-.7l.4-.5c.1-.2.1-.3.2-.5s0-.4 0-.5c-.1-.1-.6-1.4-.8-1.9-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.5 1.1 2.7c.1.2 1.9 2.9 4.6 4 .6.3 1.1.4 1.5.6.6.2 1.2.2 1.6.1.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z" />
                    </svg>
                    Questions? Chat with the farmer on WhatsApp
                </a>

                <p className="photo-ask">
                    When your box arrives, send us a photo on WhatsApp &mdash; the
                    best ones join our <em>&ldquo;from our customers&rsquo; kitchens&rdquo;</em> wall.
                </p>
            </div>
        </div>
    );
};

export default OrderConfirmation;
