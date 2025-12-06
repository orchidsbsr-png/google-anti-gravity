import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';
import './MyOrders.css';

const MyOrders = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('requested'); // requested, completed, cancelled
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        // Query orders where customer email matches
        // Note: Removed orderBy to avoid index requirement errors. Sorting client-side.
        const q = query(
            collection(db, 'orders'),
            where('customer_details.email', '==', user.email)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const loadedOrders = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Sort client-side
            loadedOrders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            setOrders(loadedOrders);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching orders:", error);
            setError("Failed to load orders. Please try again later.");
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const getStatusCategory = (status) => {
        if (!status) return 'requested';
        const s = status.toLowerCase();
        if (s === 'delivered') return 'completed';
        if (s === 'cancelled') return 'cancelled';
        return 'requested'; // order_placed, accepted, processing, out_for_delivery, pending, confirmed
    };

    const filteredOrders = orders.filter(order =>
        getStatusCategory(order.status) === activeTab
    );

    const formatDate = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    const getOrderTitle = (items) => {
        if (!items || items.length === 0) return 'Order';
        const firstItem = items[0];
        if (!firstItem) return 'Order';

        if (items.length === 1) return firstItem.productName || 'Item';

        const secondItem = items[1];
        if (items.length === 2) return `${firstItem.productName || 'Item'} & ${secondItem?.productName || 'Item'}`;

        return `${firstItem.productName || 'Item'} & ${items.length - 1} more`;
    };

    if (loading) return <div className="loading">Loading orders...</div>;

    if (!user) return (
        <div className="my-orders-page">
            <div className="no-orders">
                <p>Please login to view your orders.</p>
                <Link to="/login" className="start-shopping-btn">Login</Link>
            </div>
        </div>
    );

    return (
        <div className="my-orders-page">
            <div className="page-header">
                <h1>My Orders</h1>
            </div>

            {error && (
                <div style={{ padding: '1rem', background: '#ffebee', color: '#c62828', borderRadius: '8px', marginBottom: '1rem' }}>
                    {error}
                </div>
            )}

            <div className="orders-tabs">
                <button
                    className={`tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
                    onClick={() => setActiveTab('completed')}
                >
                    Completed
                </button>
                <button
                    className={`tab-btn ${activeTab === 'cancelled' ? 'active' : ''}`}
                    onClick={() => setActiveTab('cancelled')}
                >
                    Cancelled
                </button>
                <button
                    className={`tab-btn ${activeTab === 'requested' ? 'active' : ''}`}
                    onClick={() => setActiveTab('requested')}
                >
                    Requested
                </button>
            </div>

            <div className="orders-list">
                {filteredOrders.length > 0 ? (
                    filteredOrders.map(order => (
                        <div key={order.id} className="order-card-customer">
                            <div className="card-top">
                                <h3>{getOrderTitle(order.cart_items)}</h3>
                                <span className="order-ref">#{order.id.slice(0, 8).toUpperCase()}</span>
                            </div>
                            <span className="order-date">{formatDate(order.created_at)}</span>

                            <div className="card-bottom">
                                <span className={`status-pill ${getStatusCategory(order.status)}`}>
                                    {(order.status || 'pending').replace('_', ' ')}
                                </span>
                                <button
                                    className="view-summary-btn"
                                    onClick={() => navigate(`/orders/${order.id}`)}
                                >
                                    View Summary
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-orders">
                        <p>No {activeTab} orders found.</p>
                        <Link to="/" className="start-shopping-btn">Start Shopping</Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyOrders;
