import React from 'react';
import { Link } from 'react-router-dom';
import './OrderConfirmation.css';

const OrderConfirmation = () => {
    return (
        <div className="confirmation-page">
            <div className="confirmation-card glass">
                <div className="success-icon">✅</div>
                <h1>Order Placed!</h1>
                <p>Thank you for your order. Your fresh fruits will be delivered soon.</p>

                <div className="actions">
                    <Link to="/" className="btn-primary">Continue Shopping</Link>
                    <Link to="/profile" className="btn-secondary">View Orders</Link>
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmation;
