import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProduct } from '../context/ProductContext';
import LazyVideo from '../components/LazyVideo';
import './Search.css';

const Search = () => {
    const { products, loading } = useProduct();
    const [searchTerm, setSearchTerm] = useState('');

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
            6: '19-1930 TCX'  // Cherry Red
        };
        return codes[id] || '00-0000 TCX';
    };

    if (loading) return <div className="loading">LOADING COLLECTION...</div>;

    return (
        <div className="search-page">
            <div className="search-header-minimal">
                <input
                    type="text"
                    placeholder="SEARCH ARCHIVE..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input-minimal"
                />
            </div>

            <div className="gallery-grid">
                {filteredProducts.map(product => (
                    <Link to={`/product/${product.id}`} key={product.id} className="pantone-card">
                        <div className="card-visual">
                            <LazyVideo
                                src={`/videos/${product.name.toLowerCase().replace(/ /g, '-')}.mp4`}
                                poster={product.image_path}
                                className="product-video"
                            />
                        </div>
                        <div className="card-data">
                            <h2 className="product-name">{product.name} •</h2>
                            <span className="color-code">{getTCXCode(product.id)}</span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default Search;
