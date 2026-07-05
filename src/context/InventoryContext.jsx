import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';

const InventoryContext = createContext();

export const useInventory = () => useContext(InventoryContext);

export const InventoryProvider = ({ children }) => {
    const [inventory, setInventory] = useState([]);
    const [settings, setSettings] = useState({ shop_open: true });
    const [loading, setLoading] = useState(true);

    const fetchInventory = useCallback(async () => {
        const { data, error } = await supabase
            .from('inventory')
            .select('*')
            .order('variety_id', { ascending: true });

        if (error) {
            console.error('❌ Supabase inventory error:', error.message);
            return;
        }
        setInventory((data || []).map(row => ({
            ...row,
            pack_sizes: row.pack_sizes || []
        })));
    }, []);

    const fetchSettings = useCallback(async () => {
        const { data, error } = await supabase
            .from('settings')
            .select('*')
            .eq('id', 1)
            .maybeSingle();

        if (error) {
            console.error('❌ Supabase settings error:', error.message);
            return;
        }
        if (data) setSettings(data);
    }, []);

    useEffect(() => {
        Promise.all([fetchInventory(), fetchSettings()])
            .finally(() => setLoading(false));

        const channel = supabase
            .channel('inventory-settings')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory' }, () => fetchInventory())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, () => fetchSettings())
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [fetchInventory, fetchSettings]);

    const getStock = (varietyId, sizeKg) => {
        const item = inventory.find(i => i.variety_id === parseInt(varietyId));
        if (!item || !item.is_active || !item.pack_sizes) return 0;
        const pack = item.pack_sizes.find(p => p.weight === Number(sizeKg));
        return pack ? pack.stock : 0;
    };

    const isInStock = (varietyId, sizeKg) => {
        return getStock(varietyId, sizeKg) > 0;
    };

    const updateInventory = async (varietyId, isActive, isBestseller, pricePerKg, packSizes) => {
        try {
            const { error } = await supabase
                .from('inventory')
                .upsert({
                    variety_id: parseInt(varietyId),
                    is_active: Boolean(isActive ?? true),
                    is_bestseller: Boolean(isBestseller ?? false),
                    price_per_kg: Number(pricePerKg) || 0,
                    pack_sizes: packSizes, // [{weight, stock, price}]
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;
            await fetchInventory();
            return true;
        } catch (err) {
            console.error('❌ Error updating inventory:', err.message);
            alert(`Error updating inventory: ${err.message}`);
            return false;
        }
    };

    const updateShopStatus = async (isOpen) => {
        try {
            const { error } = await supabase
                .from('settings')
                .upsert({ id: 1, shop_open: isOpen, updated_at: new Date().toISOString() });
            if (error) throw error;
            await fetchSettings();
            return true;
        } catch (err) {
            console.error('Error updating shop status:', err.message);
            return false;
        }
    };

    return (
        <InventoryContext.Provider value={{
            inventory,
            settings,
            loading,
            getStock,
            isInStock,
            updateInventory,
            updateShopStatus
        }}>
            {children}
        </InventoryContext.Provider>
    );
};
