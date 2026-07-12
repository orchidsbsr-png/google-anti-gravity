import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabase';

/**
 * OAuth landing pad. Google → Supabase redirects here with a one-time code;
 * supabase-js exchanges it for a session automatically. This page waits for
 * that to finish, then routes home — and if the exchange fails it shows the
 * real error instead of silently dropping the user on the landing page.
 */
const AuthCallback = () => {
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const settled = useRef(false);

    useEffect(() => {
        const succeed = () => {
            if (settled.current) return;
            settled.current = true;
            // Return to wherever login was started from (cart, checkout, …)
            const dest = sessionStorage.getItem('post_login_redirect') || '/';
            sessionStorage.removeItem('post_login_redirect');
            navigate(dest, { replace: true });
        };

        // Errors passed back in the URL (user cancelled, provider rejected…)
        const params = new URLSearchParams(window.location.search);
        const urlError = params.get('error_description') || params.get('error');
        if (urlError) {
            setError(urlError);
            return;
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) succeed();
        });

        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) succeed();
        });

        // If the automatic exchange hasn't produced a session shortly, run it
        // ourselves so the actual failure reason surfaces (bad key, code
        // verifier missing because login started on a different domain, …).
        const timer = setTimeout(async () => {
            if (settled.current) return;
            const code = params.get('code');
            if (!code) {
                setError('No sign-in code found in the URL. Please try again.');
                return;
            }
            const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
            if (settled.current) return;
            if (data?.session) succeed();
            else setError(exchangeError?.message || 'Could not complete sign-in.');
        }, 2500);

        return () => {
            subscription.unsubscribe();
            clearTimeout(timer);
        };
    }, [navigate]);

    return (
        <div style={{
            minHeight: '80vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '18px',
            padding: '24px',
            textAlign: 'center',
            fontFamily: "'Fraunces', Georgia, serif",
            color: '#2D3319',
        }}>
            {!error ? (
                <p style={{ fontStyle: 'italic', fontSize: '1.2rem', color: '#83866F' }}>
                    Signing you in&hellip;
                </p>
            ) : (
                <>
                    <p style={{ fontSize: '1.15rem' }}>Sign-in didn&rsquo;t complete</p>
                    <p style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '0.85rem',
                        color: '#9A3B3B',
                        maxWidth: '420px',
                        wordBreak: 'break-word',
                    }}>
                        {error}
                    </p>
                    <Link to="/login" style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '0.85rem',
                        color: '#2D3319',
                        textDecoration: 'underline',
                    }}>
                        Try again
                    </Link>
                </>
            )}
        </div>
    );
};

export default AuthCallback;
