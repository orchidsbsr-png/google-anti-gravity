import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useProduct } from '../context/ProductContext';
import { useInventory } from '../context/InventoryContext';
import { useLanguage } from '../context/LanguageContext';
import { HARVEST_SEASONS, seasonLabel, returnsLabel } from '../data/seasons';
import LazyVideo from '../components/LazyVideo';
import './Search.css';

const Search = () => {
    const { products, loading, getVarietiesByProductId } = useProduct();
    const { inventory } = useInventory();
    const { t } = useLanguage();
    const [searchParams] = useSearchParams();
    const [searchTerm, setSearchTerm] = useState('');

    // A product is "in season" if any of its varieties has live stock
    const hasStock = (productId) => {
        if (!inventory.length) return true; // don't stamp before inventory loads
        const varieties = getVarietiesByProductId(productId) || [];
        return varieties.some(v => {
            const item = inventory.find(i => i.variety_id === v.id);
            return item && item.is_active !== false &&
                (item.pack_sizes || []).some(p => p.stock > 0);
        });
    };

    useEffect(() => {
        const query = searchParams.get('query');
        if (query) {
            setSearchTerm(query);
        }
    }, [searchParams]);

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Mock TCX codes for the aesthetic
    const getTCXCode = (id) => {
        const codes = {
            1: '18-1664 TCX', // Apple Red
            2: '16-1364 TCX', // Persimmon Orange
            3: '14-0452 TCX', // Kiwi Green
            4: '19-3632 TCX', // Plum Purple
            5: '14-0755 TCX', // Pear Green
            6: '19-1930 TCX', // Cherry Red
            7: '15-1153 TCX'  // Fuyu Orange (Apricot Wash)
        };
        return codes[id] || '00-0000 TCX';
    };

    if (loading) return (
        <div className="search-page">
            <header className="collection-header">
                <p className="collection-eyebrow">The Collection</p>
                <h1 className="collection-title">
                    This Season&rsquo;s <em>Harvest</em>
                </h1>
            </header>
            <div className="gallery-grid">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="skeleton-card">
                        <div className="skeleton-visual shimmer" />
                        <div className="skeleton-lines">
                            <span className="shimmer" />
                            <span className="shimmer" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="search-page">
            <header className="collection-header">
                <p className="collection-eyebrow">{t('shop.eyebrow')}</p>
                <h1 className="collection-title">
                    {t('shop.title1')} <em>{t('shop.title2')}</em>
                </h1>
                <div className="harvest-strip" aria-label="Harvest calendar">
                    <span className="harvest-strip-label">{t('shop.calendar')}</span>
                    {HARVEST_SEASONS.map(s => (
                        <span key={s.fruit} className="harvest-chip">
                            <strong>{s.fruit}</strong> {seasonLabel(s)}
                        </span>
                    ))}
                </div>

                <div className="collection-toolbar">
                    <span className="collection-count">
                        {filteredProducts.length} {t('shop.inSeason')}
                    </span>
                    <div className="search-field">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <circle cx="11" cy="11" r="7" />
                            <line x1="21" y1="21" x2="16.5" y2="16.5" />
                        </svg>
                        <input
                            type="text"
                            placeholder={t('shop.search')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input-minimal"
                        />
                    </div>
                </div>
            </header>

            <div className="gallery-grid">
                {filteredProducts.map((product, index) => {
                    const inSeason = hasStock(product.id);
                    return (
                    <Link to={`/product/${product.id}`} key={product.id} className={`pantone-card ${inSeason ? '' : 'off-season'}`}>
                        <div className="card-visual">
                            <LazyVideo
                                src={`/videos/${product.name.toLowerCase().replace(/ /g, '-')}.mp4`}
                                poster={product.image_path}
                                className="product-video"
                            />
                            <span className="card-index">{String(index + 1).padStart(2, '0')}</span>
                            {!inSeason && (
                                <span className="season-stamp">{returnsLabel(product.name)}</span>
                            )}
                        </div>
                        <div className="card-data">
                            <div>
                                <h2 className="product-name">{product.name}</h2>
                                <span className="color-code">{getTCXCode(product.id)}</span>
                            </div>
                            <span className="card-arrow" aria-hidden="true">&rarr;</span>
                        </div>
                    </Link>
                    );
                })}
                {filteredProducts.length === 0 && (
                    <p className="no-results">Nothing ripe by that name &mdash; try another search.</p>
                )}
            </div>
        </div>
    );
};

export default Search;
