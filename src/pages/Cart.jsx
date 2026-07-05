import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import ProductImage from '../components/ProductImage';
import './Cart.css';

const Cart = () => {
    const { cartItems, removeFromCart, getCartTotal, clearCart } = useCart();
    const { t } = useLanguage();
    const navigate = useNavigate();

    const formatINR = (n) => Number(n || 0).toLocaleString('en-IN');
    const subtotal = getCartTotal();
    const deliveryFee = subtotal > 500 ? 0 : 50;
    const total = subtotal + deliveryFee;

    if (cartItems.length === 0) {
        return (
            <div className="cart-page empty">
                <div className="empty-cart-message glass">
                    <h2>Your cart is empty</h2>
                    <p>Looks like you haven't added any fruits yet.</p>
                    <Link to="/search" className="btn-primary">Start Shopping</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-page">
            <div className="cart-header">
                <h1>{t('cart.title1')} <em style={{ fontWeight: 300 }}>{t('cart.title2')}</em></h1>
                <button className="clear-btn" onClick={clearCart}>{t('cart.clear')}</button>
            </div>

            <div className="cart-items">
                {cartItems.map(item => (
                    <div key={item.id} className="cart-item glass">
                        <div className="cart-item-image">
                            <ProductImage productName={item.productName} varietyName={item.varietyName} />
                        </div>
                        <div className="cart-item-details">
                            <h3>{item.productName}</h3>
                            <p className="variety-name">{item.varietyName}</p>
                            <p className="item-weight">Size: {item.quantityKg}kg per box</p>
                            <p className="item-quantity">Quantity: {item.quantity} box{item.quantity > 1 ? 'es' : ''}</p>
                            <div className="item-pricing">
                                <span className="price-per-unit">₹{formatINR(item.price)}/box</span>
                                <span className="price-multiply">×</span>
                                <span className="quantity-display">{item.quantity}</span>
                                <span className="price-equals">=</span>
                                <span className="item-total">₹{formatINR(item.price * item.quantity)}</span>
                            </div>
                        </div>
                        <button
                            className="remove-btn"
                            onClick={() => removeFromCart(item.id)}
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>

            <div className="cart-summary glass-strong">
                <div className="summary-row">
                    <span>Subtotal</span>
                    <span>₹{formatINR(subtotal)}</span>
                </div>
                <div className="summary-row">
                    <span>Delivery Fee</span>
                    <span>{deliveryFee === 0 ? 'Free' : `₹${formatINR(deliveryFee)}`}</span>
                </div>
                <div className="summary-row total">
                    <span>Total</span>
                    <span>₹{formatINR(total)}</span>
                </div>

                <button
                    className="btn-primary checkout-btn"
                    onClick={() => navigate('/payment')}
                >
                    {t('cart.checkout')}
                </button>
            </div>
        </div>
    );
};

export default Cart;
