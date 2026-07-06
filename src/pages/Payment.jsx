import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAddress } from '../context/AddressContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase';
import AddressForm from '../components/AddressForm';
import ProductImage from '../components/ProductImage';
import { sendOrderConfirmationEmail } from '../services/emailService';
import { saveOrderToSheet } from '../services/sheetService';
import './Payment.css';

const STEP_META = [
    { label: 'Address', title: 'Delivery Address' },
    { label: 'Payment', title: 'Payment Method' },
    { label: 'Review', title: 'Your Harvest' },
];

const StepIcon = ({ index }) => {
    switch (index) {
        case 0: // map pin
            return (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
                    <circle cx="12" cy="10" r="3" />
                </svg>
            );
        case 1: // card
            return (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="2" y="5" width="20" height="14" rx="2" />
                    <path d="M2 10h20" />
                </svg>
            );
        default: // review checklist
            return (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M8.5 12.5l2.5 2.5 4.5-5.5" />
                </svg>
            );
    }
};

const CheckIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 13l4 4L19 7" />
    </svg>
);

const Payment = () => {
    const navigate = useNavigate();
    const { cartItems, getCartTotal, clearCart } = useCart();
    const { addresses, getDefaultAddress, addAddress } = useAddress();
    const { user } = useAuth();

    // Wizard: 1 = address, 2 = payment method, 3 = review & pay
    const [step, setStep] = useState(1);

    const [selectedAddressId, setSelectedAddressId] = useState(getDefaultAddress()?.id);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [selectNewest, setSelectNewest] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('online');

    // Dynamic Shipping State
    const [shippingCost, setShippingCost] = useState(0);
    const [isServiceable, setIsServiceable] = useState(false);
    const [isChecking, setIsChecking] = useState(false);
    const [serviceError, setServiceError] = useState('');
    const [isEstimate, setIsEstimate] = useState(false);

    // Gift option
    const [isGift, setIsGift] = useState(false);
    const [giftNote, setGiftNote] = useState('');

    const subtotal = getCartTotal();
    const total = subtotal + shippingCost;
    const selectedAddress = addresses.find(a => a.id === selectedAddressId);

    const formatINR = (n) => Number(n || 0).toLocaleString('en-IN');

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [step]);

    // Addresses load async — keep a sensible selection as they arrive,
    // and jump to a freshly added one.
    useEffect(() => {
        if (addresses.length === 0) return;
        if (selectNewest) {
            setSelectedAddressId(addresses[addresses.length - 1].id);
            setSelectNewest(false);
        } else if (!addresses.some(a => a.id === selectedAddressId)) {
            setSelectedAddressId(addresses[0].id);
        }
    }, [addresses, selectNewest, selectedAddressId]);

    // Effect to check serviceability when address changes
    useEffect(() => {
        const checkShipping = async () => {
            const address = addresses.find(a => a.id === selectedAddressId);
            if (!address || !address.pincode) return;

            setIsChecking(true);
            setServiceError('');
            setIsServiceable(false);
            setShippingCost(0);

            try {
                // Calculate Total Weight
                const totalWeightGrams = cartItems.reduce((acc, item) => {
                    const weightKg = item.quantityKg || 5; // Default to 5kg if missing
                    const qty = item.quantity || 1;
                    return acc + (weightKg * qty * 1000);
                }, 0);

                // Call the new serviceability endpoint with weight
                const res = await fetch(`/api/check_serviceability?pincode=${address.pincode}&weight=${totalWeightGrams}`);
                const data = await res.json();

                if (data.is_serviceable) {
                    setShippingCost(data.shipping_cost);
                    setIsServiceable(true);
                    setIsEstimate(false);
                } else {
                    setIsServiceable(false);
                    setServiceError(data.error || 'Location not serviceable');
                }
            } catch (err) {
                console.error("Serviceability Check Failed:", err);
                if (import.meta.env.DEV) {
                    // Serverless API isn't available in local dev — use a flat
                    // estimate so the checkout flow can be tested end to end.
                    setShippingCost(120);
                    setIsServiceable(true);
                    setIsEstimate(true);
                } else {
                    setServiceError('Could not verify serviceability');
                }
            } finally {
                setIsChecking(false);
            }
        };

        if (selectedAddressId) {
            checkShipping();
        }
    }, [selectedAddressId]);

    const handleAddressSave = async (newAddress) => {
        await addAddress(newAddress);
        setSelectNewest(true);
        setShowAddressForm(false);
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        } else {
            navigate('/cart');
        }
    };

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePlaceOrder = async () => {
        if (!selectedAddressId) {
            alert('Please select a delivery address');
            return;
        }

        // Recalculate total to ensure it's fresh
        const currentSubtotal = getCartTotal();
        const currentShipping = Number(shippingCost) || 0; // Ensure number
        const currentTotal = currentSubtotal + currentShipping;

        setIsProcessing(true);

        try {
            // Create order in Supabase first
            const orderData = {
                user_id: user?.id || 'guest',
                customer_details: {
                    name: selectedAddress.name,
                    phone: selectedAddress.phone,
                    email: user?.email || '',
                    address: selectedAddress
                },
                cart_items: cartItems,
                total_price: currentTotal, // Use recalculated total
                status: 'pending',
                payment_status: 'pending',
                created_at: new Date().toISOString(),
                payment_method: paymentMethod,
                is_gift: isGift,
                gift_note: isGift ? giftNote.trim() : ''
            };

            const { data: insertedOrder, error: insertError } = await supabase
                .from('orders')
                .insert(orderData)
                .select('id')
                .single();
            if (insertError) throw new Error(insertError.message);
            const docRef = { id: insertedOrder.id };
            console.log('📦 Order created:', docRef.id);

            // Save to Google Sheet
            await saveOrderToSheet({ ...orderData, id: docRef.id });

            if (paymentMethod === 'online') {
                const res = await loadRazorpay();

                if (!res) {
                    alert('Razorpay SDK failed to load. Are you online?');
                    setIsProcessing(false);
                    return;
                }

                // Initiate Payment
                const response = await fetch('/api/initiate_payment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        amount: currentTotal, // Use recalculated total
                        mobile: selectedAddress.phone,
                        transactionId: docRef.id
                    })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Payment initiation failed');
                }

                const options = {
                    key: data.key,
                    amount: data.amount,
                    currency: data.currency,
                    name: "Fresh Farm Himachal",
                    description: "Order Payment",
                    order_id: data.id,
                    handler: async function (response) {
                        try {
                            const verifyRes = await fetch('/api/verify_payment', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    razorpay_order_id: response.razorpay_order_id,
                                    razorpay_payment_id: response.razorpay_payment_id,
                                    razorpay_signature: response.razorpay_signature,
                                    orderId: docRef.id
                                })
                            });

                            const verifyData = await verifyRes.json();

                            if (verifyData.success) {
                                // Payment Successful
                                await supabase.from('orders').update({
                                    status: 'confirmed',
                                    payment_status: 'paid',
                                    payment_details: {
                                        razorpay_order_id: response.razorpay_order_id,
                                        razorpay_payment_id: response.razorpay_payment_id
                                    }
                                }).eq('id', docRef.id);

                                console.log('💳 Payment Verified. Order confirmed.');

                                if (user?.email) {
                                    sendOrderConfirmationEmail({ id: docRef.id, ...orderData }, user.email);
                                }

                                clearCart();
                                navigate('/order-confirmation', { state: { orderId: docRef.id } });
                            } else {
                                alert("Payment verification failed. Please contact support.");
                            }
                        } catch (err) {
                            console.error("Verification Error:", err);
                            alert("Payment verification error.");
                        }
                    },
                    prefill: {
                        name: selectedAddress.name,
                        email: user?.email || '',
                        contact: selectedAddress.phone
                    },
                    theme: {
                        color: "#2D3319"
                    }
                };

                const paymentObject = new window.Razorpay(options);
                paymentObject.on('payment.failed', function (response) {
                    alert(response.error.description);
                    setIsProcessing(false);
                });
                paymentObject.open();

            } else {
                // COD - No payment needed
                await supabase.from('orders').update({
                    status: 'confirmed',
                    payment_status: 'cod'
                }).eq('id', docRef.id);

                console.log('💳 COD Order confirmed.');

                if (user?.email) {
                    sendOrderConfirmationEmail({ id: docRef.id, ...orderData }, user.email);
                }

                clearCart();
                setIsProcessing(false);
                navigate('/order-confirmation', { state: { orderId: docRef.id } });
            }

        } catch (err) {
            console.error('Error placing order:', err);
            alert(`Failed to place order: ${err.message}`);
            setIsProcessing(false);
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="payment-page">
                <p>Cart is empty. <button onClick={() => navigate('/')}>Go Home</button></p>
            </div>
        );
    }

    const canLeaveAddress = !!selectedAddressId && isServiceable && !isChecking && !showAddressForm;

    return (
        <div className="payment-page">
            <header className="checkout-header">
                <button className="checkout-back" onClick={handleBack} aria-label="Go back">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M15 18l-6-6 6-6" />
                    </svg>
                </button>
                <div>
                    <p className="checkout-eyebrow">Step {step} of 3 &middot; {STEP_META[step - 1].label}</p>
                    <h1>Checkout</h1>
                </div>
            </header>

            <nav className="checkout-stepper" aria-label="Checkout progress">
                {STEP_META.map((meta, i) => {
                    const stepNo = i + 1;
                    const isDone = step > stepNo;
                    const isActive = step === stepNo;
                    return (
                        <React.Fragment key={meta.label}>
                            {i > 0 && <div className={`stepper-line ${step > i ? 'done' : ''}`} />}
                            <button
                                className={`stepper-step ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}
                                onClick={() => isDone && setStep(stepNo)}
                                disabled={!isDone && !isActive}
                                aria-current={isActive ? 'step' : undefined}
                            >
                                <span className="stepper-icon">
                                    {isDone ? <CheckIcon /> : <StepIcon index={i} />}
                                </span>
                                <span className="stepper-label">{meta.label}</span>
                            </button>
                        </React.Fragment>
                    );
                })}
            </nav>

            {step === 1 && (
                <div className="step-panel" key="step-1">
                    <section className="section glass">
                        <div className="section-header">
                            <h2>Where should we deliver?</h2>
                            {!showAddressForm && (
                                <button className="btn-text" onClick={() => setShowAddressForm(true)}>
                                    + Add New
                                </button>
                            )}
                        </div>

                        {showAddressForm ? (
                            <AddressForm
                                onSave={handleAddressSave}
                                onCancel={() => setShowAddressForm(false)}
                            />
                        ) : (
                            <div className="address-list">
                                {addresses.length === 0 ? (
                                    <p className="no-address">No addresses found. Please add one.</p>
                                ) : (
                                    addresses.map(addr => (
                                        <div
                                            key={addr.id}
                                            className={`address-card ${selectedAddressId === addr.id ? 'selected' : ''}`}
                                            onClick={() => setSelectedAddressId(addr.id)}
                                        >
                                            <div className="address-header">
                                                <span className="address-type">{addr.addressType}</span>
                                                <span className="address-name">{addr.name}</span>
                                            </div>
                                            <p>{addr.addressLine1}, {addr.addressLine2}</p>
                                            <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                                            <p>Phone: {addr.phone}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </section>
                </div>
            )}

            {step === 2 && (
                <div className="step-panel" key="step-2">
                    <section className="section">
                        <h2 className="method-title">How would you like to pay?</h2>
                        <div className="payment-methods">
                            <label className={`payment-option ${paymentMethod === 'online' ? 'selected' : ''}`}>
                                <input
                                    type="radio"
                                    name="payment"
                                    value="online"
                                    checked={paymentMethod === 'online'}
                                    onChange={() => setPaymentMethod('online')}
                                />
                                <span>Online Payment (UPI, Cards, NetBanking)</span>
                                <span className="pay-badge">Secured by Razorpay</span>
                            </label>

                            <label className={`payment-option ${paymentMethod === 'cod' ? 'selected' : ''}`}>
                                <input
                                    type="radio"
                                    name="payment"
                                    value="cod"
                                    checked={paymentMethod === 'cod'}
                                    onChange={() => setPaymentMethod('cod')}
                                />
                                <span>Cash on Delivery</span>
                            </label>
                        </div>
                    </section>
                </div>
            )}

            {step === 3 && (
                <div className="step-panel" key="step-3">
                    <section className="section">
                        <h2 className="method-title">Your Harvest</h2>
                        <div className="review-items">
                            {cartItems.map(item => (
                                <div key={item.id} className="review-item">
                                    <div className="review-thumb">
                                        <ProductImage productName={item.productName} varietyName={item.varietyName} />
                                    </div>
                                    <div className="review-info">
                                        <h4>{item.productName}</h4>
                                        <p>{item.varietyName} &middot; {item.quantityKg}kg &times; {item.quantity} box{item.quantity > 1 ? 'es' : ''}</p>
                                    </div>
                                    <span className="review-price">₹{formatINR(item.price * item.quantity)}</span>
                                </div>
                            ))}
                            <div className="review-subtotal">
                                <span>Subtotal</span>
                                <span>₹{formatINR(subtotal)}</span>
                            </div>
                        </div>
                    </section>

                    <section className="section summary-card">
                        <div className="summary-row">
                            <div className="summary-copy">
                                <p className="summary-label">Deliver to</p>
                                <p className="summary-value">
                                    {selectedAddress
                                        ? `${selectedAddress.name} · ${selectedAddress.addressLine1}, ${selectedAddress.city} - ${selectedAddress.pincode}`
                                        : 'No address selected'}
                                </p>
                            </div>
                            <button className="btn-text" onClick={() => setStep(1)}>Change</button>
                        </div>
                        <div className="summary-row">
                            <div className="summary-copy">
                                <p className="summary-label">Paying by</p>
                                <p className="summary-value">
                                    {paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online — UPI, Cards, NetBanking'}
                                </p>
                            </div>
                            <button className="btn-text" onClick={() => setStep(2)}>Change</button>
                        </div>
                    </section>

                    <section className="section gift-section">
                        <label className="gift-toggle">
                            <input
                                type="checkbox"
                                checked={isGift}
                                onChange={(e) => setIsGift(e.target.checked)}
                            />
                            <span className="gift-toggle-text">
                                <strong>This is a gift</strong>
                                <em>We&rsquo;ll include a handwritten note from the orchard</em>
                            </span>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <rect x="3" y="8" width="18" height="13" rx="1.5" />
                                <path d="M3 12h18M12 8v13" />
                                <path d="M12 8c-2.5 0-4.5-1.3-4.5-3S9 2.5 10.5 3.5 12 8 12 8zm0 0c2.5 0 4.5-1.3 4.5-3S15 2.5 13.5 3.5 12 8 12 8z" />
                            </svg>
                        </label>
                        {isGift && (
                            <textarea
                                className="gift-note-input"
                                placeholder="Your message — we'll write it by hand and tuck it into the box…"
                                maxLength={220}
                                value={giftNote}
                                onChange={(e) => setGiftNote(e.target.value)}
                                rows={3}
                            />
                        )}
                    </section>
                </div>
            )}

            <div className="trust-row">
                <div className="trust-item">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="4" y="10" width="16" height="10" rx="2" />
                        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                    </svg>
                    <span>Secure payment</span>
                </div>
                <div className="trust-item">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 21c0-9 4-14 14-16-1 10-6 14-12 14" />
                        <path d="M5 21c2-5 5-8 9-10" />
                    </svg>
                    <span>No chemicals, ever</span>
                </div>
                <div className="trust-item">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 8l-9-5-9 5v8l9 5 9-5V8z" />
                        <path d="M3.5 8.5L12 13l8.5-4.5" />
                        <path d="M12 13v8" />
                    </svg>
                    <span>Eco packaging</span>
                </div>
            </div>

            <div className="payment-footer">
                {step === 1 && (
                    <>
                        <div className="total-row">
                            <span>Shipping</span>
                            <span>{isChecking ? '...' : isServiceable ? `₹${formatINR(shippingCost)}${isEstimate ? ' (est.)' : ''}` : '—'}</span>
                        </div>
                        {isEstimate && <p className="estimate-note">Estimated rate &mdash; live courier rates apply on the deployed site.</p>}
                        {serviceError && <p className="error-text">{serviceError}</p>}
                        <button
                            className="pay-btn"
                            onClick={() => setStep(2)}
                            disabled={!canLeaveAddress}
                        >
                            {isChecking ? 'Checking location...' : 'Continue to Payment'}
                        </button>
                    </>
                )}

                {step === 2 && (
                    <>
                        <div className="total-row">
                            <span>Total to Pay</span>
                            <span>₹{formatINR(total)}</span>
                        </div>
                        <button className="pay-btn" onClick={() => setStep(3)}>
                            Review Order
                        </button>
                    </>
                )}

                {step === 3 && (
                    <>
                        <p className="delivery-promise">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M12 22c5-2 8-6.5 8-12V5l-8-3-8 3v5c0 5.5 3 10 8 12z" />
                            </svg>
                            Hand-picked after you order &middot; delivered fresh in 3&ndash;5 days
                        </p>
                        <div className="total-row">
                            <span>Shipping</span>
                            <span>₹{formatINR(shippingCost)}{isEstimate ? ' (est.)' : ''}</span>
                        </div>
                        <div className="total-row">
                            <span>Total to Pay</span>
                            <span>₹{formatINR(total)}</span>
                        </div>
                        <button
                            className="pay-btn"
                            onClick={handlePlaceOrder}
                            disabled={isProcessing || !selectedAddressId || !isServiceable}
                        >
                            {isProcessing ? 'Processing...' : paymentMethod === 'cod' ? 'Place Order' : `Pay ₹${formatINR(total)}`}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default Payment;
