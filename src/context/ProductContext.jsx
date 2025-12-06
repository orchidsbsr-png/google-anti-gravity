import React, { createContext, useContext, useState, useEffect } from 'react';

const ProductContext = createContext();

export const useProduct = () => useContext(ProductContext);

export const ProductProvider = ({ children }) => {
    const [products, setProducts] = useState([]);
    const [varieties, setVarieties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 500));

            // Load from mock data
            const { PRODUCTS, VARIETIES } = await import('../data/mockData');

            setProducts(PRODUCTS);
            setVarieties(VARIETIES);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const getProductById = (id) => {
        return products.find(p => p.id === parseInt(id));
    };

    const getVarietiesByProductId = (productId) => {
        return varieties.filter(v => v.product_id === parseInt(productId));
    };

    return (
        <ProductContext.Provider value={{
            products,
            varieties,
            loading,
            error,
            getProductById,
            getVarietiesByProductId,
            refreshProducts: fetchProducts
        }}>
            {children}
        </ProductContext.Provider>
    );
};
