import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import './Login.css';

const Login = () => {
    const { loginWithGoogle, loginWithFacebook, sendPhoneOtp, verifyPhoneOtp, loginAsGuest } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [error, setError] = React.useState('');

    // Phone OTP flow state
    const [phone, setPhone] = React.useState('');
    const [otp, setOtp] = React.useState('');
    const [otpSent, setOtpSent] = React.useState(false);
    const [busy, setBusy] = React.useState(false);

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

    const fullPhone = () => `+91${phone.replace(/\D/g, '')}`;

    const handleSendOtp = async () => {
        const digits = phone.replace(/\D/g, '');
        if (!/^[6-9]\d{9}$/.test(digits)) {
            setError('Enter a valid 10-digit Indian mobile number');
            return;
        }
        setBusy(true);
        setError('');
        try {
            await sendPhoneOtp(fullPhone());
            setOtpSent(true);
        } catch (err) {
            console.error('OTP send failed:', err);
            setError(err.message || 'Could not send the OTP. Please try again.');
        } finally {
            setBusy(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (otp.trim().length < 4) {
            setError('Enter the OTP from the SMS');
            return;
        }
        setBusy(true);
        setError('');
        try {
            await verifyPhoneOtp(fullPhone(), otp.trim());
            navigate(from, { replace: true });
        } catch (err) {
            console.error('OTP verify failed:', err);
            setError(err.message || 'Wrong or expired OTP. Please try again.');
        } finally {
            setBusy(false);
        }
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

                {/* Facebook Login Button */}
                <button className="facebook-btn-minimal" onClick={() => handleOAuth(loginWithFacebook, 'Facebook')}>
                    <span>Continue with Facebook</span>
                    <svg className="google-icon" viewBox="0 0 24 24" fill="#fff" aria-hidden="true">
                        <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047v-2.66c0-3.026 1.792-4.697 4.533-4.697 1.313 0 2.686.236 2.686.236v2.971H15.83c-1.491 0-1.956.931-1.956 1.887v2.263h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
                    </svg>
                </button>

                {/* Divider */}
                <div className="login-divider"><span>or use your phone</span></div>

                {/* Phone OTP */}
                {!otpSent ? (
                    <div className="phone-row">
                        <span className="phone-prefix">+91</span>
                        <input
                            type="tel"
                            inputMode="numeric"
                            maxLength={10}
                            placeholder="Mobile number"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                        />
                        <button className="otp-btn" onClick={handleSendOtp} disabled={busy}>
                            {busy ? '...' : 'Send OTP'}
                        </button>
                    </div>
                ) : (
                    <div className="phone-row">
                        <input
                            type="text"
                            inputMode="numeric"
                            maxLength={8}
                            className="otp-input"
                            placeholder="Enter OTP"
                            value={otp}
                            autoFocus
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                            onKeyDown={(e) => e.key === 'Enter' && handleVerifyOtp()}
                        />
                        <button className="otp-btn" onClick={handleVerifyOtp} disabled={busy}>
                            {busy ? '...' : 'Verify'}
                        </button>
                    </div>
                )}
                {otpSent && (
                    <button className="otp-again" onClick={() => { setOtpSent(false); setOtp(''); }}>
                        Change number / resend
                    </button>
                )}

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
