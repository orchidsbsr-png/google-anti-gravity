import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../supabase';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const { user } = useAuth();
    const [cartItems, setCartItems] = useState([]);
    // Most recently added item — drives the "added to basket" toast.
    // addedAt makes repeat adds of the same item retrigger the toast.
    const [lastAdded, setLastAdded] = useState(null);

    const fetchCart = useCallback(async () => {
        if (!user) return;
        const { data, error } = await supabase
            .from('carts')
            .select('item_id, data')
            .eq('user_id', user.id);

        if (error) {
            console.error('Error loading cart:', error);
            return;
        }
        setCartItems((data || []).map(row => ({ ...row.data, id: row.item_id })));
    }, [user]);

    useEffect(() => {
        if (!user) {
            setCartItems([]);
            return;
        }

        fetchCart();

        const channel = supabase
            .channel(`cart-${user.id}`)
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'carts', filter: `user_id=eq.${user.id}` },
                () => fetchCart()
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [user, fetchCart]);

    const addToCart = async (product, variety, quantityKg, numBoxes, inventory) => {
        if (!user) {
            alert("Please login to add items to cart");
            return;
        }

        const cartItemId = `${variety.id}-${quantityKg}`;
        const existingItem = cartItems.find(item => item.id === cartItemId);

        // Single source of truth: the live price-per-kg (admin-editable in
        // inventory, falling back to the catalog default) × pack weight.
        // Stored pack prices are ignored — they drift when rates change.
        const invItem = inventory?.find(i => i.variety_id === variety.id);
        const perKg = Number(invItem?.price_per_kg) > 0 ? Number(invItem.price_per_kg) : variety.price_per_kg;
        const pricePerBox = Math.round(perKg * quantityKg);

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

        const { error } = await supabase
            .from('carts')
            .upsert({ user_id: user.id, item_id: cartItemId, data: newItem });

        if (error) {
            console.error("Error adding to cart:", error);
            return false;
        }
        await fetchCart();
        setLastAdded({ ...newItem, addedBoxes: numBoxes, addedAt: Date.now() });
        return true;
    };

    const removeFromCart = async (itemId) => {
        if (!user) return;
        const { error } = await supabase
            .from('carts')
            .delete()
            .eq('user_id', user.id)
            .eq('item_id', itemId);
        if (error) console.error("Error removing from cart:", error);
        await fetchCart();
    };

    const updateQuantity = async (itemId, newQuantity) => {
        if (!user) return;
        if (newQuantity < 1) {
            removeFromCart(itemId);
            return;
        }

        const item = cartItems.find(i => i.id === itemId);
        if (item) {
            const { error } = await supabase
                .from('carts')
                .upsert({ user_id: user.id, item_id: itemId, data: { ...item, quantity: newQuantity } });
            if (error) console.error("Error updating quantity:", error);
            await fetchCart();
        }
    };

    const clearCart = async () => {
        if (!user) return;
        const { error } = await supabase
            .from('carts')
            .delete()
            .eq('user_id', user.id);
        if (error) console.error("Error clearing cart:", error);
        await fetchCart();
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
            getCartItemCount,
            lastAdded
        }}>
            {children}
        </CartContext.Provider>
    );
};
