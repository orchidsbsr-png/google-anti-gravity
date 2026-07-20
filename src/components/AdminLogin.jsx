import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css';

const PIN_LENGTH = 4;

// Brand palette for the particle field (matches src/index.css tokens —
// forest base, gold + terracotta + sage accents).
const PARTICLE_COLORS = [
    '212, 160, 23',   // gold
    '196, 69, 54',    // terracotta
    '143, 167, 107',  // sage/leaf
    '247, 244, 236',  // cream (faint highlight nodes)
];

const iconProps = {
    width: 30, height: 30, viewBox: '0 0 24 24', fill: 'none',
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

const BackspaceIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
        <path d="M14.5 9.5 9.5 14.5" />
        <path d="M9.5 9.5 14.5 14.5" />
    </svg>
);

// ---- physics particle field -------------------------------------------
// A quiet constellation: nodes hold a home position and spring back to it;
// the pointer repels nearby nodes; close nodes draw a faint connecting
// line. Same family of effect as antigravity.google's cursor-reactive
// background, restyled into the orchard palette.
function useParticleField(canvasRef) {
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        let width, height, dpr;
        let particles = [];
        const pointer = { x: -9999, y: -9999, active: false };

        const DENSITY = 18000; // px^2 per particle
        const LINK_DIST = 130;
        const REPEL_RADIUS = 160;

        function resize() {
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            canvas.style.width = width + 'px';
            canvas.style.height = height + 'px';
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            const count = Math.min(140, Math.max(36, Math.floor((width * height) / DENSITY)));
            particles = Array.from({ length: count }, () => {
                const hx = Math.random() * width;
                const hy = Math.random() * height;
                return {
                    hx, hy, x: hx, y: hy,
                    vx: 0, vy: 0,
                    r: Math.random() * 1.6 + 0.9,
                    color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
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
                // gentle ambient drift around home position
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

            // connecting lines
            for (let i = 0; i < particles.length; i++) {
                const a = particles[i];
                for (let j = i + 1; j < particles.length; j++) {
                    const b = particles[j];
                    const dx = a.x - b.x, dy = a.y - b.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < LINK_DIST) {
                        const alpha = (1 - dist / LINK_DIST) * 0.16;
                        ctx.strokeStyle = `rgba(233, 236, 211, ${alpha})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.stroke();
                    }
                }
            }

            // nodes with a soft glow
            for (const p of particles) {
                const near = pointer.active && Math.hypot(p.x - pointer.x, p.y - pointer.y) < REPEL_RADIUS;
                const glowR = p.r * (near ? 7 : 4.5);
                const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowR);
                const baseAlpha = near ? 0.55 : 0.28;
                grad.addColorStop(0, `rgba(${p.color}, ${baseAlpha})`);
                grad.addColorStop(1, `rgba(${p.color}, 0)`);
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(p.x, p.y, glowR, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = `rgba(${p.color}, ${near ? 0.95 : 0.65})`;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fill();
            }

            raf = requestAnimationFrame(step);
        }

        if (reduceMotion) {
            // Single static frame, no pointer interaction, no loop.
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

// ---- lockout helpers (client-side friction; server enforces its own) ---
const LOCK_KEY = 'admin_lock_until';

function getLockRemaining() {
    const until = Number(sessionStorage.getItem(LOCK_KEY) || 0);
    return Math.max(0, until - Date.now());
}

const AdminLogin = ({ onLogin }) => {
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [shake, setShake] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [lockMs, setLockMs] = useState(getLockRemaining());
    const canvasRef = useRef(null);
    const hiddenInputRef = useRef(null);
    const navigate = useNavigate();

    useParticleField(canvasRef);

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
        if (lockMs <= 0) hiddenInputRef.current?.focus();
    }, [lockMs]);

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
            if (onLogin) onLogin();
            navigate('/admin');
        } catch {
            triggerError('Could not reach the server. Try again.');
        } finally {
            setSubmitting(false);
        }
    }, [navigate, onLogin, triggerError]);

    const appendDigit = (d) => {
        if (submitting || lockMs > 0) return;
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

    return (
        <div className="admin-login-container">
            <canvas ref={canvasRef} className="field-canvas" />
            <div className="field-vignette" />

            <div className="login-content">
                <div className={`login-card glass-ultra ${shake ? 'shake' : ''}`}>
                    <div className="login-header">
                        <div className="lock-badge"><LockIcon /></div>
                        <h1>Admin Access</h1>
                        <p>Enter the PIN to reach the back office</p>
                    </div>

                    <div className="pin-boxes" onClick={() => hiddenInputRef.current?.focus()}>
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
                            disabled={submitting || lockMs > 0}
                            aria-label="Admin PIN"
                        />
                    </div>

                    <div className="status-row" aria-live="polite">
                        {lockMs > 0 ? (
                            <span className="lock-message">Too many attempts — try again in {lockSeconds}s</span>
                        ) : error ? (
                            <span className="error-message">{error}</span>
                        ) : submitting ? (
                            <span className="checking-message">Checking…</span>
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
                                disabled={submitting || lockMs > 0}
                            >
                                {d}
                            </button>
                        ))}
                        <span className="key key-spacer" aria-hidden="true" />
                        <button
                            type="button"
                            className="key"
                            onClick={() => appendDigit('0')}
                            disabled={submitting || lockMs > 0}
                        >
                            0
                        </button>
                        <button
                            type="button"
                            className="key key-back"
                            onClick={backspace}
                            disabled={submitting || lockMs > 0}
                            aria-label="Backspace"
                        >
                            <BackspaceIcon />
                        </button>
                    </div>

                    <div className="login-footer">
                        <p>Naliban Farms Admin Portal</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
