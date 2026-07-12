import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import './Login.css';

const Login = () => {
    const { loginWithGoogle, loginAsGuest } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [error, setError] = React.useState('');

    const from = location.state?.from?.pathname || '/';

    const handleOAuth = async (loginFn, providerName) => {
        try {
            setError('');
            await loginFn();
            navigate(from, { replace: true });
        } catch (err) {
            console.error(`${providerName} login failed:`, err);
            setError(err.message || `Failed to sign in with ${providerName}. Please try again.`);
        }
    };

    const handleGuestLogin = () => {
        loginAsGuest();
        navigate(from, { replace: true });
    };

    return (
        <div className="login-minimal">
            <div className="login-content-minimal">
                {/* Brand */}
                <div className="login-logo">
                    <Logo variant="full" size={72} stacked />
                </div>

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
                <button className="google-btn-minimal" onClick={() => handleOAuth(loginWithGoogle, 'Google')}>
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
