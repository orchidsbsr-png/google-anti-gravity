import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../supabase';
import { Link, useNavigate } from 'react-router-dom';
import { pushSupported, enableOrderNotifications } from '../utils/push';
import './MyOrders.css';

// Live Delhivery scans for one shipment, fetched when the panel opens
const TrackingPanel = ({ awb }) => {
    const { t } = useLanguage();
    const [state, setState] = useState({ loading: true, error: null, scans: [], latest: null });

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            try {
                const res = await fetch(`/api/shipment?action=track&waybill=${encodeURIComponent(awb)}`);
                const json = await res.json();
                if (!res.ok) throw new Error(json.error || 'Tracking unavailable');

                const shipment = json.ShipmentData?.[0]?.Shipment;
                if (!shipment) throw new Error('No tracking data yet');

                const scans = (shipment.Scans || [])
                    .map(s => s.ScanDetail || s)
                    .filter(s => s.Scan || s.Instructions)
                    .reverse()
                    .slice(0, 5);

                if (!cancelled) {
                    setState({
                        loading: false,
                        error: null,
                        scans,
                        latest: shipment.Status?.Status || null
                    });
                }
            } catch (err) {
                if (!cancelled) setState({ loading: false, error: err.message, scans: [], latest: null });
            }
        };
        load();
        return () => { cancelled = true; };
    }, [awb]);

    if (state.loading) return <p className="tracking-note">{t('orders.trackLoading')}</p>;
    if (state.error) return <p className="tracking-note">{t('orders.trackError')}</p>;

    return (
        <div className="tracking-scans">
            {state.latest && <p className="tracking-latest">{state.latest}</p>}
            {state.scans.map((scan, i) => (
                <div key={i} className="tracking-scan">
                    <span className="scan-dot" aria-hidden="true" />
                    <div>
                        <p className="scan-text">{scan.Instructions || scan.Scan}</p>
                        <p className="scan-meta">
                            {scan.ScannedLocation ? `${scan.ScannedLocation} · ` : ''}
                            {scan.ScanDateTime ? new Date(scan.ScanDateTime).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : ''}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
};

const MyOrders = () => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('requested'); // requested, completed, cancelled
    const [error, setError] = useState(null);
    const [trackingOpenId, setTrackingOpenId] = useState(null);
    const [notifyState, setNotifyState] = useState(
        () => (typeof Notification !== 'undefined' ? Notification.permission : 'unsupported')
    );
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        // Query orders where customer email matches
        const fetchOrders = async () => {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .eq('customer_details->>email', user.email)
                .order('created_at', { ascending: false });

            if (error) {
                console.error("Error fetching orders:", error);
                setError("Failed to load orders. Please try again later.");
            } else {
                setOrders(data || []);
            }
            setLoading(false);
        };

        fetchOrders();

        // Live updates when order status changes
        const channel = supabase
            .channel(`orders-${user.id}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchOrders())
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [user]);

    const getStatusCategory = (status) => {
        if (!status) return 'requested';
        const s = status.toLowerCase();
        if (s === 'delivered') return 'completed';
        if (s === 'cancelled') return 'cancelled';
        return 'requested'; // order_placed, accepted, processing, out_for_delivery, pending, confirmed
    };

    // Journey position for the mini progress row (skip for cancelled orders)
    const getStageIndex = (status) => {
        const s = (status || '').toLowerCase();
        if (s === 'delivered') return 3;
        if (s === 'out_for_delivery') return 2;
        if (s === 'processing') return 1;
        return 0; // pending, confirmed, order_placed, accepted
    };

    const stages = [
        t('orders.stagePlaced'),
        t('orders.stagePacked'),
        t('orders.stageOut'),
        t('orders.stageDelivered')
    ];

    const handleEnableNotifications = async () => {
        const ok = await enableOrderNotifications(user.id);
        setNotifyState(ok ? 'granted' : Notification.permission);
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
                <p>{t('orders.loginPrompt')}</p>
                <Link to="/login" className="start-shopping-btn">{t('orders.login')}</Link>
            </div>
        </div>
    );

    return (
        <div className="my-orders-page">
            <div className="page-header">
                <h1>{t('orders.title')}</h1>
            </div>

            {error && (
                <div style={{ padding: '1rem', background: '#ffebee', color: '#c62828', borderRadius: '8px', marginBottom: '1rem' }}>
                    {error}
                </div>
            )}

            {pushSupported() && notifyState === 'default' && (
                <div className="notify-banner">
                    <p>{t('orders.notifyPrompt')}</p>
                    <button onClick={handleEnableNotifications}>{t('orders.notifyBtn')}</button>
                </div>
            )}

            <div className="orders-tabs">
                <button
                    className={`tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
                    onClick={() => setActiveTab('completed')}
                >
                    {t('orders.tabCompleted')}
                </button>
                <button
                    className={`tab-btn ${activeTab === 'cancelled' ? 'active' : ''}`}
                    onClick={() => setActiveTab('cancelled')}
                >
                    {t('orders.tabCancelled')}
                </button>
                <button
                    className={`tab-btn ${activeTab === 'requested' ? 'active' : ''}`}
                    onClick={() => setActiveTab('requested')}
                >
                    {t('orders.tabActive')}
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

                            {getStatusCategory(order.status) !== 'cancelled' && (
                                <div className="order-progress" aria-label={`Status: ${stages[getStageIndex(order.status)]}`}>
                                    {stages.map((label, i) => (
                                        <div key={label} className={`progress-stage ${i <= getStageIndex(order.status) ? 'reached' : ''}`}>
                                            <span className="progress-dot" />
                                            <span className="progress-label">{label}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="card-bottom">
                                <span className={`status-pill ${getStatusCategory(order.status)}`}>
                                    {(order.status || 'pending').replace(/_/g, ' ')}
                                </span>
                                <div className="card-actions">
                                    {order.awb_number && getStatusCategory(order.status) !== 'cancelled' && (
                                        <button
                                            className="view-summary-btn"
                                            onClick={() => setTrackingOpenId(trackingOpenId === order.id ? null : order.id)}
                                        >
                                            {trackingOpenId === order.id ? t('orders.hideTrack') : t('orders.track')}
                                        </button>
                                    )}
                                    <button
                                        className="view-summary-btn"
                                        onClick={() => navigate(`/orders/${order.id}`)}
                                    >
                                        {t('orders.viewSummary')}
                                    </button>
                                </div>
                            </div>

                            {trackingOpenId === order.id && order.awb_number && (
                                <div className="tracking-panel">
                                    <p className="tracking-awb">AWB · {order.awb_number}</p>
                                    <TrackingPanel awb={order.awb_number} />
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="no-orders">
                        <p>{t('orders.none')}</p>
                        <Link to="/" className="start-shopping-btn">{t('orders.startShopping')}</Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyOrders;
