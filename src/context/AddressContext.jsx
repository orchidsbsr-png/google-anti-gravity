import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../firebase';
import { collection, doc, addDoc, deleteDoc, updateDoc, onSnapshot, query } from 'firebase/firestore';

const AddressContext = createContext();

export const useAddress = () => useContext(AddressContext);

export const AddressProvider = ({ children }) => {
    const { user } = useAuth();
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setAddresses([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        const q = query(collection(db, `users/${user.id}/addresses`));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const loadedAddresses = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setAddresses(loadedAddresses);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

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
        try {
            await addDoc(collection(db, `users/${user.id}/addresses`), newAddress);
        } catch (err) {
            console.error("Error adding address:", err);
        }
    };

    const updateAddress = async (id, updatedAddress) => {
        if (!user) return;
        try {
            await updateDoc(doc(db, `users/${user.id}/addresses`, id), updatedAddress);
        } catch (err) {
            console.error("Error updating address:", err);
        }
    };

    const deleteAddress = async (id) => {
        if (!user) return;
        try {
            await deleteDoc(doc(db, `users/${user.id}/addresses`, id));
        } catch (err) {
            console.error("Error deleting address:", err);
        }
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
