import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAddress } from '../context/AddressContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { initiateCashfreePayment } from '../services/cashfree';
import AddressForm from '../components/AddressForm';
import { sendOrderConfirmationEmail } from '../services/emailService';
import './Payment.css';

const Payment = () => {
    const navigate = useNavigate();
    const { cartItems, getCartTotal, clearCart } = useCart();
    const { addresses, getDefaultAddress, addAddress } = useAddress();
    const { user } = useAuth();

    const [selectedAddressId, setSelectedAddressId] = useState(getDefaultAddress()?.id);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('card');

    const subtotal = getCartTotal();
    const deliveryFee = subtotal > 500 ? 0 : 50;
    const total = subtotal + deliveryFee;

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

            // If online payment selected, initiate Cashfree
            if (paymentMethod === 'card' || paymentMethod === 'upi') {
                initiateCashfreePayment({
                    amount: total,
                    orderId: docRef.id,
                    customerDetails: {
                        name: selectedAddress.name,
                        phone: selectedAddress.phone,
                        email: user?.email || ''
                    },
                    onSuccess: async (paymentResponse) => {
                        console.log('✅ Payment successful!', paymentResponse);

                        // Update order status to paid
                        await updateDoc(doc(db, 'orders', docRef.id), {
                            payment_status: 'paid',
                            status: 'confirmed',
                            razorpay_payment_id: paymentResponse.razorpay_payment_id,
                            razorpay_order_id: paymentResponse.razorpay_order_id,
                            paid_at: new Date().toISOString()
                        });

                        // Send confirmation email
                        if (user?.email) {
                            sendOrderConfirmationEmail({ id: docRef.id, ...orderData }, user.email);
                        }

                        clearCart();
                        setIsProcessing(false);
                        navigate('/order-confirmation', { state: { orderId: docRef.id } });
                    },
                    onFailure: async (error) => {
                        console.error('❌ Payment failed:', error);

                        // Update order status to failed
                        await updateDoc(doc(db, 'orders', docRef.id), {
                            payment_status: 'failed',
                            status: 'cancelled',
                            payment_error: error
                        });

                        setIsProcessing(false);
                        alert(`Payment failed: ${error}\nPlease try again.`);
                    }

                });
            } else {
                // COD - No payment needed
                await updateDoc(doc(db, 'orders', docRef.id), {
                    status: 'confirmed',
                    payment_status: 'cod'
                });

                console.log('💳 COD Order confirmed. User email:', user?.email);

                // Send confirmation email
                if (user?.email) {
                    console.log('🔔 Calling sendOrderConfirmationEmail...');
                    sendOrderConfirmationEmail({ id: docRef.id, ...orderData }, user.email);
                } else {
                    console.warn('⚠️ No user email found, skipping email');
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
                    <label className={`payment-option ${paymentMethod === 'card' ? 'selected' : ''}`}>
                        <input
                            type="radio"
                            name="payment"
                            value="card"
                            checked={paymentMethod === 'card'}
                            onChange={() => setPaymentMethod('card')}
                        />
                        <span>Credit/Debit Card</span>
                    </label>

                    {paymentMethod === 'card' && (
                        <div className="card-form">
                            <input type="text" placeholder="Card Number" className="input-field" />
                            <div className="form-row">
                                <input type="text" placeholder="MM/YY" className="input-field" />
                                <input type="text" placeholder="CVV" className="input-field" />
                            </div>
                        </div>
                    )}

                    <label className={`payment-option ${paymentMethod === 'upi' ? 'selected' : ''}`}>
                        <input
                            type="radio"
                            name="payment"
                            value="upi"
                            checked={paymentMethod === 'upi'}
                            onChange={() => setPaymentMethod('upi')}
                        />
                        <span>UPI</span>
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
                    <span>Total to Pay</span>
                    <span>₹{total}</span>
                </div>
                <button
                    className="pay-btn"
                    onClick={handlePlaceOrder}
                    disabled={isProcessing || !selectedAddressId}
                >
                    {isProcessing ? 'Processing...' : `Pay ₹${total}`}
                </button>
            </div>
        </div>
    );
};

export default Payment;
