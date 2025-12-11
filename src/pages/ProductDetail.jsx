import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProduct } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { useInventory } from '../context/InventoryContext';
import { useAuth } from '../context/AuthContext';
import ProductImage from '../components/ProductImage';
import VarietySelector from '../components/VarietySelector';
import './ProductDetail.css';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getProductById, getVarietiesByProductId, loading } = useProduct();
    const { addToCart } = useCart();
    const { isInStock, getStock, settings, inventory } = useInventory();
    const { user } = useAuth(); // Get user

    const [product, setProduct] = useState(null);
    const [varieties, setVarieties] = useState([]);
    const [selectedVariety, setSelectedVariety] = useState(null);
    const [selectedSize, setSelectedSize] = useState(5); // 5 or 10 kg
    const [quantity, setQuantity] = useState(1);
    const [addedToCart, setAddedToCart] = useState(false);

    useEffect(() => {
        if (!loading) {
            const p = getProductById(id);
            if (p) {
                setProduct(p);
                const v = getVarietiesByProductId(id);
                setVarieties(v);
                if (v.length > 0) {
                    setSelectedVariety(v[0]);
                }
            }
        }
    }, [id, loading, getProductById, getVarietiesByProductId]);

    if (loading || !product) return <div className="loading">Loading...</div>;

    const handleAddToCart = async () => {
        if (!user) {
            alert("Please login to add items to the cart");
            navigate('/login');
            return;
        }

        if (!selectedVariety) return;
        const success = await addToCart(product, selectedVariety, selectedSize, quantity, inventory);
        if (success) {
            setAddedToCart(true);
            setQuantity(1); // Reset quantity
            setTimeout(() => setAddedToCart(false), 3000); // Hide message after 3 seconds
        }
    };

    const stockAvailable = selectedVariety ? getStock(selectedVariety.id, selectedSize) : 0;
    const isShopOpen = settings.shop_open;
    const canAddToCart = isShopOpen && stockAvailable > 0 && quantity <= stockAvailable;

    return (
        <div className="product-detail-page">
            <div className="product-detail-image">
                <ProductImage
                    productName={product.name}
                    varietyName={selectedVariety?.name}
                    alt={product.name}
                />
            </div>

            <div className="product-detail-content glass-strong">
                <div className="title-row">
                    <h1>{selectedVariety ? selectedVariety.name : product.name}</h1>
                    {selectedVariety && getStock(selectedVariety.id, 5) > 0 && inventory.find(i => i.variety_id === selectedVariety.id)?.is_bestseller && (
                        <span className="bestseller-badge">🏆 Best Seller</span>
                    )}
                </div>
                <p className="description">
                    {selectedVariety?.description || product.description}
                </p>

                <div className="profiles">
                    <div className="profile-item">
                        <span className="label">Taste:</span>
                        {selectedVariety?.taste_profile || product.taste_profile}
                    </div>
                    <div className="profile-item">
                        <span className="label">Texture:</span>
                        {selectedVariety?.texture_profile || product.texture_profile}
                    </div>
                </div>

                <VarietySelector
                    varieties={varieties}
                    selectedVarietyId={selectedVariety?.id}
                    onSelect={setSelectedVariety}
                />

                {selectedVariety && (
                    <div className="purchase-section">
                        <div className="size-selector">
                            <label>Select Size:</label>
                            <div className="size-buttons">
                                <button
                                    className={`size-btn ${selectedSize === 5 ? 'active' : ''}`}
                                    onClick={() => setSelectedSize(5)}
                                >
                                    5 kg
                                </button>
                                <button
                                    className={`size-btn ${selectedSize === 10 ? 'active' : ''}`}
                                    onClick={() => setSelectedSize(10)}
                                >
                                    10 kg
                                </button>
                            </div>
                        </div>

                        <div className="quantity-selector">
                            <label>Quantity (Number of boxes):</label>
                            <div className="quantity-controls">
                                <button
                                    className="qty-btn"
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    disabled={quantity <= 1}
                                >
                                    −
                                </button>
                                <span className="qty-display">{quantity}</span>
                                <button
                                    className="qty-btn"
                                    onClick={() => setQuantity(Math.min(stockAvailable, quantity + 1))}
                                    disabled={quantity >= stockAvailable}
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        <div className="price-display">
                            <span className="price-label">Price:</span>
                            <span className="price-value">₹{
                                (() => {
                                    const invItem = inventory.find(i => i.variety_id === selectedVariety.id);
                                    let pricePerBox;
                                    if (invItem && selectedSize === 5 && invItem.price_5kg) {
                                        pricePerBox = invItem.price_5kg;
                                    } else if (invItem && selectedSize === 10 && invItem.price_10kg) {
                                        pricePerBox = invItem.price_10kg;
                                    } else {
                                        pricePerBox = selectedVariety.price_per_kg * selectedSize;
                                    }
                                    return pricePerBox * quantity;
                                })()
                            }</span>
                            <span className="price-unit">({quantity} box{quantity > 1 ? 'es' : ''} × {selectedSize}kg)</span>
                        </div>

                        <div className="stock-status">
                            {isShopOpen ? (
                                stockAvailable > 0 ? (
                                    <>
                                        <span className="in-stock">In Stock ({stockAvailable} units)</span>
                                        {stockAvailable < 10 && (
                                            <div className="selling-fast-badge">
                                                🔥 Selling Fast! Only {stockAvailable} left!
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <span className="out-of-stock">Out of Stock</span>
                                )
                            ) : (
                                <span className="shop-closed">Shop is currently closed</span>
                            )}
                        </div>

                        {addedToCart && (
                            <div className="success-message">
                                ✓ Added to cart successfully!
                            </div>
                        )}

                        <button
                            className="btn-primary add-to-cart-btn"
                            disabled={!canAddToCart}
                            onClick={handleAddToCart}
                        >
                            {canAddToCart ? 'Add to Cart' : (isShopOpen ? 'Out of Stock' : 'Shop Closed')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductDetail;
