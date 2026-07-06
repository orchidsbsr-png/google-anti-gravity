import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import ProductImage from './ProductImage';
import './CartToast.css';

// Nike-style "added to basket" confirmation. Slides in whenever
// something lands in the cart; clicking it goes straight to the cart.
const CartToast = () => {
    const { lastAdded } = useCart();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const location = useLocation();
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (!lastAdded) return;
        setVisible(true);
        const timer = setTimeout(() => setVisible(false), 4500);
        return () => clearTimeout(timer);
    }, [lastAdded]);

    if (!lastAdded || !visible) return null;
    // Pointless on the cart itself; never interrupt checkout
    if (location.pathname === '/cart' || location.pathname === '/payment') return null;

    const goToCart = () => {
        setVisible(false);
        navigate('/cart');
    };

    return (
        <div
            className="cart-toast"
            role="status"
            onClick={goToCart}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') goToCart(); }}
            tabIndex={0}
        >
            <div className="cart-toast-thumb">
                <ProductImage productName={lastAdded.productName} varietyName={lastAdded.varietyName} />
            </div>
            <div className="cart-toast-copy">
                <p className="cart-toast-title">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M5 13l4 4L19 7" />
                    </svg>
                    {t('toast.added')}
                </p>
                <p className="cart-toast-item">
                    {lastAdded.productName} &middot; {lastAdded.varietyName} &middot; {lastAdded.quantityKg}kg
                </p>
                <p className="cart-toast-view">{t('toast.view')} &rarr;</p>
            </div>
            <button
                className="cart-toast-close"
                onClick={(e) => { e.stopPropagation(); setVisible(false); }}
                aria-label="Dismiss"
            >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                    <line x1="6" y1="6" x2="18" y2="18" />
                    <line x1="18" y1="6" x2="6" y2="18" />
                </svg>
            </button>
        </div>
    );
};

export default CartToast;
