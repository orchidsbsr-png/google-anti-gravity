import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css';

const PIN_LENGTH = 4;

// Particle palette — electric indigo family for dark mode, deepened for light.
const PARTICLE_COLORS_DARK = [
    '129, 140, 248',  // indigo-400
    '99, 102, 241',   // indigo-500
    '56, 189, 248',   // sky-400
    '167, 139, 250',  // violet-400
];
const PARTICLE_COLORS_LIGHT = [
    '79, 70, 229',    // indigo-600
    '67, 56, 202',    // indigo-700
    '2, 132, 199',    // sky-600
    '109, 40, 217',   // violet-700
];

const iconProps = {
    width: 26, height: 26, viewBox: '0 0 24 24', fill: 'none',
    stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round',
};

const LockIcon = () => (
    <svg {...iconProps}>
        <rect x="4.5" y="10.5" width="15" height="10" rx="2.2" />
        <path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" />
        <circle cx="12" cy="15" r="1.6" />
        <path d="M12 16.6V18" />
    </svg>
);

const ShieldIcon = () => (
    <svg {...iconProps} width="16" height="16">
        <path d="M12 3l7 3v5c0 4.6-3 8.2-7 10-4-1.8-7-5.4-7-10V6l7-3z" />
    </svg>
);

const TimerIcon = () => (
    <svg {...iconProps} width="16" height="16">
        <circle cx="12" cy="13" r="8" />
        <path d="M12 9v4l2.5 2.5" />
        <path d="M9 2.5h6" />
    </svg>
);

const KeyIcon = () => (
    <svg {...iconProps} width="16" height="16">
        <circle cx="8" cy="14" r="4" />
        <path d="M11 11l8.5-8.5" />
        <path d="M16 6l3 3" />
    </svg>
);

const BackspaceIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
        <path d="M14.5 9.5 9.5 14.5" />
        <path d="M9.5 9.5 14.5 14.5" />
    </svg>
);

// ---- physics particle field -------------------------------------------
// A quiet constellation: nodes hold a home position and spring back to it;
// the pointer repels nearby nodes; close nodes draw a faint connecting line.
function useParticleField(canvasRef) {
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const lightMode = window.matchMedia('(prefers-color-scheme: light)').matches;
        const isTouch = window.matchMedia('(pointer: coarse)').matches;
        const COLORS = lightMode ? PARTICLE_COLORS_LIGHT : PARTICLE_COLORS_DARK;
        const linkColor = lightMode ? '67, 56, 202' : '165, 180, 252';

        let width, height, dpr;
        let particles = [];
        const pointer = { x: -9999, y: -9999, active: false };

        // Phones get a sparser field — the O(n²) link pass and per-node
        // glow gradients are the main battery cost.
        const DENSITY = isTouch ? 30000 : 18000; // px^2 per particle
        const MAX_COUNT = isTouch ? 55 : 140;
        const LINK_DIST = 130;
        const REPEL_RADIUS = 160;

        function resize() {
            dpr = Math.min(window.devicePixelRatio || 1, isTouch ? 1.5 : 2);
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            canvas.style.width = width + 'px';
            canvas.style.height = height + 'px';
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            const count = Math.min(MAX_COUNT, Math.max(24, Math.floor((width * height) / DENSITY)));
            particles = Array.from({ length: count }, () => {
                const hx = Math.random() * width;
                const hy = Math.random() * height;
                return {
                    hx, hy, x: hx, y: hy,
                    vx: 0, vy: 0,
                    r: Math.random() * 1.6 + 0.9,
                    color: COLORS[Math.floor(Math.random() * COLORS.length)],
                    drift: Math.random() * Math.PI * 2,
                    driftSpeed: Math.random() * 0.004 + 0.002,
                };
            });
        }

        resize();
        window.addEventListener('resize', resize);

        const setPointer = (x, y) => { pointer.x = x; pointer.y = y; pointer.active = true; };
        const clearPointer = () => { pointer.active = false; };

        const onMouseMove = (e) => setPointer(e.clientX, e.clientY);
        const onTouchMove = (e) => {
            if (e.touches?.[0]) setPointer(e.touches[0].clientX, e.touches[0].clientY);
        };

        window.addEventListener('mousemove', onMouseMove, { passive: true });
        window.addEventListener('mouseleave', clearPointer);
        window.addEventListener('touchmove', onTouchMove, { passive: true });
        window.addEventListener('touchend', clearPointer);

        let raf;
        const SPRING = 0.02;
        const DAMP = 0.9;

        function step() {
            ctx.clearRect(0, 0, width, height);

            for (const p of particles) {
                p.drift += p.driftSpeed;
                const dhx = p.hx + Math.cos(p.drift) * 14;
                const dhy = p.hy + Math.sin(p.drift * 0.8) * 14;

                let fx = (dhx - p.x) * SPRING;
                let fy = (dhy - p.y) * SPRING;

                if (pointer.active) {
                    const dx = p.x - pointer.x;
                    const dy = p.y - pointer.y;
                    const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
                    if (dist < REPEL_RADIUS) {
                        const force = (1 - dist / REPEL_RADIUS) * 2.6;
                        fx += (dx / dist) * force;
                        fy += (dy / dist) * force;
                    }
                }

                p.vx = (p.vx + fx) * DAMP;
                p.vy = (p.vy + fy) * DAMP;
                p.x += p.vx;
                p.y += p.vy;
            }

            for (let i = 0; i < particles.length; i++) {
                const a = particles[i];
                for (let j = i + 1; j < particles.length; j++) {
                    const b = particles[j];
                    const dx = a.x - b.x, dy = a.y - b.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < LINK_DIST) {
                        const alpha = (1 - dist / LINK_DIST) * 0.14;
                        ctx.strokeStyle = `rgba(${linkColor}, ${alpha})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.stroke();
                    }
                }
            }

            for (const p of particles) {
                const near = pointer.active && Math.hypot(p.x - pointer.x, p.y - pointer.y) < REPEL_RADIUS;
                const glowR = p.r * (near ? 7 : 4.5);
                const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowR);
                const baseAlpha = near ? 0.5 : 0.24;
                grad.addColorStop(0, `rgba(${p.color}, ${baseAlpha})`);
                grad.addColorStop(1, `rgba(${p.color}, 0)`);
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(p.x, p.y, glowR, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = `rgba(${p.color}, ${near ? 0.9 : 0.6})`;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fill();
            }

            raf = requestAnimationFrame(step);
        }

        if (reduceMotion) {
            step();
            cancelAnimationFrame(raf);
        } else {
            raf = requestAnimationFrame(step);
        }

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseleave', clearPointer);
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('touchend', clearPointer);
        };
    }, [canvasRef]);
}

// ---- parallax: gradient mesh drifts opposite the pointer ---------------
function useParallax(containerRef) {
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        let raf = null;
        const onMove = (e) => {
            if (raf) return;
            raf = requestAnimationFrame(() => {
                const x = (e.clientX / window.innerWidth - 0.5);
                const y = (e.clientY / window.innerHeight - 0.5);
                el.style.setProperty('--par-x', `${x * -18}px`);
                el.style.setProperty('--par-y', `${y * -18}px`);
                raf = null;
            });
        };
        window.addEventListener('mousemove', onMove, { passive: true });
        return () => {
            window.removeEventListener('mousemove', onMove);
            if (raf) cancelAnimationFrame(raf);
        };
    }, [containerRef]);
}

// ---- lockout helpers (client-side friction; server enforces its own) ---
const LOCK_KEY = 'admin_lock_until';

function getLockRemaining() {
    const until = Number(sessionStorage.getItem(LOCK_KEY) || 0);
    return Math.max(0, until - Date.now());
}

// On touch devices the in-card keypad is the input method; focusing the
// hidden input there would pop the OS keyboard over the design.
const isCoarsePointer = () =>
    typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

const AdminLogin = ({ onLogin }) => {
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [shake, setShake] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [lockMs, setLockMs] = useState(getLockRemaining());
    const containerRef = useRef(null);
    const canvasRef = useRef(null);
    const hiddenInputRef = useRef(null);
    const navigate = useNavigate();

    useParticleField(canvasRef);
    useParallax(containerRef);

    useEffect(() => {
        if (lockMs <= 0) return undefined;
        const id = setInterval(() => {
            const remaining = getLockRemaining();
            setLockMs(remaining);
            if (remaining <= 0) clearInterval(id);
        }, 500);
        return () => clearInterval(id);
    }, [lockMs]);

    useEffect(() => {
        if (lockMs <= 0 && !success && !isCoarsePointer()) hiddenInputRef.current?.focus();
    }, [lockMs, success]);

    const triggerError = useCallback((msg) => {
        setError(msg);
        setShake(true);
        setPin('');
        setTimeout(() => setShake(false), 500);
        setTimeout(() => setError(''), 2200);
    }, []);

    const submitPin = useCallback(async (value) => {
        setSubmitting(true);
        try {
            const res = await fetch('/api/admin_auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pin: value }),
            });
            const data = await res.json().catch(() => ({}));

            if (res.status === 429) {
                const until = Date.now() + (data.retryAfter || 300) * 1000;
                sessionStorage.setItem(LOCK_KEY, String(until));
                setLockMs(getLockRemaining());
                setPin('');
                return;
            }

            if (!res.ok || !data.success) {
                triggerError(data.error || 'Incorrect PIN');
                return;
            }

            sessionStorage.setItem('admin_token', data.token);
            sessionStorage.setItem('admin_token_exp', String(data.exp));
            sessionStorage.setItem('admin_auth', 'true'); // back-compat flag

            // Checkmark morph, then hand over to the dashboard.
            setSuccess(true);
            const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            setTimeout(() => {
                if (onLogin) onLogin();
                navigate('/admin');
            }, reduceMotion ? 150 : 950);
        } catch {
            triggerError('Could not reach the server. Try again.');
        } finally {
            setSubmitting(false);
        }
    }, [navigate, onLogin, triggerError]);

    const appendDigit = (d) => {
        if (submitting || success || lockMs > 0) return;
        setError('');
        setPin((prev) => {
            if (prev.length >= PIN_LENGTH) return prev;
            const next = prev + d;
            if (next.length === PIN_LENGTH) setTimeout(() => submitPin(next), 120);
            return next;
        });
    };

    const backspace = () => setPin((prev) => prev.slice(0, -1));

    const handleHiddenInput = (e) => {
        const digits = e.target.value.replace(/\D/g, '').slice(0, PIN_LENGTH);
        e.target.value = '';
        for (const d of digits) appendDigit(d);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Backspace') backspace();
    };

    const lockSeconds = Math.ceil(lockMs / 1000);
    const keysDisabled = submitting || success || lockMs > 0;

    return (
        <div className="admin-login-container" ref={containerRef}>
            <div className="mesh-layer" aria-hidden="true">
                <span className="mesh-blob mesh-a" />
                <span className="mesh-blob mesh-b" />
                <span className="mesh-blob mesh-c" />
            </div>
            <canvas ref={canvasRef} className="field-canvas" />
            <div className="field-vignette" />

            <div className="login-split">
                {/* ---- branding panel ---- */}
                <section className="brand-panel" aria-label="Naliban Farms">
                    <div className="brand-top">
                        <img src="/logo.svg" alt="" className="brand-logo" />
                        <div className="brand-name">
                            <span className="brand-title">Naliban Farms</span>
                            <span className="brand-sub">Back Office</span>
                        </div>
                    </div>

                    <div className="brand-hero">
                        <h2>Secure Admin<br />Access Portal</h2>
                        <p>Orders, inventory and shop controls for nalibanfarms.in — one PIN away.</p>
                    </div>

                    <div className="brand-bottom">
                        <ul className="trust-list">
                            <li><ShieldIcon /> Server-verified PIN</li>
                            <li><TimerIcon /> Rate-limited sign-in</li>
                            <li><KeyIcon /> Session-scoped access</li>
                        </ul>
                        <div className="status-pill" role="status">
                            <span className={`status-dot ${lockMs > 0 ? 'warn' : ''}`} />
                            {lockMs > 0 ? 'Sign-in temporarily locked' : 'All systems operational'}
                        </div>
                    </div>
                </section>

                {/* ---- auth card ---- */}
                <section className="auth-panel">
                    <div className={`login-card ${shake ? 'shake' : ''} ${success ? 'is-success' : ''}`}>
                        <div className={`progress-line ${submitting ? 'on' : ''}`} aria-hidden="true" />

                        {success ? (
                            <div className="success-state" role="status">
                                <svg className="check-ring" viewBox="0 0 64 64" fill="none">
                                    <circle className="ring" cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="2.5" />
                                    <path className="tick" d="M21 33.5 L28.5 41 L43 25.5" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <p>Welcome back</p>
                            </div>
                        ) : (
                            <>
                                <div className="login-header">
                                    <div className="lock-badge"><LockIcon /></div>
                                    <h1>Admin Access</h1>
                                    <p>Enter your PIN to continue</p>
                                </div>

                                <div className="pin-boxes" onClick={() => { if (!isCoarsePointer()) hiddenInputRef.current?.focus(); }}>
                                    {Array.from({ length: PIN_LENGTH }).map((_, i) => (
                                        <div
                                            key={i}
                                            className={`pin-box ${pin.length === i ? 'active' : ''} ${pin[i] ? 'filled' : ''}`}
                                        >
                                            {pin[i] ? <span className="pin-dot" /> : null}
                                        </div>
                                    ))}
                                    <input
                                        ref={hiddenInputRef}
                                        type="tel"
                                        inputMode="numeric"
                                        autoComplete="off"
                                        className="pin-hidden-input"
                                        value=""
                                        onChange={handleHiddenInput}
                                        onKeyDown={handleKeyDown}
                                        disabled={keysDisabled}
                                        aria-label="Admin PIN"
                                    />
                                </div>

                                <div className="status-row" aria-live="polite">
                                    {lockMs > 0 ? (
                                        <span className="lock-message">Too many attempts — try again in {lockSeconds}s</span>
                                    ) : error ? (
                                        <span className="error-message">{error}</span>
                                    ) : submitting ? (
                                        <span className="checking-message">Verifying…</span>
                                    ) : (
                                        <span className="hint-message">&nbsp;</span>
                                    )}
                                </div>

                                <div className="keypad">
                                    {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
                                        <button
                                            key={d}
                                            type="button"
                                            className="key"
                                            onClick={() => appendDigit(d)}
                                            disabled={keysDisabled}
                                        >
                                            {d}
                                        </button>
                                    ))}
                                    <span className="key key-spacer" aria-hidden="true" />
                                    <button
                                        type="button"
                                        className="key"
                                        onClick={() => appendDigit('0')}
                                        disabled={keysDisabled}
                                    >
                                        0
                                    </button>
                                    <button
                                        type="button"
                                        className="key key-back"
                                        onClick={backspace}
                                        disabled={keysDisabled}
                                        aria-label="Backspace"
                                    >
                                        <BackspaceIcon />
                                    </button>
                                </div>

                                <div className="login-footer">
                                    <p>Naliban Farms Admin Portal</p>
                                </div>
                            </>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AdminLogin;
