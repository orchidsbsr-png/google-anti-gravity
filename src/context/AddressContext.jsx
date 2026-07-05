import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../supabase';

const AddressContext = createContext();

export const useAddress = () => useContext(AddressContext);

export const AddressProvider = ({ children }) => {
    const { user } = useAuth();
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAddresses = useCallback(async () => {
        if (!user) return;
        const { data, error } = await supabase
            .from('addresses')
            .select('id, data')
            .eq('user_id', user.id)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error loading addresses:', error);
            return;
        }
        setAddresses((data || []).map(row => ({ id: row.id, ...row.data })));
    }, [user]);

    useEffect(() => {
        if (!user) {
            setAddresses([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        fetchAddresses().finally(() => setLoading(false));

        // Live updates (mirrors the old Firestore onSnapshot behavior)
        const channel = supabase
            .channel(`addresses-${user.id}`)
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'addresses', filter: `user_id=eq.${user.id}` },
                () => fetchAddresses()
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [user, fetchAddresses]);

    const validateAddress = (address) => {
        const errors = {};
        if (!address.name?.trim()) errors.name = "Name is required";
        if (!address.phone?.match(/^[6-9]\d{9}$/)) errors.phone = "Valid 10-digit Indian mobile number required";
        if (!address.pincode?.match(/^\d{6}$/)) errors.pincode = "Valid 6-digit Pincode required";
        if (!address.addressLine1?.trim()) errors.addressLine1 = "Address Line 1 is required";
        if (!address.city?.trim()) errors.city = "City is required";
        if (!address.state?.trim()) errors.state = "State is required";

        return {
            isValid: Object.keys(errors).length === 0,
            errors: errors
        };
    };

    const addAddress = async (newAddress) => {
        if (!user) return;
        const { error } = await supabase
            .from('addresses')
            .insert({ user_id: user.id, data: newAddress });
        if (error) console.error("Error adding address:", error);
        await fetchAddresses();
    };

    const updateAddress = async (id, updatedAddress) => {
        if (!user) return;
        const { id: _drop, ...data } = updatedAddress;
        const { error } = await supabase
            .from('addresses')
            .update({ data })
            .eq('id', id)
            .eq('user_id', user.id);
        if (error) console.error("Error updating address:", error);
        await fetchAddresses();
    };

    const deleteAddress = async (id) => {
        if (!user) return;
        const { error } = await supabase
            .from('addresses')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);
        if (error) console.error("Error deleting address:", error);
        await fetchAddresses();
    };

    const getDefaultAddress = () => {
        return addresses.length > 0 ? addresses[0] : null;
    };

    return (
        <AddressContext.Provider value={{
            addresses,
            loading,
            addAddress,
            updateAddress,
            deleteAddress,
            validateAddress,
            getDefaultAddress
        }}>
            {children}
        </AddressContext.Provider>
    );
};
