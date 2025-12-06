import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import ProductImage from '../components/ProductImage';
import './Cart.css';

const Cart = () => {
    const { cartItems, removeFromCart, getCartTotal, clearCart } = useCart();
    const navigate = useNavigate();

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
                <h1>Shopping Cart</h1>
                <button className="clear-btn" onClick={clearCart}>Clear Cart</button>
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
                                <span className="price-per-unit">₹{item.price}/box</span>
                                <span className="price-multiply">×</span>
                                <span className="quantity-display">{item.quantity}</span>
                                <span className="price-equals">=</span>
                                <span className="item-total">₹{item.price * item.quantity}</span>
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
                    <span>₹{subtotal}</span>
                </div>
                <div className="summary-row">
                    <span>Delivery Fee</span>
                    <span>{deliveryFee === 0 ? 'Free' : `₹${deliveryFee}`}</span>
                </div>
                <div className="summary-row total">
                    <span>Total</span>
                    <span>₹{total}</span>
                </div>

                <button
                    className="btn-primary checkout-btn"
                    onClick={() => navigate('/payment')}
                >
                    Proceed to Checkout
                </button>
            </div>
        </div>
    );
};

export default Cart;
