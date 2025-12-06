import React, { useState, useEffect } from 'react';
import { getProductImage } from '../utils/imageService';
import './ProductImage.css';

const ProductImage = ({ productName, varietyName, alt, className }) => {
    const [imageSrc, setImageSrc] = useState('');
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        const src = getProductImage(productName, { variety: varietyName });
        setImageSrc(src);
        setHasError(false);
    }, [productName, varietyName]);

    const handleError = () => {
        if (!hasError) {
            setHasError(true);
            // Fallback to a placeholder or the product name if variety failed
            if (varietyName) {
                // Try product name only
                setImageSrc(getProductImage(productName));
            } else {
                // Ultimate fallback
                setImageSrc('https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&q=80&w=500');
            }
        }
    };

    return (
        <div className={`product-image-container ${className || ''}`}>
            <img
                src={imageSrc}
                alt={alt || productName}
                onError={handleError}
                className="product-image"
            />
        </div>
    );
};

export default ProductImage;
