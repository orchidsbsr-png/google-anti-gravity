import React, { useEffect, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import './OrderConfirmation.css';

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
                    <h1>Verifying Payment...</h1>
                    <p>Please wait while we confirm your transaction with the bank.</p>
                </div>
            </div>
        );
    }

    if (status === 'failed') {
        return (
            <div className="confirmation-page">
                <div className="confirmation-card glass error">
                    <div className="error-icon">❌</div>
                    <h1>Payment Failed</h1>
                    <p>We couldn't verify your payment. If money was deducted, it will be refunded automatically.</p>
                    <div className="actions">
                        <Link to="/cart" className="btn-primary">Try Again</Link>
                        <Link to="/" className="btn-secondary">Go Home</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="confirmation-page">
            <div className="confirmation-card glass">
                <div className="success-icon">✅</div>
                <h1>Order Placed!</h1>
                <p>Thank you for your order. Your fresh fruits will be delivered soon.</p>
                {orderId && <p className="order-id">Order ID: {orderId}</p>}

                <div className="actions">
                    <Link to="/" className="btn-primary">Continue Shopping</Link>
                    <Link to="/orders" className="btn-secondary">View Orders</Link>
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmation;
