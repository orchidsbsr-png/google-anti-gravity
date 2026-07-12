import React, { createContext, useContext, useState, useEffect } from 'react';

// Lightweight wishlist — product ids in localStorage, no login needed.
const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

const STORAGE_KEY = 'naliban_wishlist';

export const WishlistProvider = ({ children }) => {
    const [ids, setIds] = useState(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            const parsed = raw ? JSON.parse(raw) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
        } catch { /* storage full/blocked — wishlist just won't persist */ }
    }, [ids]);

    const isWished = (productId) => ids.includes(Number(productId));

    const toggleWish = (productId) => {
        const id = Number(productId);
        setIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    return (
        <WishlistContext.Provider value={{ ids, count: ids.length, isWished, toggleWish }}>
            {children}
        </WishlistContext.Provider>
    );
};
