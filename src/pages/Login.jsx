import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
    const { loginWithGoogle, loginAsGuest } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [error, setError] = React.useState('');

    const from = location.state?.from?.pathname || '/';

    const handleGoogleLogin = async () => {
        try {
            setError('');
            await loginWithGoogle();
            navigate(from, { replace: true });
        } catch (err) {
            console.error("Login failed:", err);
            let msg = "Failed to sign in. Please try again.";
            if (err.code === 'auth/popup-closed-by-user') {
                msg = "Sign-in cancelled.";
            } else if (err.code === 'auth/popup-blocked') {
                msg = "Popup blocked. Please allow popups for this site.";
            } else if (err.code === 'auth/unauthorized-domain') {
                msg = "Domain not authorized. Please contact support.";
            }
            setError(msg);
        }
    };

    const handleGuestLogin = () => {
        loginAsGuest();
        navigate(from, { replace: true });
    };

    return (
        <div className="login-minimal">
            <div className="login-content-minimal">
                {/* Apple Logo */}
                <div className="apple-logo">
                    <img src="/images/apple.png" alt="Apple" />
                </div>

                {/* Title */}
                <h1 className="brand-title">Farm Fresh</h1>

                {/* Features */}
                <div className="features-badges">
                    <div className="badge">
                        <span className="badge-icon">🌱</span>
                        <span>100% Organic</span>
                    </div>
                    <div className="badge">
                        <span className="badge-icon">✨</span>
                        <span>Premium Quality</span>
                    </div>
                </div>

                {/* Error Message */}
                {error && <div className="error-minimal">{error}</div>}

                {/* Google Login Button */}
                <button className="google-btn-minimal" onClick={handleGoogleLogin}>
                    <span>Continue with Google</span>
                    <img
                        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                        alt="Google"
                        className="google-icon"
                    />
                </button>

                {/* Guest Login */}
                <button className="guest-link" onClick={handleGuestLogin}>
                    Continue as Guest
                </button>

                {/* Security Note */}
                <p className="secure-text">Secure Login</p>
            </div>
        </div>
    );
};

export default Login;
