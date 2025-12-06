import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProduct } from '../context/ProductContext';
import ProductImage from '../components/ProductImage';
import './Search.css';

const Search = () => {
    const { products, loading } = useProduct();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="loading">Loading fresh fruits...</div>;

    return (
        <div className="search-page">
            <div className="search-header glass-strong">
                <input
                    type="text"
                    placeholder="Search for fruits..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>

            <div className="product-grid">
                {filteredProducts.map(product => (
                    <Link to={`/product/${product.id}`} key={product.id} className="product-card glass">
                        <div className="product-image-wrapper">
                            <ProductImage productName={product.name} alt={product.name} />
                        </div>
                        <div className="product-info">
                            <h3>{product.name}</h3>
                            <p className="product-category">{product.category}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default Search;
