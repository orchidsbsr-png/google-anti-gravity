import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const mapSupabaseUser = (sbUser) => ({
    id: sbUser.id,
    name: sbUser.user_metadata?.full_name || sbUser.user_metadata?.name || sbUser.email,
    email: sbUser.email,
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
            options: { redirectTo: window.location.origin },
        });
        if (error) throw error;
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
        <AuthContext.Provider value={{ user, loading, loginWithGoogle, loginAsGuest, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
