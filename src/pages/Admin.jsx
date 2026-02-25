import React, { useState, useEffect } from 'react';
import { useInventory } from '../context/InventoryContext';
import { useProduct } from '../context/ProductContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, getDocs } from 'firebase/firestore';
import AdminLogin from '../components/AdminLogin';
import '../components/AdminLogin.css';
import './Admin.css';

const Admin = () => {
    const { inventory, settings, updateInventory, updateShopStatus, loading: invLoading } = useInventory();
    const { products, varieties, loading: prodLoading } = useProduct();
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [activeTab, setActiveTab] = useState('inventory');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [editedItems, setEditedItems] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedOrderId, setExpandedOrderId] = useState(null);

    const [orderStatusFilter, setOrderStatusFilter] = useState('All');
    const [pushedOrderIds, setPushedOrderIds] = useState(new Set());

    useEffect(() => {
        if (sessionStorage.getItem('admin_auth') === 'true') {
            setIsAuthenticated(true);
        }
    }, []);

    useEffect(() => {
        if (!isAuthenticated) return;

        const q = query(collection(db, 'orders'), orderBy('created_at', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const loadedOrders = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setOrders(loadedOrders);
        });

        return () => unsubscribe();
    }, [isAuthenticated]);

    const handleLogout = () => {
        setIsAuthenticated(false);
        sessionStorage.removeItem('admin_auth');
    };

    const handleFieldChange = (varietyId, field, value, packIndex = null) => {
        setEditedItems(prev => {
            const currentItem = prev[varietyId] || {};
            // Deep copy pack_sizes if we are editing an array element
            let newPackSizes = currentItem.pack_sizes ? [...currentItem.pack_sizes] : [];

            if (packIndex !== null && field === 'pack_sizes') {
                if (value === 'DELETE') {
                    newPackSizes.splice(packIndex, 1);
                } else {
                    newPackSizes[packIndex] = { ...newPackSizes[packIndex], ...value };
                }
            }

            return {
                ...prev,
                [varietyId]: {
                    ...currentItem,
                    ...(packIndex === null ? { [field]: value } : { pack_sizes: newPackSizes }),
                    hasChanges: true
                }
            };
        });
    };

    const handleSave = async (varietyId) => {
        const item = inventory.find(i => i.variety_id === varietyId) || {
            is_active: true,
            is_bestseller: false,
            price_per_kg: varieties.find(v => v.id === varietyId)?.price_per_kg || 0,
            pack_sizes: []
        };

        const edited = editedItems[varietyId] || {};

        const isActive = edited.is_active !== undefined ? edited.is_active : (item.is_active ?? true);
        const isBestseller = edited.is_bestseller !== undefined ? edited.is_bestseller : (item.is_bestseller ?? false);
        const pricePerKg = edited.price_per_kg !== undefined ? parseFloat(edited.price_per_kg) || 0 : (item.price_per_kg || 0);

        // If edited.pack_sizes is a complete array (from checkbox toggle), use it directly.
        // Otherwise, merge sparse edits onto original pack_sizes.
        let finalPackSizes;
        if (edited.pack_sizes && Array.isArray(edited.pack_sizes)) {
            // Check if it's a complete replacement (has weight property on first element)
            const isCompleteArray = edited.pack_sizes.length === 0 || (edited.pack_sizes[0] && edited.pack_sizes[0].weight !== undefined);
            if (isCompleteArray) {
                finalPackSizes = edited.pack_sizes.filter(p => p).map(pack => ({
                    weight: Number(pack.weight),
                    stock: Number(pack.stock ?? 0),
                    price: Number(pack.price ?? pricePerKg * pack.weight)
                }));
            } else {
                // Sparse overlay on original
                finalPackSizes = (item.pack_sizes || []).map((pack, index) => {
                    if (edited.pack_sizes[index]) {
                        return {
                            weight: Number(edited.pack_sizes[index].weight ?? pack.weight),
                            stock: Number(edited.pack_sizes[index].stock ?? pack.stock),
                            price: Number(edited.pack_sizes[index].price ?? pack.price)
                        };
                    }
                    return pack;
                });
            }
        } else {
            finalPackSizes = item.pack_sizes || [];
        }

        const success = await updateInventory(varietyId, isActive, isBestseller, pricePerKg, finalPackSizes);

        if (success) {
            setEditedItems(prev => {
                const newState = { ...prev };
                delete newState[varietyId];
                return newState;
            });
        }
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            // 1. Update Firestore
            const orderRef = doc(db, 'orders', orderId);
            await updateDoc(orderRef, {
                status: newStatus,
                updated_at: new Date().toISOString()
            });

            // 2. Sync to Google Sheet (Fire and Forget)
            fetch('/api/update_sheet_status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId, status: newStatus })
            }).catch(err => console.error("Sheet Status Sync Failed:", err));

        } catch (error) {
            console.error("Error updating status:", error);
            alert("Failed to update status");
        }
    };

    const toggleOrderDetails = (orderId) => {
        if (expandedOrderId === orderId) {
            setExpandedOrderId(null);
        } else {
            setExpandedOrderId(orderId);
        }
    };

    const handleClearAllOrders = async () => {
        if (!window.confirm("⚠️ DANGER: Are you sure you want to DELETE ALL orders?\n\nThis action cannot be undone. All order history will be permanently lost.")) {
            return;
        }

        const confirm2 = window.prompt("Type 'DELETE' to confirm clearing all orders:");
        if (confirm2 !== 'DELETE') return;

        try {
            const q = query(collection(db, 'orders'));
            const snapshot = await getDocs(q);

            const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
            await Promise.all(deletePromises);

            alert("All orders have been cleared.");
        } catch (error) {
            console.error("Error clearing orders:", error);
            alert("Failed to clear orders.");
        }
    };

    const filteredVarieties = varieties.filter(v => {
        const product = products.find(p => p.id === v.product_id);
        const fullName = `${product?.name || ''} ${v.name}`.toLowerCase();
        return fullName.includes(searchTerm.toLowerCase());
    });

    // New: Sync Prices from MockData
    const handleSyncPrices = async () => {
        if (!window.confirm("This will reset all prices to the defaults in mockData.js. Continue?")) return;

        const { VARIETIES } = await import('../data/mockData');
        let count = 0;

        for (const v of VARIETIES) {
            const item = inventory.find(i => i.variety_id === v.id);
            if (item) {
                // Keep stock, update base price and pack prices
                const pKg = v.price_per_kg;
                const newPacks = (item.pack_sizes || []).map(pack => ({
                    ...pack,
                    price: pKg * pack.weight
                }));
                await updateInventory(
                    v.id,
                    item.is_active,
                    item.is_bestseller,
                    pKg,
                    newPacks
                );
                count++;
            }
        }
        alert(`Synced prices for ${count} items.`);
    };

    const filteredOrders = orders.filter(order => {
        // 1. Filter by Status Tab
        if (orderStatusFilter !== 'All' && order.status !== orderStatusFilter) {
            return false;
        }

        // 2. Filter by Search Term
        const searchLower = searchTerm.toLowerCase();
        if (searchLower === 'cancellation_requested') {
            return order.cancellation_requested && order.status !== 'cancelled';
        }
        return (
            order.id.toLowerCase().includes(searchLower) ||
            (order.customer_details?.name || '').toLowerCase().includes(searchLower) ||
            order.status.toLowerCase().includes(searchLower)
        );
    });

    if (!isAuthenticated) {
        return <AdminLogin onLogin={() => setIsAuthenticated(true)} />;
    }

    return (
        <div className="admin-page-new">
            <div className="admin-header-new glass-strong">
                <div className="status-section">
                    <span className="status-label">Shop Status</span>
                    <button
                        className={`status-toggle-new ${settings.shop_open ? 'open' : 'closed'}`}
                        onClick={() => updateShopStatus(!settings.shop_open)}
                    >
                        <div className="toggle-handle"></div>
                        <span className="toggle-text">{settings.shop_open ? 'OPEN' : 'CLOSED'}</span>
                    </button>
                </div>
                <button onClick={handleSyncPrices} className="logout-btn-new" style={{ marginRight: '1rem', background: '#e0f7fa', color: '#006064' }}>
                    🔄 Sync Prices
                </button>
                <button onClick={handleLogout} className="logout-btn-new">
                    <span className="icon">↪</span> Logout
                </button>
                <span style={{ position: 'absolute', bottom: '5px', right: '10px', fontSize: '0.7rem', color: '#888' }}>v1.1 (Sync Added)</span>
            </div>

            <div className="search-section">
                <div className="search-bar">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder={activeTab === 'inventory' ? "Search products..." : "Search orders..."}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Notification Center */}
            {orders.some(o => o.cancellation_requested && o.status !== 'cancelled') && (
                <div className="notification-banner" style={{ margin: '0 1rem 1rem', padding: '1rem', background: '#fff3e0', border: '1px solid #ffe0b2', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>🔔</span>
                    <div>
                        <h4 style={{ margin: 0, color: '#e65100' }}>Cancellation Requests</h4>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#ef6c00' }}>
                            {orders.filter(o => o.cancellation_requested && o.status !== 'cancelled').length} order(s) requested cancellation.
                        </p>
                    </div>
                    <button
                        onClick={() => { setActiveTab('orders'); setSearchTerm('cancellation_requested'); }}
                        style={{ marginLeft: 'auto', padding: '0.5rem 1rem', background: '#e65100', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                    >
                        View Requests
                    </button>
                </div>
            )}

            <div className="admin-tabs-new">
                <button
                    className={`tab-btn-new ${activeTab === 'inventory' ? 'active' : ''}`}
                    onClick={() => { setActiveTab('inventory'); setSearchTerm(''); }}
                >
                    Inventory
                </button>
                <button
                    className={`tab-btn-new ${activeTab === 'orders' ? 'active' : ''}`}
                    onClick={() => { setActiveTab('orders'); setSearchTerm(''); }}
                >
                    Recent Orders
                </button>
            </div>

            {activeTab === 'inventory' && (
                <div className="inventory-grid">
                    {filteredVarieties.map((variety, cardIndex) => {
                        const product = products.find(p => p.id === variety.product_id);
                        const invItem = inventory.find(i => i.variety_id === variety.id) || {
                            is_active: true,
                            is_bestseller: false,
                            price_per_kg: variety.price_per_kg,
                            pack_sizes: []
                        };

                        const edited = editedItems[variety.id] || {};
                        const hasChanges = edited.hasChanges;

                        // Current values (edited or original)
                        const currentPackSizes = (edited.pack_sizes || invItem.pack_sizes || []).filter(p => p);
                        const currentPrice = edited.price_per_kg !== undefined ? parseFloat(edited.price_per_kg) : (invItem.price_per_kg || variety.price_per_kg);
                        const currentActive = edited.is_active !== undefined ? edited.is_active : (invItem.is_active ?? true);
                        const currentBestseller = edited.is_bestseller !== undefined ? edited.is_bestseller : (invItem.is_bestseller || false);

                        // Available packaging weight options
                        const AVAILABLE_WEIGHTS = [0.5, 1, 2, 5, 10];
                        const enabledWeights = currentPackSizes.map(p => p.weight);

                        const handleToggleWeight = (weight) => {
                            const exists = currentPackSizes.findIndex(p => p.weight === weight);
                            let newArr;
                            if (exists >= 0) {
                                // Remove
                                newArr = currentPackSizes.filter((_, i) => i !== exists);
                            } else {
                                // Add with auto-calculated price
                                newArr = [...currentPackSizes, { weight, stock: 0, price: currentPrice * weight }];
                                newArr.sort((a, b) => a.weight - b.weight);
                            }
                            setEditedItems(prev => ({
                                ...prev,
                                [variety.id]: {
                                    ...prev[variety.id],
                                    pack_sizes: newArr,
                                    hasChanges: true
                                }
                            }));
                        };

                        const handleDiscardChanges = () => {
                            setEditedItems(prev => {
                                const newState = { ...prev };
                                delete newState[variety.id];
                                return newState;
                            });
                        };

                        const formatWeight = (w) => w < 1 ? `${w * 1000}g` : `${w}kg`;

                        return (
                            <div key={variety.id} className="product-card-new">
                                {/* 1. Card Header Row */}
                                <div className="card-header">
                                    <h3>{product?.name} - {variety.name}</h3>
                                    <div className="card-header-actions">
                                        <button
                                            className={`btn-edit ${hasChanges ? 'save-mode' : ''}`}
                                            onClick={() => hasChanges ? handleSave(variety.id) : null}
                                        >
                                            {hasChanges ? '💾 Save' : '✏️ Edit'}
                                        </button>
                                        {hasChanges ? (
                                            <button
                                                className="btn-cancel"
                                                onClick={handleDiscardChanges}
                                                title="Discard changes"
                                            >
                                                ✕
                                            </button>
                                        ) : (
                                            <button
                                                className="btn-delete"
                                                onClick={() => {
                                                    if (window.confirm(`Delete inventory for "${product?.name} - ${variety.name}"?`)) {
                                                        updateInventory(variety.id, false, false, 0, []);
                                                    }
                                                }}
                                            >
                                                🗑 Delete
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* 2. Product Status Row */}
                                <div className="card-status-row">
                                    <div
                                        className="status-indicator"
                                        onClick={() => handleFieldChange(variety.id, 'is_active', !currentActive)}
                                    >
                                        <span className={`dot ${currentActive ? 'active' : 'inactive'}`}></span>
                                        <span className="text">{currentActive ? 'Active' : 'Inactive'}</span>
                                    </div>
                                    <div
                                        className="status-indicator"
                                        onClick={() => handleFieldChange(variety.id, 'is_bestseller', !currentBestseller)}
                                    >
                                        <span className={`star ${currentBestseller ? 'active' : ''}`}>★</span>
                                        <span className={`text ${currentBestseller ? 'orange' : ''}`}>Best Seller</span>
                                    </div>
                                </div>

                                {/* 3. Stock Management Row */}
                                <div className="stock-row">
                                    {currentPackSizes.map((pack, index) => {
                                        const currentPackEdited = (edited.pack_sizes && edited.pack_sizes[index]) ? edited.pack_sizes[index] : {};
                                        const currentStock = currentPackEdited.stock !== undefined ? currentPackEdited.stock : pack.stock;

                                        return (
                                            <div key={`stock-${pack.weight}`} className="stock-input-group">
                                                <label>{formatWeight(pack.weight)} Stock</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={currentStock}
                                                    onChange={(e) => handleFieldChange(variety.id, 'pack_sizes', { stock: parseInt(e.target.value) || 0 }, index)}
                                                />
                                            </div>
                                        );
                                    })}
                                    {currentPackSizes.length === 0 && (
                                        <span style={{ fontSize: '0.85rem', color: '#999', fontStyle: 'italic' }}>No packaging sizes enabled — use checkboxes below</span>
                                    )}
                                </div>

                                {/* 4. Pricing & Packaging Row */}
                                <div className="pricing-packaging-row">
                                    <div className="price-input-section">
                                        <label>Price per KG (₹)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={currentPrice}
                                            onChange={(e) => handleFieldChange(variety.id, 'price_per_kg', e.target.value)}
                                        />
                                    </div>
                                    <div className="packaging-section">
                                        <span className="packaging-section-title">Packaging & Unit Sizes</span>
                                        <div className="packaging-checkboxes">
                                            {AVAILABLE_WEIGHTS.map(w => (
                                                <label key={w} className="packaging-checkbox-item">
                                                    <input
                                                        type="checkbox"
                                                        checked={enabledWeights.includes(w)}
                                                        onChange={() => handleToggleWeight(w)}
                                                    />
                                                    {formatWeight(w)}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* 5. Card Footer — Calculated Prices */}
                                {currentPackSizes.length > 0 && (
                                    <div className="card-footer-prices">
                                        {currentPackSizes.map(pack => (
                                            <span key={`price-${pack.weight}`} className="price-item">
                                                {formatWeight(pack.weight)} = ₹{(currentPrice * pack.weight).toFixed(2)}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {activeTab === 'orders' && (
                <div className="orders-list-new">
                    {/* Filter Tabs Row */}
                    <div className="order-filters" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                        {['All', 'order_placed', 'accepted', 'processing', 'out_for_delivery', 'delivered', 'cancelled'].map(status => (
                            <button
                                key={status}
                                onClick={() => setOrderStatusFilter(status)}
                                style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: '20px',
                                    border: '1px solid #ddd',
                                    background: orderStatusFilter === status ? '#2c3e50' : 'white',
                                    color: orderStatusFilter === status ? 'white' : '#666',
                                    whiteSpace: 'nowrap',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    textTransform: 'capitalize',
                                    transition: 'all 0.2s',
                                    boxShadow: orderStatusFilter === status ? '0 2px 5px rgba(0,0,0,0.2)' : 'none'
                                }}
                            >
                                {status === 'All' ? 'All Orders' : status.replace(/_/g, ' ')}
                            </button>
                        ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                        <button
                            onClick={handleClearAllOrders}
                            style={{
                                background: '#ffebee',
                                color: '#c62828',
                                border: '1px solid #ef9a9a',
                                padding: '0.5rem 1rem',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                fontSize: '0.9rem'
                            }}
                        >
                            🗑️ Clear All Orders
                        </button>
                    </div>
                    {filteredOrders.map(order => (
                        <div key={order.id} className="order-card-new">
                            <div className="order-header-new">
                                <span className="order-id-new">Order #{order.id.slice(0, 8).toUpperCase()}</span>
                                <span className={`status-badge ${order.status.toLowerCase()}`}>
                                    {order.status}
                                </span>
                            </div>

                            <div className="order-info-row">
                                <div className="info-item">
                                    <span className="icon">👤</span>
                                    <span>{order.customer_details?.name || 'Unknown Customer'}</span>
                                </div>
                            </div>

                            <div className="order-info-row">
                                <div className="info-item">
                                    <span className="icon">📅</span>
                                    <span>{new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                </div>
                            </div>

                            <div className="order-divider"></div>

                            <div className="order-footer-new">
                                <div className="total-section">
                                    <span className="label">Total Amount</span>
                                    <span className="amount">₹{order.total_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                </div>
                                <button
                                    className="view-details-btn"
                                    onClick={() => toggleOrderDetails(order.id)}
                                >
                                    {expandedOrderId === order.id ? 'Hide Details' : 'View Details'} →
                                </button>
                            </div>

                            {expandedOrderId === order.id && (
                                <div className="order-items-expanded">
                                    {order.cancellation_requested && order.status !== 'cancelled' && (
                                        <div className="cancellation-request-admin" style={{ marginBottom: '1rem', padding: '1rem', background: '#fff3e0', border: '1px solid #ffe0b2', borderRadius: '8px' }}>
                                            <h4 style={{ margin: '0 0 0.5rem', color: '#e65100' }}>⚠️ Customer Requested Cancellation</h4>
                                            <div style={{ display: 'flex', gap: '1rem' }}>
                                                <button
                                                    onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                                                    style={{ padding: '0.5rem 1rem', background: '#d32f2f', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                                                >
                                                    Approve Cancellation
                                                </button>
                                                <button
                                                    onClick={async () => {
                                                        const orderRef = doc(db, 'orders', order.id);
                                                        await updateDoc(orderRef, { cancellation_requested: false });
                                                    }}
                                                    style={{ padding: '0.5rem 1rem', background: '#fff', border: '1px solid #ccc', borderRadius: '6px', cursor: 'pointer' }}
                                                >
                                                    Reject Request
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Baserow Sync & Logistics */}
                                    <div className="shipping-actions" style={{ marginBottom: '1rem', padding: '1rem', background: '#e8eaf6', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                            <div>
                                                <h4 style={{ margin: '0 0 0.2rem', color: '#1a237e' }}>🚚 Logistics</h4>
                                                <p style={{ margin: 0, fontSize: '0.85rem', color: '#3949ab' }}>Delivery & Database actions</p>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                disabled={pushedOrderIds.has(order.id)}
                                                onClick={async () => {
                                                    try {
                                                        const res = await fetch('/api/sync_to_sheets', {
                                                            method: 'POST',
                                                            headers: { 'Content-Type': 'application/json' },
                                                            body: JSON.stringify({ order: order })
                                                        });
                                                        const data = await res.json();
                                                        if (!res.ok) throw new Error(data.error);

                                                        // Mark as pushed locally
                                                        setPushedOrderIds(prev => new Set(prev).add(order.id));
                                                        alert("✅ Synced to Google Sheet Successfully!");
                                                    } catch (e) {
                                                        alert(`Sync Failed: ${e.message}`);
                                                    }
                                                }}
                                                style={{
                                                    flex: 1,
                                                    padding: '0.6rem',
                                                    background: pushedOrderIds.has(order.id) ? '#e0e0e0' : '#fff',
                                                    border: pushedOrderIds.has(order.id) ? '1px solid #999' : '1px solid #0f9d58',
                                                    color: pushedOrderIds.has(order.id) ? '#666' : '#0f9d58',
                                                    borderRadius: '6px',
                                                    cursor: pushedOrderIds.has(order.id) ? 'not-allowed' : 'pointer',
                                                    fontWeight: 'bold',
                                                    opacity: pushedOrderIds.has(order.id) ? 0.7 : 1
                                                }}
                                            >
                                                {pushedOrderIds.has(order.id) ? "✅ Pushed!" : "☁️ Push to Google Sheet"}
                                            </button>

                                            <button
                                                onClick={async () => {
                                                    if (!window.confirm(`Create Delhivery Shipment for Order #${order.id.slice(0, 8).toUpperCase()}?`)) return;
                                                    try {
                                                        const res = await fetch('/api/manual_ship', {
                                                            method: 'POST',
                                                            headers: { 'Content-Type': 'application/json' },
                                                            body: JSON.stringify({ orderId: order.id, order: order })
                                                        });
                                                        const data = await res.json();
                                                        if (!res.ok) throw new Error(data.error);
                                                        alert(`Shipment Created! AWB: ${data.awb}`);
                                                    } catch (e) {
                                                        alert(`Shipment Failed: ${e.message}`);
                                                    }
                                                }}
                                                style={{
                                                    flex: 1,
                                                    padding: '0.6rem',
                                                    background: '#3f51b5',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    fontWeight: 'bold',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                                }}
                                            >
                                                🚀 Ship (Delhivery)
                                            </button>
                                        </div>
                                    </div>

                                    <div className="status-update-section" style={{ marginBottom: '1rem', padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
                                        <h4 style={{ marginTop: 0 }}>Update Status</h4>
                                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                            {['order_placed', 'accepted', 'processing', 'out_for_delivery', 'delivered', 'cancelled'].map(status => (
                                                <button
                                                    key={status}
                                                    onClick={() => handleStatusUpdate(order.id, status)}
                                                    style={{
                                                        padding: '0.4rem 0.8rem',
                                                        border: '1px solid #ddd',
                                                        borderRadius: '20px',
                                                        background: order.status === status ? '#4CAF50' : 'white',
                                                        color: order.status === status ? 'white' : '#333',
                                                        cursor: 'pointer',
                                                        fontSize: '0.8rem',
                                                        textTransform: 'capitalize'
                                                    }}
                                                >
                                                    {status.replace(/_/g, ' ')}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <h4>Order Items</h4>
                                    {order.cart_items?.filter(item => item).map((item, idx) => (
                                        <div key={idx} className="expanded-item">
                                            <span>{item.productName || 'Unknown'} ({item.varietyName || '-'})</span>
                                            <span>{item.quantity || 0} x {item.quantityKg || 0}kg</span>
                                        </div>
                                    ))}
                                    <div className="customer-info-expanded">
                                        <h4>Delivery Details</h4>
                                        {typeof order.customer_details?.address === 'object' && order.customer_details?.address !== null ? (
                                            <>
                                                <p>{order.customer_details.address.addressLine1}, {order.customer_details.address.addressLine2}</p>
                                                <p>{order.customer_details.address.city}, {order.customer_details.address.pincode}</p>
                                            </>
                                        ) : (
                                            <p>{order.customer_details?.address || 'No address provided'}</p>
                                        )}
                                        <p>{order.customer_details?.phone || 'No phone provided'}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                    {filteredOrders.length === 0 && (
                        <div className="no-results">No orders found matching "{searchTerm}"</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Admin;
