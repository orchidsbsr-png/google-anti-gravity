import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { getProductImage } from '../utils/imageService';
import { BRAND, whatsappLink } from '../config/brand';
import './OrderSummary.css';

const ic = {
    width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none',
    stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round'
};

const OrderSummary = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showHelp, setShowHelp] = useState(false);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const { data, error } = await supabase
                    .from('orders')
                    .select('*')
                    .eq('id', orderId)
                    .maybeSingle();
                if (error) throw error;
                if (data) setOrder(data);
            } catch (error) {
                console.error('Error fetching order:', error);
            } finally {
                setLoading(false);
            }
        };
        if (orderId) fetchOrder();
    }, [orderId]);

    if (loading) return <div className="os-state">Gathering your order&hellip;</div>;
    if (!order) return <div className="os-state">We couldn&rsquo;t find that order.</div>;

    const steps = [
        { status: 'order_placed', label: 'Order placed', desc: 'We have received your order.' },
        { status: 'accepted', label: 'Accepted', desc: 'The orchard has confirmed it.' },
        { status: 'processing', label: 'Being packed', desc: 'Your fruit is being picked and packed.' },
        { status: 'out_for_delivery', label: 'On its way', desc: 'Travelling from the valley to you.' },
        { status: 'delivered', label: 'Delivered', desc: 'Enjoy the harvest.' }
    ];

    const currentStatus = order.status || 'order_placed';
    // 'confirmed' (paid) sits between placed and accepted
    let activeStepIndex = steps.findIndex(s => s.status === currentStatus);
    if (activeStepIndex === -1 && currentStatus === 'confirmed') activeStepIndex = 0;

    const isStepActive = (index) => currentStatus !== 'cancelled' && index <= activeStepIndex;

    const formatDate = (isoString) => {
        if (!isoString) return '';
        try {
            return new Date(isoString).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
        } catch {
            return '';
        }
    };

    const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
    const cartItems = order.cart_items || [];
    const customerDetails = order.customer_details || {};
    const addr = typeof customerDetails.address === 'object' && customerDetails.address !== null
        ? customerDetails.address : null;

    const handleCancellationRequest = async () => {
        if (!window.confirm('Request cancellation for this order?')) return;
        try {
            const { error } = await supabase.from('orders').update({
                cancellation_requested: true,
                cancellation_requested_at: new Date().toISOString()
            }).eq('id', order.id);
            if (error) throw error;
            setOrder(prev => ({ ...prev, cancellation_requested: true }));
        } catch (error) {
            console.error('Error requesting cancellation:', error);
            alert('Failed to send the request — please try again.');
        }
    };

    return (
        <div className="os-page">
            <header className="os-head">
                <button className="os-back" onClick={() => navigate(-1)} aria-label="Go back">
                    <svg {...ic}><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                </button>
                <div>
                    <p className="os-eyebrow">Your Order</p>
                    <h1 className="os-title">#{order.id ? order.id.slice(0, 8).toUpperCase() : '…'}</h1>
                    <p className="os-placed">Placed on {formatDate(order.created_at)}</p>
                </div>
            </header>

            {currentStatus === 'cancelled' ? (
                <div className="os-banner os-banner-cancelled">
                    <svg {...ic}><path d="M18 6 6 18M6 6l12 12" /></svg>
                    <span>This order has been cancelled.</span>
                </div>
            ) : order.cancellation_requested ? (
                <div className="os-banner os-banner-pending">
                    <svg {...ic}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
                    <span>
                        <b>Cancellation requested.</b> We&rsquo;ve received it — the order
                        will be reviewed within a day or two.
                    </span>
                </div>
            ) : (
                <section className="os-card os-timeline" aria-label="Order progress">
                    {steps.map((step, index) => (
                        <div key={step.status} className={`os-step ${isStepActive(index) ? 'done' : ''} ${index === activeStepIndex ? 'current' : ''}`}>
                            <span className="os-step-dot" aria-hidden="true">
                                {isStepActive(index) && (
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 6 9 17l-5-5" />
                                    </svg>
                                )}
                            </span>
                            <div className="os-step-text">
                                <h4>{step.label}</h4>
                                <p>{step.desc}</p>
                            </div>
                        </div>
                    ))}
                </section>
            )}

            <section className="os-card">
                <h3 className="os-section-title">Your harvest <span>· {cartItems.length} item{cartItems.length !== 1 ? 's' : ''}</span></h3>
                {cartItems.map((item, idx) => (
                    <div key={idx} className="os-item">
                        <img
                            src={getProductImage(item.productName, { variety: item.varietyName })}
                            alt=""
                            className="os-item-img"
                            loading="lazy"
                            onError={(e) => { e.target.style.visibility = 'hidden'; }}
                        />
                        <div className="os-item-info">
                            <h4>{item.productName || 'Unknown product'}</h4>
                            <p>{[item.varietyName, item.quantityKg ? `${item.quantityKg}kg box` : ''].filter(Boolean).join(' · ')}</p>
                        </div>
                        <span className="os-item-price">
                            {item.quantity || 0} × {inr(item.price)}
                        </span>
                    </div>
                ))}
                <div className="os-total">
                    <span>Total {order.payment_method === 'cod' ? '· Cash on Delivery' : '· Paid online'}</span>
                    <strong>{inr(order.total_price)}</strong>
                </div>
            </section>

            <section className="os-card os-info">
                <span className="os-info-icon" aria-hidden="true">
                    <svg {...ic}><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0z" /><circle cx="12" cy="10" r="3" /></svg>
                </span>
                <div>
                    <h4>Delivery address</h4>
                    {addr ? (
                        <>
                            <p>{[addr.addressLine1, addr.addressLine2].filter(Boolean).join(', ')}</p>
                            <p>{[addr.city, addr.state].filter(Boolean).join(', ')} {addr.pincode ? `· ${addr.pincode}` : ''}</p>
                            {addr.phone && <p>{addr.phone}</p>}
                        </>
                    ) : (
                        <p>{customerDetails.address || 'No address on file'}</p>
                    )}
                </div>
            </section>

            <div className="os-actions">
                {!order.cancellation_requested && currentStatus !== 'cancelled' && currentStatus !== 'delivered' && (
                    <button className="os-btn os-btn-danger" onClick={handleCancellationRequest}>
                        Request cancellation
                    </button>
                )}
                <button className="os-btn os-btn-primary" onClick={() => setShowHelp(true)}>
                    Get help with this order
                </button>
            </div>

            {showHelp && (
                <div className="os-modal-overlay" onClick={() => setShowHelp(false)}>
                    <div className="os-modal" role="dialog" aria-label="Get help" onClick={e => e.stopPropagation()}>
                        <h3>How can we help?</h3>
                        <p>Reach us about order #{order.id.slice(0, 8).toUpperCase()} — we reply fast.</p>
                        <div className="os-contacts">
                            <a href={whatsappLink(`Hello! I need help with my order #${order.id.slice(0, 8).toUpperCase()}.`)}
                                target="_blank" rel="noopener noreferrer" className="os-contact">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
                                </svg>
                                WhatsApp us
                            </a>
                            <a href={`tel:+${BRAND.whatsappNumber}`} className="os-contact">
                                <svg {...ic}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                                Call us
                            </a>
                            <a href={`mailto:${BRAND.supportEmail}`} className="os-contact">
                                <svg {...ic}><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                                {BRAND.supportEmail}
                            </a>
                        </div>
                        <button className="os-btn" onClick={() => setShowHelp(false)}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderSummary;
