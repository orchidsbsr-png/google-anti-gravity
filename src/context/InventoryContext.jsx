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

    const updateInventory = async (varietyId, isActive, isBestseller, pricePerKg, packSizes, isPreorder = null) => {
        try {
            const row = {
                variety_id: parseInt(varietyId),
                is_active: Boolean(isActive ?? true),
                is_bestseller: Boolean(isBestseller ?? false),
                price_per_kg: Number(pricePerKg) || 0,
                pack_sizes: packSizes, // [{weight, stock, price}]
                updated_at: new Date().toISOString()
            };
            // Only sent when explicitly toggled, so databases without the
            // is_preorder column keep working until it's added.
            if (isPreorder !== null && isPreorder !== undefined) {
                row.is_preorder = Boolean(isPreorder);
            }
            const { error } = await supabase.from('inventory').upsert(row);

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
        const previous = settings;
        // Optimistic: flip the UI immediately, revert if the write fails
        setSettings(s => ({ ...s, shop_open: isOpen }));
        try {
            const { error } = await supabase
                .from('settings')
                .upsert({ id: 1, shop_open: isOpen, updated_at: new Date().toISOString() });
            if (error) throw error;
            await fetchSettings();
            return true;
        } catch (err) {
            console.error('Error updating shop status:', err.message);
            setSettings(previous);
            alert(`Could not update shop status: ${err.message}`);
            return false;
        }
    };

    // COD was a dev-testing convenience — OFF unless the admin switch
    // (settings.cod_enabled) is explicitly on.
    const codEnabled = settings?.cod_enabled === true;

    const updateCodEnabled = async (enabled) => {
        try {
            const { error } = await supabase
                .from('settings')
                .upsert({ id: 1, cod_enabled: Boolean(enabled), updated_at: new Date().toISOString() });
            if (error) throw error;
            await fetchSettings();
            return true;
        } catch (err) {
            console.error('Error updating cod_enabled:', err.message);
            alert(`Could not save the COD setting: ${err.message}`);
            return false;
        }
    };

    // Storefront "Selling fast" kicks in when a variety's total stock is at
    // or below this many units (admin-configurable, defaults to 10).
    const sellingFastThreshold = Number(settings?.selling_fast_threshold) > 0
        ? Number(settings.selling_fast_threshold)
        : 10;

    const updateSellingFastThreshold = async (n) => {
        const value = Math.max(1, parseInt(n) || 10);
        try {
            const { error } = await supabase
                .from('settings')
                .upsert({ id: 1, selling_fast_threshold: value, updated_at: new Date().toISOString() });
            if (error) throw error;
            await fetchSettings();
            return true;
        } catch (err) {
            console.error('Error updating selling_fast_threshold:', err.message);
            alert(`Could not save the threshold: ${err.message}`);
            return false;
        }
    };

    // Drives the homepage ticker's "Now picking — …" line
    const updateNowPicking = async (text) => {
        try {
            const { error } = await supabase
                .from('settings')
                .upsert({ id: 1, now_picking: text, updated_at: new Date().toISOString() });
            if (error) throw error;
            await fetchSettings();
            return true;
        } catch (err) {
            console.error('Error updating now_picking:', err.message);
            alert(`Could not save: ${err.message}`);
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
            updateShopStatus,
            updateNowPicking,
            sellingFastThreshold,
            updateSellingFastThreshold,
            codEnabled,
            updateCodEnabled
        }}>
            {children}
        </InventoryContext.Provider>
    );
};
