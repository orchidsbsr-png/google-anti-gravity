"use client";
import { Link } from 'react-router-dom';
import { useProduct } from '../context/ProductContext';
import { useWishlist } from '../context/WishlistContext';
import './Wishlist.css';

export default function Wishlist() {
    const { products } = useProduct();
    const { ids, toggleWish } = useWishlist();

    const saved = products.filter(p => ids.includes(p.id));

    return (
        <main className="wl-page">
            <header className="wl-head">
                <p className="wl-eyebrow">Saved for later</p>
                <h1 className="wl-title">Your <em>wishlist.</em></h1>
            </header>

            {saved.length === 0 ? (
                <div className="wl-empty">
                    <p>Nothing saved yet. Tap the heart on any fruit and it will wait for you here.</p>
                    <Link to="/search" className="btn-terracotta">Browse the Harvest</Link>
                </div>
            ) : (
                <div className="wl-grid">
                    {saved.map(p => (
                        <div className="wl-card" key={p.id}>
                            <Link to={`/product/${p.id}`} className="wl-visual">
                                <img src={p.image_path} alt={p.name} loading="lazy" />
                            </Link>
                            <div className="wl-body">
                                <Link to={`/product/${p.id}`} className="wl-name">{p.name}</Link>
                                <p className="wl-note">{p.taste_profile}</p>
                                <div className="wl-actions">
                                    <Link to={`/product/${p.id}`} className="wl-view">View &rarr;</Link>
                                    <button
                                        className="wl-remove"
                                        onClick={() => toggleWish(p.id)}
                                        aria-label={`Remove ${p.name} from wishlist`}
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}
