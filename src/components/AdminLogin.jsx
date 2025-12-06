import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css';

const AdminLogin = ({ onLogin }) => {
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const canvasRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Cloud class for fluid simulation
        class Cloud {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.3;
                this.radius = Math.random() * 80 + 40;
                this.opacity = Math.random() * 0.3 + 0.15;
                this.color = Math.random() > 0.5 ? 'rgba(52, 168, 83' : 'rgba(80, 200, 120';
                this.scale = 1;
                this.targetScale = 1;
            }

            update() {
                // Smooth drifting movement
                this.x += this.vx;
                this.y += this.vy;

                // Wrap around edges instead of bounce
                if (this.x < -this.radius) this.x = canvas.width + this.radius;
                if (this.x > canvas.width + this.radius) this.x = -this.radius;
                if (this.y < -this.radius) this.y = canvas.height + this.radius;
                if (this.y > canvas.height + this.radius) this.y = -this.radius;

                // Add subtle turbulence
                this.vx += (Math.random() - 0.5) * 0.02;
                this.vy += (Math.random() - 0.5) * 0.02;

                // Limit velocity for slow drift
                const maxSpeed = 0.8;
                const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
                if (speed > maxSpeed) {
                    this.vx = (this.vx / speed) * maxSpeed;
                    this.vy = (this.vy / speed) * maxSpeed;
                }

                // Smooth scale transition
                this.scale += (this.targetScale - this.scale) * 0.1;
            }

            draw() {
                // Create soft cloud with gradient
                const gradient = ctx.createRadialGradient(
                    this.x, this.y, 0,
                    this.x, this.y, this.radius * this.scale
                );
                gradient.addColorStop(0, `${this.color}, ${this.opacity})`);
                gradient.addColorStop(0.5, `${this.color}, ${this.opacity * 0.5})`);
                gradient.addColorStop(1, `${this.color}, 0)`);

                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius * this.scale, 0, Math.PI * 2);
                ctx.fillStyle = gradient;
                ctx.fill();

                // Add smaller blobs for cloud texture
                for (let i = 0; i < 3; i++) {
                    const angle = (Math.PI * 2 * i) / 3;
                    const bx = this.x + Math.cos(angle) * this.radius * 0.3;
                    const by = this.y + Math.sin(angle) * this.radius * 0.3;
                    const br = this.radius * 0.4;

                    const blobGradient = ctx.createRadialGradient(bx, by, 0, bx, by, br);
                    blobGradient.addColorStop(0, `${this.color}, ${this.opacity * 0.6})`);
                    blobGradient.addColorStop(1, `${this.color}, 0)`);

                    ctx.beginPath();
                    ctx.arc(bx, by, br, 0, Math.PI * 2);
                    ctx.fillStyle = blobGradient;
                    ctx.fill();
                }
            }
        }

        // Create clouds
        const clouds = [];
        const cloudCount = 12;
        for (let i = 0; i < cloudCount; i++) {
            clouds.push(new Cloud(
                Math.random() * canvas.width,
                Math.random() * canvas.height
            ));
        }

        // Mouse interaction
        let mouse = { x: null, y: null, radius: 300 };

        const handleMouseMove = (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        };

        canvas.addEventListener('mousemove', handleMouseMove);

        // Animation loop
        const animate = () => {
            // Fade effect instead of clear
            ctx.fillStyle = 'rgba(10, 25, 15, 0.03)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            clouds.forEach(cloud => {
                cloud.update();

                // Mouse interaction - strongly push clouds away
                if (mouse.x && mouse.y) {
                    const dx = cloud.x - mouse.x;
                    const dy = cloud.y - mouse.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < mouse.radius) {
                        const force = (mouse.radius - distance) / mouse.radius;
                        const angle = Math.atan2(dy, dx);
                        // Stronger force for more reactivity
                        cloud.vx += Math.cos(angle) * force * 0.4;
                        cloud.vy += Math.sin(angle) * force * 0.4;
                        // Dramatic scale increase
                        cloud.targetScale = 1 + force * 0.8;
                        // Brighten clouds near cursor
                        cloud.opacity = Math.min(0.6, cloud.opacity + force * 0.3);
                    } else {
                        cloud.targetScale = 1;
                        // Fade back to normal
                        if (cloud.opacity > 0.35) {
                            cloud.opacity -= 0.01;
                        }
                    }
                }

                cloud.draw();
            });

            requestAnimationFrame(animate);
        };

        animate();

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', handleResize);

        return () => {
            canvas.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (pin === '1234') {
            sessionStorage.setItem('admin_auth', 'true');
            if (onLogin) onLogin();
            navigate('/admin');
        } else {
            setError('Incorrect PIN');
            setPin('');
            setTimeout(() => setError(''), 2000);
        }
    };

    return (
        <div className="admin-login-container">
            <canvas ref={canvasRef} className="fluid-canvas"></canvas>

            <div className="login-content">
                <div className="login-card glass-ultra">
                    <div className="login-header">
                        <div className="lock-icon">🔐</div>
                        <h1>Admin Access</h1>
                        <p>Enter your secure PIN to continue</p>
                    </div>

                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="pin-input-group">
                            <input
                                type="password"
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                placeholder="Enter PIN"
                                className="pin-input"
                                maxLength="4"
                                autoFocus
                            />
                        </div>

                        {error && (
                            <div className="error-message shake">
                                {error}
                            </div>
                        )}

                        <button type="submit" className="btn-login">
                            <span>Unlock</span>
                            <span className="arrow">→</span>
                        </button>
                    </form>

                    <div className="login-footer">
                        <p>Farm Fresh Admin Portal</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
