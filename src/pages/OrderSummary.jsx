import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getProductImage } from '../utils/imageService';
import './OrderSummary.css';

const OrderSummary = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showHelp, setShowHelp] = useState(false);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const docRef = doc(db, 'orders', orderId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setOrder({ id: docSnap.id, ...docSnap.data() });
                } else {
                    console.error("No such order!");
                }
            } catch (error) {
                console.error("Error fetching order:", error);
            } finally {
                setLoading(false);
            }
        };

        if (orderId) fetchOrder();
    }, [orderId]);

    if (loading) return <div className="loading">Loading details...</div>;
    if (!order) return <div className="error">Order not found</div>;

    const steps = [
        { status: 'order_placed', label: 'Order Placed', desc: 'We have received your order.' },
        { status: 'accepted', label: 'Accepted', desc: 'Your order has been accepted.' },
        { status: 'processing', label: 'Processing', desc: 'We are preparing your items.' },
        { status: 'out_for_delivery', label: 'Out for Delivery', desc: 'Your order is on the way.' },
        { status: 'delivered', label: 'Delivered', desc: 'Order delivered successfully.' }
    ];

    // Determine current step index
    const currentStatus = order.status || 'order_placed';
    let activeStepIndex = steps.findIndex(s => s.status === currentStatus);
    if (activeStepIndex === -1 && currentStatus === 'cancelled') activeStepIndex = -1; // Handle cancelled separately if needed

    // Helper to check if step is active or completed
    const isStepActive = (index) => {
        if (currentStatus === 'cancelled') return false;
        return index <= activeStepIndex;
    };

    const formatDate = (isoString) => {
        if (!isoString) return '';
        try {
            return new Date(isoString).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        } catch (e) {
            return '';
        }
    };

    const cartItems = order.cart_items || [];
    const customerDetails = order.customer_details || {};

    const handleCancellationRequest = async () => {
        if (!window.confirm("Are you sure you want to request cancellation for this order?")) return;

        try {
            const orderRef = doc(db, 'orders', order.id);
            await updateDoc(orderRef, {
                cancellation_requested: true,
                cancellation_requested_at: new Date().toISOString()
            });

            // Update local state to reflect change immediately
            setOrder(prev => ({ ...prev, cancellation_requested: true }));
            alert("Cancellation request sent.");
        } catch (error) {
            console.error("Error requesting cancellation:", error);
            alert("Failed to send request.");
        }
    };

    return (
        <div className="order-summary-page">
            {/* ... existing header ... */}
            <div className="summary-header">
                <button className="back-btn" onClick={() => navigate(-1)}>←</button>
                <div className="header-title">
                    <h1>Order #{order.id ? order.id.slice(0, 8).toUpperCase() : '...'}</h1>
                    <p>Placed on {formatDate(order.created_at)}</p>
                </div>
            </div>

            {currentStatus === 'cancelled' ? (
                <div className="cancelled-banner" style={{ background: '#ffebee', color: '#c62828', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', textAlign: 'center', fontWeight: 'bold' }}>
                    ❌ This order has been cancelled.
                </div>
            ) : order.cancellation_requested ? (
                <div className="cancellation-pending-banner" style={{ background: '#fff3e0', color: '#e65100', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', textAlign: 'center', border: '1px solid #ffe0b2' }}>
                    <h4 style={{ margin: 0, marginBottom: '0.5rem' }}>⚠️ Cancellation Requested</h4>
                    <p style={{ margin: 0, fontSize: '0.9rem' }}>Your request has been received. Cancellation will be processed in 1-2 days.</p>
                </div>
            ) : (
                <div className="order-timeline">
                    {steps.map((step, index) => (
                        <div key={step.status} className={`timeline-item ${isStepActive(index) ? 'active' : ''}`}>
                            <div className="timeline-line"></div>
                            <div className="timeline-icon">
                                {isStepActive(index) ? '✓' : (index + 1)}
                            </div>
                            <div className="timeline-content">
                                <h4>{step.label}</h4>
                                <p>{step.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ... items section ... */}
            <div className="items-section">
                <h3>Your Items ({cartItems.length})</h3>
                {cartItems.map((item, idx) => (
                    <div key={idx} className="summary-item-card">
                        <img
                            src={getProductImage(item.productName, { variety: item.varietyName })}
                            alt={item.productName || 'Product'}
                            className="item-thumb"
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/60?text=Img'; }}
                        />
                        <div className="item-details">
                            <h4>{item.productName || 'Unknown Product'}</h4>
                            <p>{item.varietyName || ''} • {item.quantityKg || 0}kg</p>
                        </div>
                        <div className="item-price">
                            {item.quantity || 0} x ₹{item.price || 0}
                        </div>
                    </div>
                ))}
            </div>

            {/* ... cost breakdown ... */}
            <div className="cost-breakdown">
                <div className="cost-row">
                    <span>Subtotal</span>
                    <span>₹{order.total_price || 0}</span>
                </div>
                <div className="cost-row">
                    <span>Delivery Fee</span>
                    <span>₹0.00</span>
                </div>
                <div className="cost-row discount">
                    <span>Discount</span>
                    <span>-₹0.00</span>
                </div>
                <div className="cost-row total">
                    <span>Total</span>
                    <span>₹{order.total_price || 0}</span>
                </div>
            </div>

            {/* ... info cards ... */}
            <div className="info-card">
                <div className="info-icon">📍</div>
                <div className="info-content">
                    <h4>Delivery Address</h4>
                    {typeof customerDetails.address === 'object' && customerDetails.address !== null ? (
                        <>
                            <p>{customerDetails.address.addressLine1}, {customerDetails.address.addressLine2}</p>
                            <p>{customerDetails.address.city}, {customerDetails.address.state} - {customerDetails.address.pincode}</p>
                            <p>Phone: {customerDetails.address.phone}</p>
                        </>
                    ) : (
                        <>
                            <p>{customerDetails.address || 'No address provided'}</p>
                            <p>{customerDetails.city || ''}, {customerDetails.pincode || ''}</p>
                        </>
                    )}
                </div>
            </div>

            <div className="info-card">
                <div className="info-icon">💳</div>
                <div className="info-content">
                    <h4>Payment Method</h4>
                    <p>Paid with {order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</p>
                </div>
            </div>

            <div className="actions-section" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
                {!order.cancellation_requested && currentStatus !== 'cancelled' && currentStatus !== 'delivered' && (
                    <button
                        className="cancel-order-btn"
                        onClick={handleCancellationRequest}
                        style={{
                            padding: '1rem',
                            background: '#fff',
                            color: '#d32f2f',
                            border: '1px solid #d32f2f',
                            borderRadius: '12px',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        Request Cancellation
                    </button>
                )}

                <button className="get-help-btn" onClick={() => setShowHelp(true)}>
                    Get Help
                </button>
            </div>

            {showHelp && (
                <div className="modal-overlay" onClick={() => setShowHelp(false)}>
                    <div className="help-modal" onClick={e => e.stopPropagation()}>
                        <h3>Need Help?</h3>
                        <p>Contact our support team regarding this order.</p>
                        <div className="contact-options">
                            <a href="tel:+919876543210" className="contact-btn">
                                📞 Call Us
                            </a>
                            <a href="mailto:support@farmfresh.com" className="contact-btn">
                                ✉️ Email Support
                            </a>
                        </div>
                        <button className="close-modal-btn" onClick={() => setShowHelp(false)}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderSummary;
