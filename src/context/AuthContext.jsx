import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const mapSupabaseUser = (sbUser) => ({
    id: sbUser.id,
    name: sbUser.user_metadata?.full_name || sbUser.user_metadata?.name || sbUser.email || sbUser.phone,
    // Phone-only accounts have no email — fall back to the phone number so
    // orders can still be grouped per user.
    email: sbUser.email || sbUser.phone || '',
    photoURL: sbUser.user_metadata?.avatar_url || sbUser.user_metadata?.picture || null,
});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for guest user first
        const guest = localStorage.getItem('guest_user');
        if (guest) {
            setUser(JSON.parse(guest));
            setLoading(false);
        }

        // Restore session and listen for auth changes
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                setUser(mapSupabaseUser(session.user));
                localStorage.removeItem('guest_user');
            }
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                setUser(mapSupabaseUser(session.user));
                localStorage.removeItem('guest_user');
            } else if (!localStorage.getItem('guest_user')) {
                setUser(null);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const loginWithGoogle = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: `${window.location.origin}/auth/callback` },
        });
        if (error) throw error;
    };

    const loginWithFacebook = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'facebook',
            options: { redirectTo: `${window.location.origin}/auth/callback` },
        });
        if (error) throw error;
    };

    // Phone login: SMS OTP in two steps (requires the Phone provider +
    // an SMS gateway to be enabled in the Supabase dashboard)
    const sendPhoneOtp = async (phone) => {
        const { error } = await supabase.auth.signInWithOtp({ phone });
        if (error) throw error;
    };

    const verifyPhoneOtp = async (phone, token) => {
        const { error } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' });
        if (error) throw error;
    };

    const loginAsGuest = () => {
        const guestUser = {
            id: 'guest_123',
            name: 'Guest Farmer',
            email: 'guest@nalibanfarms.in',
            photoURL: 'https://ui-avatars.com/api/?name=Guest+Farmer&background=random'
        };
        setUser(guestUser);
        localStorage.setItem('guest_user', JSON.stringify(guestUser));
    };

    const logout = async () => {
        try {
            await supabase.auth.signOut();
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
        <AuthContext.Provider value={{ user, loading, loginWithGoogle, loginWithFacebook, sendPhoneOtp, verifyPhoneOtp, loginAsGuest, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
