import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for guest user first
        const guest = localStorage.getItem('guest_user');
        if (guest) {
            setUser(JSON.parse(guest));
            setLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                // Map Firebase user to our app's user format
                const mappedUser = {
                    id: currentUser.uid,
                    name: currentUser.displayName,
                    email: currentUser.email,
                    photoURL: currentUser.photoURL
                };
                setUser(mappedUser);
                localStorage.removeItem('guest_user'); // Clear guest if real user logs in
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const loginWithGoogle = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            // console.error("Error logging in with Google", error); 
            // Don't log here, let the UI handle it but rethrow
            throw error;
        }
    };

    const loginAsGuest = () => {
        const guestUser = {
            id: 'guest_123',
            name: 'Guest Farmer',
            email: 'guest@farmfresh.com',
            photoURL: 'https://ui-avatars.com/api/?name=Guest+Farmer&background=random'
        };
        setUser(guestUser);
        localStorage.setItem('guest_user', JSON.stringify(guestUser));
    };

    const logout = async () => {
        try {
            await signOut(auth);
            localStorage.removeItem('guest_user');
            setUser(null);
            // Clear admin session if any
            sessionStorage.removeItem('admin_auth');
            window.location.href = '/'; // Hard redirect to clear any state bugs
        } catch (error) {
            console.error("Error logging out", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, loginWithGoogle, loginAsGuest, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
