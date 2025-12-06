import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot, query } from 'firebase/firestore';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const { user } = useAuth();
    const [cartItems, setCartItems] = useState([]);

    useEffect(() => {
        if (!user) {
            setCartItems([]);
            return;
        }

        const q = query(collection(db, `users/${user.id}/cart`));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id // Use varietyId as doc ID
            }));
            setCartItems(items);
        });

        return () => unsubscribe();
    }, [user]);

    const addToCart = async (product, variety, quantityKg, numBoxes, inventory) => {
        if (!user) {
            alert("Please login to add items to cart");
            return;
        }

        const cartItemId = `${variety.id}-${quantityKg}`;
        const existingItem = cartItems.find(item => item.id === cartItemId);

        // Calculate price from inventory if available, otherwise use variety price_per_kg
        const invItem = inventory?.find(i => i.variety_id === variety.id);
        let pricePerBox;
        if (invItem && quantityKg === 5 && invItem.price_5kg) {
            pricePerBox = invItem.price_5kg;
        } else if (invItem && quantityKg === 10 && invItem.price_10kg) {
            pricePerBox = invItem.price_10kg;
        } else {
            pricePerBox = variety.price_per_kg * quantityKg;
        }

        const newItem = {
            id: cartItemId,
            productId: product.id,
            productName: product.name,
            varietyId: variety.id,
            varietyName: variety.name,
            quantityKg: quantityKg,
            price: pricePerBox,
            image: variety.image_path || product.image_path,
            quantity: existingItem ? existingItem.quantity + numBoxes : numBoxes
        };

        try {
            await setDoc(doc(db, `users/${user.id}/cart`, cartItemId), newItem);
            return true;
        } catch (err) {
            console.error("Error adding to cart:", err);
            return false;
        }
    };

    const removeFromCart = async (itemId) => {
        if (!user) return;
        try {
            await deleteDoc(doc(db, `users/${user.id}/cart`, itemId));
        } catch (err) {
            console.error("Error removing from cart:", err);
        }
    };

    const updateQuantity = async (itemId, newQuantity) => {
        if (!user) return;
        if (newQuantity < 1) {
            removeFromCart(itemId);
            return;
        }

        const item = cartItems.find(i => i.id === itemId);
        if (item) {
            try {
                await setDoc(doc(db, `users/${user.id}/cart`, itemId), { ...item, quantity: newQuantity });
            } catch (err) {
                console.error("Error updating quantity:", err);
            }
        }
    };

    const clearCart = async () => {
        if (!user) return;
        // Batch delete would be better but simple loop for now
        for (const item of cartItems) {
            await deleteDoc(doc(db, `users/${user.id}/cart`, item.id));
        }
    };

    const getCartTotal = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const getCartItemCount = () => {
        return cartItems.length;
    };

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            getCartTotal,
            getCartItemCount
        }}>
            {children}
        </CartContext.Provider>
    );
};
