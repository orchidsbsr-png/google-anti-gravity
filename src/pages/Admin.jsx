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

    const handleFieldChange = (varietyId, field, value) => {
        setEditedItems(prev => ({
            ...prev,
            [varietyId]: {
                ...prev[varietyId],
                [field]: value,
                hasChanges: true
            }
        }));
    };

    const handleSave = async (varietyId) => {
        const item = inventory.find(i => i.variety_id === varietyId) || {
            stock_5kg: 0,
            stock_10kg: 0,
            is_active: true,
            is_bestseller: false,
            price_per_kg: varieties.find(v => v.id === varietyId)?.price_per_kg || 0
        };

        const edited = editedItems[varietyId] || {};

        const stock5kg = edited.stock_5kg !== undefined ? parseInt(edited.stock_5kg) || 0 : (item.stock_5kg || 0);
        const stock10kg = edited.stock_10kg !== undefined ? parseInt(edited.stock_10kg) || 0 : (item.stock_10kg || 0);
        const isActive = edited.is_active !== undefined ? edited.is_active : (item.is_active ?? true);
        const isBestseller = edited.is_bestseller !== undefined ? edited.is_bestseller : (item.is_bestseller ?? false);
        const pricePerKg = edited.price_per_kg !== undefined ? parseFloat(edited.price_per_kg) || 0 : (item.price_per_kg || 0);

        const price5kg = pricePerKg * 5;
        const price10kg = pricePerKg * 10;

        const success = await updateInventory(varietyId, stock5kg, stock10kg, isActive, isBestseller, price5kg, price10kg, pricePerKg);

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
            const orderRef = doc(db, 'orders', orderId);
            await updateDoc(orderRef, {
                status: newStatus,
                updated_at: new Date().toISOString()
            });
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
                // Keep stock, update price
                const pKg = v.price_per_kg;
                await updateInventory(
                    v.id,
                    item.stock_5kg,
                    item.stock_10kg,
                    item.is_active,
                    item.is_bestseller,
                    pKg * 5,
                    pKg * 10,
                    pKg
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
                    {filteredVarieties.map(variety => {
                        const product = products.find(p => p.id === variety.product_id);
                        const invItem = inventory.find(i => i.variety_id === variety.id) || {
                            stock_5kg: 0,
                            stock_10kg: 0,
                            is_active: true,
                            is_bestseller: false,
                            price_per_kg: variety.price_per_kg
                        };

                        const edited = editedItems[variety.id] || {};
                        const hasChanges = edited.hasChanges;

                        // Current values (edited or original)
                        const currentStock5kg = edited.stock_5kg !== undefined ? edited.stock_5kg : (invItem.stock_5kg || 0);
                        const currentStock10kg = edited.stock_10kg !== undefined ? edited.stock_10kg : (invItem.stock_10kg || 0);
                        const currentPrice = edited.price_per_kg !== undefined ? edited.price_per_kg : (invItem.price_per_kg || variety.price_per_kg);
                        const currentActive = edited.is_active !== undefined ? edited.is_active : (invItem.is_active ?? true);
                        const currentBestseller = edited.is_bestseller !== undefined ? edited.is_bestseller : (invItem.is_bestseller || false);

                        return (
                            <div key={variety.id} className="product-card-new">
                                <div className="card-header">
                                    <h3>{product?.name} - {variety.name}</h3>
                                    <button
                                        className={`edit-btn ${hasChanges ? 'save-mode' : ''}`}
                                        onClick={() => hasChanges ? handleSave(variety.id) : null}
                                    >
                                        {hasChanges ? '💾 Save' : '✎ Edit'}
                                    </button>
                                </div>

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

                                <div className="stock-inputs-row">
                                    <div className="input-col">
                                        <label>5kg Stock</label>
                                        <input
                                            type="number"
                                            value={currentStock5kg}
                                            onChange={(e) => handleFieldChange(variety.id, 'stock_5kg', e.target.value)}
                                        />
                                    </div>
                                    <div className="input-col">
                                        <label>10kg Stock</label>
                                        <input
                                            type="number"
                                            value={currentStock10kg}
                                            onChange={(e) => handleFieldChange(variety.id, 'stock_10kg', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="price-input-row">
                                    <label>Price per KG (₹)</label>
                                    <input
                                        type="number"
                                        value={currentPrice}
                                        onChange={(e) => handleFieldChange(variety.id, 'price_per_kg', e.target.value)}
                                    />
                                </div>

                                <div className="card-footer">
                                    <span>5kg = ₹{(currentPrice * 5).toFixed(2)}</span>
                                    <span>10kg = ₹{(currentPrice * 10).toFixed(2)}</span>
                                </div>
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

                                    {/* Delhivery Shipment Trigger */}
                                    <div className="shipping-actions" style={{ marginBottom: '1rem', padding: '1rem', background: '#e8eaf6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div>
                                            <h4 style={{ margin: '0 0 0.5rem', color: '#1a237e' }}>🚚 Logistics</h4>
                                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#3949ab' }}>
                                                Generate Delhivery AWB for this order.
                                            </p>
                                        </div>
                                        <button
                                            onClick={async () => {
                                                if (!window.confirm(`Create Delhivery Shipment for Order #${order.id.slice(0, 8).toUpperCase()}?`)) return;
                                                try {
                                                    const res = await fetch('/api/manual_ship', {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({ orderId: order.id })
                                                    });
                                                    const data = await res.json();
                                                    if (!res.ok) throw new Error(data.error);
                                                    alert(`Shipment Created! AWB: ${data.awb}`);
                                                } catch (e) {
                                                    alert(`Failed: ${e.message}`);
                                                }
                                            }}
                                            style={{
                                                padding: '0.6rem 1.2rem',
                                                background: '#673ab7',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontWeight: 'bold',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                            }}
                                        >
                                            🚀 Create Shipment
                                        </button>
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
