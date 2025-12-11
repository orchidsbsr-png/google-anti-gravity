import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAddress } from '../context/AddressContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
// Removed: import { initiateCashfreePayment } from '../services/cashfree';
import AddressForm from '../components/AddressForm';
import { sendOrderConfirmationEmail } from '../services/emailService';
import { saveOrderToBaserow } from '../services/baserow';
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

    // Shipping State
    const [shippingCost, setShippingCost] = useState(50); // Fallback
    const [isServiceable, setIsServiceable] = useState(true);
    const [serviceError, setServiceError] = useState('');
    const [checkingServiceability, setCheckingServiceability] = useState(false);

    const subtotal = getCartTotal();
    const total = subtotal + shippingCost; // Use dynamic shipping cost

    // Effect to check serviceability when address changes
    React.useEffect(() => {
        const checkShipping = async () => {
            const address = addresses.find(a => a.id === selectedAddressId);
            if (!address || !address.pincode) return;

            setCheckingServiceability(true);
            setServiceError('');
            setIsServiceable(true);

            try {
                // Determine cart weight (approx 1kg per item if not specified, or use item.quantityKg)
                const totalWeight = cartItems.reduce((acc, item) => acc + (parseFloat(item.quantityKg) || 0.5) * item.quantity, 0);

                const query = new URLSearchParams({
                    pincode: address.pincode,
                    weight: totalWeight,
                    payment_mode: paymentMethod === 'cod' ? 'COD' : 'Prepaid',
                    cart_value: subtotal
                });

                const res = await fetch(`/api/check_serviceability?${query}`);
                const data = await res.json();

                if (data.is_serviceable) {
                    setShippingCost(data.shipping_cost);
                    setIsServiceable(true);
                } else {
                    setIsServiceable(false);
                    setServiceError(data.message || 'Location not serviceable');
                    setShippingCost(0);
                }
            } catch (err) {
                console.error("Serviceability Check Failed:", err);
                // Fallback to standard rate if API fails (optional, or block checkout)
                // For now, we block or warn. 
            } finally {
                setCheckingServiceability(false);
            }
        };

        if (selectedAddressId) {
            checkShipping();
        }
    }, [selectedAddressId, paymentMethod, subtotal, cartItems, addresses]);

    const handleAddressSave = (newAddress) => {
        addAddress(newAddress);
        setShowAddressForm(false);
    };


    const handlePlaceOrder = async () => {
        if (!selectedAddressId) {
            alert('Please select a delivery address');
            return;
        }

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
                total_price: total,
                status: 'pending',
                payment_status: 'pending',
                created_at: new Date().toISOString(),
                payment_method: paymentMethod
            };

            const docRef = await addDoc(collection(db, 'orders'), orderData);
            console.log('📦 Order created:', docRef.id);

            // Save to Baserow
            await saveOrderToBaserow({ ...orderData, id: docRef.id });

            // If online payment selected, initiate PhonePe (Standard Checkout)
            if (paymentMethod === 'online') {
                try {
                    const response = await fetch('/api/initiate_payment', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            amount: total,
                            mobile: selectedAddress.phone,
                            // We pass the Firestore ID so we can track it. 
                            // The backend will use this (or generate one if we didn't send it).
                            transactionId: docRef.id
                        })
                    });

                    const data = await response.json();

                    if (data.success) {
                        // Redirect to PhonePe
                        window.location.href = data.url;
                    } else {
                        console.error("Payment Init Failed:", data);
                        throw new Error(data.error || 'Payment initiation failed');
                    }
                } catch (err) {
                    console.error('Payment Error:', err);
                    alert(`Error: ${err.message}`);
                    setIsProcessing(false);
                }
            } else {
                // COD - No payment needed
                await updateDoc(doc(db, 'orders', docRef.id), {
                    status: 'confirmed',
                    payment_status: 'cod'
                });

                console.log('💳 COD Order confirmed. User email:', user?.email);

                // Send confirmation email
                if (user?.email) {
                    sendOrderConfirmationEmail({ id: docRef.id, ...orderData }, user.email);
                }

                clearCart();
                setIsProcessing(false);
                navigate('/order-confirmation', { state: { orderId: docRef.id } });
            }

        } catch (err) {
            console.error('Error placing order:', err);
            alert('Failed to place order. Please try again.');
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
                        <span className="badge">PhonePe Protected</span>
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
                    <span>{checkingServiceability ? '...' : `₹${shippingCost}`}</span>
                </div>
                <div className="total-row">
                    <span>Total to Pay</span>
                    <span>₹{total}</span>
                </div>
                {serviceError && <p className="error-text" style={{ color: 'red', textAlign: 'right' }}>{serviceError}</p>}
                <button
                    className="pay-btn"
                    onClick={handlePlaceOrder}
                    disabled={isProcessing || !selectedAddressId || !isServiceable || checkingServiceability}
                    style={{ opacity: (!isServiceable || checkingServiceability) ? 0.5 : 1 }}
                >
                    {isProcessing ? 'Processing...' : checkingServiceability ? 'Calculating...' : `Pay ₹${total}`}
                </button>
            </div>
        </div>
    );
};

export default Payment;
