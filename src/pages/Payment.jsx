import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAddress } from '../context/AddressContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import AddressForm from '../components/AddressForm';
import { sendOrderConfirmationEmail } from '../services/emailService';
import { saveOrderToSheet } from '../services/sheetService';
import './Payment.css';

const Payment = () => {
    const navigate = useNavigate();
    const { cartItems, getCartTotal, clearCart } = useCart();
    const { addresses, getDefaultAddress, addAddress } = useAddress();
    const { user } = useAuth();

    const [selectedAddressId, setSelectedAddressId] = useState(getDefaultAddress()?.id);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('online');

    // Dynamic Shipping State
    const [shippingCost, setShippingCost] = useState(0);
    const [isServiceable, setIsServiceable] = useState(false);
    const [isChecking, setIsChecking] = useState(false);
    const [serviceError, setServiceError] = useState('');

    const subtotal = getCartTotal();
    const total = subtotal + shippingCost;

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
                } else {
                    setIsServiceable(false);
                    setServiceError(data.error || 'Location not serviceable');
                }
            } catch (err) {
                console.error("Serviceability Check Failed:", err);
                setServiceError('Could not verify serviceability');
            } finally {
                setIsChecking(false);
            }
        };

        if (selectedAddressId) {
            checkShipping();
        }
    }, [selectedAddressId]);

    const handleAddressSave = (newAddress) => {
        addAddress(newAddress);
        setShowAddressForm(false);
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

        const selectedAddress = addresses.find(a => a.id === selectedAddressId);

        try {
            // Create order in Firestore first
            const orderData = {
                userId: user?.id || 'guest',
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
                payment_method: paymentMethod
            };

            const docRef = await addDoc(collection(db, 'orders'), orderData);
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
                                await updateDoc(doc(db, 'orders', docRef.id), {
                                    status: 'confirmed',
                                    payment_status: 'paid',
                                    payment_details: {
                                        razorpay_order_id: response.razorpay_order_id,
                                        razorpay_payment_id: response.razorpay_payment_id
                                    }
                                });

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
                        color: "#3399cc"
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
                await updateDoc(doc(db, 'orders', docRef.id), {
                    status: 'confirmed',
                    payment_status: 'cod'
                });

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

    return (
        <div className="payment-page">
            <h1>Checkout</h1>

            <section className="section glass">
                <div className="section-header">
                    <h2>Delivery Address</h2>
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

            <section className="section">
                <h2>Payment Method</h2>
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
                        <span className="badge">Secured by Razorpay</span>
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

            <div className="payment-footer">
                <div className="total-row">
                    <span>Shipping</span>
                    <span>{isChecking ? '...' : isServiceable ? `₹${shippingCost}` : '-'}</span>
                </div>
                <div className="total-row">
                    <span>Total to Pay</span>
                    <span>{isChecking ? '...' : isServiceable ? `₹${total}` : '-'}</span>
                </div>
                {serviceError && <p className="error-text" style={{ color: 'red', textAlign: 'right', fontSize: '0.9rem' }}>{serviceError}</p>}

                <button
                    className="pay-btn"
                    onClick={handlePlaceOrder}
                    disabled={isProcessing || !selectedAddressId || !isServiceable || isChecking}
                    style={{ opacity: (!isServiceable || isChecking) ? 0.5 : 1 }}
                >
                    {isProcessing ? 'Processing...' : isChecking ? 'Checking location...' : `Pay ₹${total}`}
                </button>
            </div>
        </div>
    );
};

export default Payment;
