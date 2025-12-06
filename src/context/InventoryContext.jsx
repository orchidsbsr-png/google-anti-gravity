import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, doc, onSnapshot, setDoc } from 'firebase/firestore';

const InventoryContext = createContext();

export const useInventory = () => useContext(InventoryContext);

export const InventoryProvider = ({ children }) => {
    const [inventory, setInventory] = useState([]);
    const [settings, setSettings] = useState({ shop_open: true });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log('🔵 Setting up Firestore inventory listener...');
        const unsubInventory = onSnapshot(
            collection(db, 'inventory'),
            (snapshot) => {
                console.log('✅ Inventory snapshot received:', snapshot.docs.length, 'items');
                const items = snapshot.docs.map(doc => ({ variety_id: parseInt(doc.id), ...doc.data() }));

                if (items.length === 0) {
                    console.log('⚠️ No inventory found in Firestore, initializing from mockData...');
                    initializeInventory();
                } else {
                    console.log('✅ Loaded inventory from Firestore:', items);
                    setInventory(items);
                }
                setLoading(false);
            },
            (error) => {
                console.error('❌ Firestore inventory error:', error);
                console.error('❌ Error code:', error.code);
                console.error('❌ Error message:', error.message);
                if (error.code === 'permission-denied') {
                    console.error('⛔ PERMISSION DENIED: You need to set up Firestore security rules!');
                    console.error('📖 See FIRESTORE_SETUP.md for instructions');
                }
                setLoading(false);
            }
        );

        const unsubSettings = onSnapshot(
            doc(db, 'settings', 'shop'),
            (doc) => {
                if (doc.exists()) {
                    setSettings(doc.data());
                } else {
                    console.log('⚠️ No settings found, creating default...');
                    setDoc(doc.ref, { shop_open: true });
                }
            },
            (error) => {
                console.error('❌ Firestore settings error:', error);
            }
        );

        return () => {
            unsubInventory();
            unsubSettings();
        };
    }, []);

    const initializeInventory = async () => {
        const { INITIAL_INVENTORY } = await import('../data/mockData');
        for (const item of INITIAL_INVENTORY) {
            await setDoc(doc(db, 'inventory', item.variety_id.toString()), item);
        }
    };

    const getStock = (varietyId, sizeKg) => {
        const item = inventory.find(i => i.variety_id === parseInt(varietyId));
        if (!item || !item.is_active) return 0;
        return sizeKg === 5 ? item.stock_5kg : item.stock_10kg;
    };

    const isInStock = (varietyId, sizeKg) => {
        return getStock(varietyId, sizeKg) > 0;
    };

    const updateInventory = async (varietyId, stock5kg, stock10kg, isActive, isBestseller, price5kg, price10kg, pricePerKg) => {
        try {
            console.log('📝 Updating inventory for variety:', varietyId);
            const ref = doc(db, 'inventory', varietyId.toString());

            // Ensure NO undefined values - Firestore rejects them
            const data = {
                stock_5kg: Number(stock5kg) || 0,
                stock_10kg: Number(stock10kg) || 0,
                is_active: Boolean(isActive ?? true),
                is_bestseller: Boolean(isBestseller ?? false),
                price_5kg: Number(price5kg) || 0,
                price_10kg: Number(price10kg) || 0,
                price_per_kg: Number(pricePerKg) || 0
            };

            console.log('📝 Data to save:', data);
            await setDoc(ref, data, { merge: true });
            console.log('✅ Inventory updated successfully!');
            return true;
        } catch (err) {
            console.error('❌ Error updating inventory:', err);
            console.error('❌ Error code:', err.code);
            if (err.code === 'permission-denied') {
                alert('Permission denied! Please set up Firestore security rules. See FIRESTORE_SETUP.md');
            } else if (err.code === 'invalid-argument') {
                console.error('❌ Invalid data - one or more fields has undefined value');
                alert('Error: Invalid data. Check console for details.');
            }
            return false;
        }
    };

    const updateShopStatus = async (isOpen) => {
        try {
            await setDoc(doc(db, 'settings', 'shop'), { shop_open: isOpen }, { merge: true });
            return true;
        } catch (err) {
            console.error('Error updating shop status:', err);
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
