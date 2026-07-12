import React, { useState, useEffect } from 'react';
import { useInventory } from '../context/InventoryContext';
import { useProduct } from '../context/ProductContext';
import { supabase } from '../supabase';
import AdminLogin from '../components/AdminLogin';
import { LogoMark } from '../components/Logo';
import '../components/AdminLogin.css';
import './Admin.css';

// ---- shared bits -----------------------------------------------------

const ic = {
    w: 16, h: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round'
};
const I = {
    overview: <svg {...ic} width="17" height="17"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>,
    orders: <svg {...ic} width="17" height="17"><path d="M21 8v13H3V8" /><path d="M1 3h22v5H1z" /><path d="M10 12h4" /></svg>,
    inventory: <svg {...ic} width="17" height="17"><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>,
    search: <svg {...ic} width="14" height="14"><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.2" y2="16.2" /></svg>,
    logout: <svg {...ic} width="15" height="15"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /></svg>,
    rupee: <svg {...ic} width="13" height="13"><path d="M6 3h12M6 8h12M6 8c6 0 8 2 8 6.5S11 21 8 21c3-3 4-6.5 1-13" /></svg>,
    clock: <svg {...ic} width="13" height="13"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>,
    alert: <svg {...ic} width="13" height="13"><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>,
    chevron: <svg {...ic} width="15" height="15"><path d="M6 9l6 6 6-6" /></svg>,
    arrow: <svg {...ic} width="12" height="12" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>,
    external: <svg {...ic} width="12" height="12" strokeWidth="2"><path d="M7 17 17 7M8 7h9v9" /></svg>,
    star: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinejoin="round"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z" /></svg>,
    truck: <svg {...ic} width="14" height="14"><path d="M1 6h14v11H1z" /><path d="M15 10h4l3 4v3h-7" /><circle cx="6" cy="19" r="1.6" /><circle cx="18" cy="19" r="1.6" /></svg>,
    check: <svg {...ic} width="12" height="12" strokeWidth="2.4"><path d="M20 6 9 17l-5-5" /></svg>,
    x: <svg {...ic} width="14" height="14"><path d="M18 6 6 18M6 6l12 12" /></svg>,
    sync: <svg {...ic} width="14" height="14"><path d="M21 12a9 9 0 1 1-2.6-6.4" /><path d="M21 3v6h-6" /></svg>,
    trash: <svg {...ic} width="14" height="14"><path d="M3 6h18" /><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /></svg>,
    leaf: <svg {...ic} width="14" height="14"><path d="M12 22V10" /><path d="M12 10C12 5.5 8.5 3 4.5 3c0 4.5 3.5 7 7.5 7z" /><path d="M12 13c0-3.8 3-6 6.5-6c0 3.8-3 6-6.5 6z" /></svg>,
    label: <svg {...ic} width="14" height="14"><path d="M20.6 13.4 12 22 2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8z" /><circle cx="7.5" cy="7.5" r="1.5" /></svg>,
    sheet: <svg {...ic} width="14" height="14"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M8 13h8M8 17h8" /></svg>,
    table: <svg {...ic} width="17" height="17"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 10h18M9 10v10M15 10v10" /></svg>,
    copy: <svg {...ic} width="13" height="13"><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>,
};

const STATUS_META = {
    order_placed: { label: 'PLACED', cls: 'confirmed' },
    confirmed: { label: 'CONFIRMED', cls: 'confirmed' },
    accepted: { label: 'ACCEPTED', cls: 'confirmed' },
    processing: { label: 'PACKED', cls: 'packed' },
    out_for_delivery: { label: 'SHIPPED', cls: 'shipped' },
    delivered: { label: 'DELIVERED', cls: 'delivered' },
    cancelled: { label: 'CANCELLED', cls: 'cancel' },
};

const NEXT_STEP = {
    order_placed: { to: 'processing', label: 'Mark packed' },
    confirmed: { to: 'processing', label: 'Mark packed' },
    accepted: { to: 'processing', label: 'Mark packed' },
    processing: { to: 'out_for_delivery', label: 'Mark shipped' },
    out_for_delivery: { to: 'delivered', label: 'Mark delivered' },
};

const TO_PACK = ['order_placed', 'confirmed', 'accepted'];
const ALL_STATUSES = ['order_placed', 'confirmed', 'accepted', 'processing', 'out_for_delivery', 'delivered', 'cancelled'];
const AVAILABLE_WEIGHTS = [0.5, 1, 2, 5, 10];

const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const formatWeight = (w) => w < 1 ? `${w * 1000}g` : `${w}kg`;
const isSameDay = (a, b) => new Date(a).toDateString() === new Date(b).toDateString();

// ---- component -------------------------------------------------------

const Admin = () => {
    const { inventory, settings, updateInventory, updateShopStatus, updateNowPicking, sellingFastThreshold, updateSellingFastThreshold } = useInventory();
    const { products, varieties } = useProduct();

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [view, setView] = useState('overview');
    const [orders, setOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [orderStatusFilter, setOrderStatusFilter] = useState('All');
    const [expandedOrderId, setExpandedOrderId] = useState(null);
    const [expandedVarietyId, setExpandedVarietyId] = useState(null);
    const [editedItems, setEditedItems] = useState({});
    const [pushedOrderIds, setPushedOrderIds] = useState(new Set());
    const [nowPickingDraft, setNowPickingDraft] = useState('');
    const [savingPicking, setSavingPicking] = useState(false);
    const [thresholdDraft, setThresholdDraft] = useState(10);
    const [copiedAwb, setCopiedAwb] = useState(null);

    useEffect(() => {
        setThresholdDraft(sellingFastThreshold);
    }, [sellingFastThreshold]);

    useEffect(() => {
        if (sessionStorage.getItem('admin_auth') === 'true') setIsAuthenticated(true);
    }, []);

    useEffect(() => {
        setNowPickingDraft(settings?.now_picking || '');
    }, [settings?.now_picking]);

    useEffect(() => {
        if (!isAuthenticated) return;
        const fetchOrders = async () => {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) { console.error('Error loading orders:', error); return; }
            setOrders(data || []);
        };
        fetchOrders();
        const channel = supabase
            .channel('admin-orders')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchOrders())
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [isAuthenticated]);

    // ---- derived numbers for the Overview ----
    const now = new Date();
    const liveOrders = orders.filter(o => o.status !== 'cancelled');
    const todays = liveOrders.filter(o => isSameDay(o.created_at, now));
    const revenueToday = todays.reduce((s, o) => s + (o.total_price || 0), 0);
    const codToday = todays.filter(o => o.payment_method === 'cod').length;
    const toPackOrders = orders.filter(o => TO_PACK.includes(o.status));
    const cancelRequests = orders.filter(o => o.cancellation_requested && o.status !== 'cancelled');
    const lowStock = varieties.flatMap(v => {
        const inv = inventory.find(i => i.variety_id === v.id);
        if (!inv || !inv.is_active) return [];
        return (inv.pack_sizes || []).filter(p => Number(p.stock) <= 5)
            .map(p => ({ variety: v, product: products.find(pr => pr.id === v.product_id), pack: p }));
    });

    const weekSeries = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return liveOrders
            .filter(o => isSameDay(o.created_at, d))
            .reduce((s, o) => s + (o.total_price || 0), 0);
    });
    const sparkMax = Math.max(...weekSeries, 1);
    const sparkPts = weekSeries.map((v, i) => [4 + i * (152 / 6), 30 - (v / sparkMax) * 24]);
    const sparkLine = sparkPts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');

    const oldestToPackHrs = toPackOrders.length
        ? Math.round((now - new Date(Math.min(...toPackOrders.map(o => new Date(o.created_at))))) / 36e5)
        : 0;

    // ---- handlers (same behaviour as before, same endpoints) ----
    const handleLogout = () => {
        setIsAuthenticated(false);
        sessionStorage.removeItem('admin_auth');
    };

    const handleFieldChange = (varietyId, field, value, packIndex = null) => {
        setEditedItems(prev => {
            const currentItem = prev[varietyId] || {};
            let newPackSizes = currentItem.pack_sizes ? [...currentItem.pack_sizes] : [];
            if (packIndex !== null && field === 'pack_sizes') {
                newPackSizes[packIndex] = { ...newPackSizes[packIndex], ...value };
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
            is_active: true, is_bestseller: false,
            price_per_kg: varieties.find(v => v.id === varietyId)?.price_per_kg || 0,
            pack_sizes: []
        };
        const edited = editedItems[varietyId] || {};
        const isActive = edited.is_active !== undefined ? edited.is_active : (item.is_active ?? true);
        const isBestseller = edited.is_bestseller !== undefined ? edited.is_bestseller : (item.is_bestseller ?? false);
        const pricePerKg = edited.price_per_kg !== undefined ? parseFloat(edited.price_per_kg) || 0 : (item.price_per_kg || 0);

        let finalPackSizes;
        if (edited.pack_sizes && Array.isArray(edited.pack_sizes)) {
            const isCompleteArray = edited.pack_sizes.length === 0 || (edited.pack_sizes[0] && edited.pack_sizes[0].weight !== undefined);
            if (isCompleteArray) {
                finalPackSizes = edited.pack_sizes.filter(p => p).map(pack => ({
                    weight: Number(pack.weight),
                    stock: Number(pack.stock ?? 0),
                    price: Number(pack.price ?? pricePerKg * pack.weight)
                }));
            } else {
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

    const handleDiscard = (varietyId) => {
        setEditedItems(prev => {
            const newState = { ...prev };
            delete newState[varietyId];
            return newState;
        });
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            const { error } = await supabase.from('orders').update({
                status: newStatus,
                updated_at: new Date().toISOString()
            }).eq('id', orderId);
            if (error) throw error;
            fetch('/api/update_sheet_status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId, status: newStatus })
            }).catch(err => console.error('Sheet Status Sync Failed:', err));
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status');
        }
    };

    const handleClearAllOrders = async () => {
        if (!window.confirm('⚠️ DANGER: Are you sure you want to DELETE ALL orders?\n\nThis action cannot be undone. All order history will be permanently lost.')) return;
        const confirm2 = window.prompt("Type 'DELETE' to confirm clearing all orders:");
        if (confirm2 !== 'DELETE') return;
        try {
            // .select() returns the deleted rows — without it a permission
            // block deletes nothing yet reports no error.
            const { data, error } = await supabase
                .from('orders')
                .delete()
                .not('id', 'is', null)
                .select('id');
            if (error) throw error;
            if (!data || data.length === 0) {
                alert(
                    'Nothing was deleted — the database refused silently.\n\n' +
                    'Your orders table is missing the DELETE permission. Run this once in Supabase → SQL Editor:\n\n' +
                    'CREATE POLICY "delete orders" ON orders FOR DELETE USING (true);'
                );
                return;
            }
            alert(`Deleted ${data.length} order${data.length !== 1 ? 's' : ''}.`);
        } catch (error) {
            console.error('Error clearing orders:', error);
            alert(`Failed to clear orders: ${error.message}`);
        }
    };

    const handleSyncPrices = async () => {
        if (!window.confirm('This will reset all prices to the defaults in mockData.js. Continue?')) return;
        const { VARIETIES } = await import('../data/mockData');
        let count = 0;
        for (const v of VARIETIES) {
            const item = inventory.find(i => i.variety_id === v.id);
            if (item) {
                const pKg = v.price_per_kg;
                const newPacks = (item.pack_sizes || []).map(pack => ({ ...pack, price: pKg * pack.weight }));
                await updateInventory(v.id, item.is_active, item.is_bestseller, pKg, newPacks);
                count++;
            }
        }
        alert(`Synced prices for ${count} items.`);
    };

    const handleSchedulePickup = async () => {
        const shippedCount = orders.filter(o => o.awb_number && o.status === 'processing').length;
        const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
        const pickupDate = window.prompt('Pickup date (YYYY-MM-DD):', tomorrow);
        if (!pickupDate) return;
        const pickupTime = window.prompt('Pickup time (HH:MM:SS):', '14:00:00');
        if (!pickupTime) return;
        const count = window.prompt('Expected number of packages:', String(shippedCount || 1));
        if (!count) return;
        try {
            const res = await fetch('/api/shipment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'pickup',
                    pickup_date: pickupDate,
                    pickup_time: pickupTime,
                    expected_package_count: Number(count)
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            alert(`✅ Pickup scheduled for ${pickupDate} ${pickupTime}.\nPickup ID: ${data.pickup_id || JSON.stringify(data).slice(0, 200)}`);
        } catch (e) {
            alert(`Pickup Failed: ${e.message}`);
        }
    };

    const handlePushToSheet = async (order) => {
        try {
            const res = await fetch('/api/sync_to_sheets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ order })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setPushedOrderIds(prev => new Set(prev).add(order.id));
            alert('✅ Synced to Google Sheet Successfully!');
        } catch (e) {
            alert(`Sync Failed: ${e.message}`);
        }
    };

    const handleManualShip = async (order) => {
        if (!window.confirm(`Create Delhivery Shipment for Order #${order.id.slice(0, 8).toUpperCase()}?`)) return;
        try {
            const res = await fetch('/api/manual_ship', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId: order.id, order })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            alert(`Shipment Created! AWB: ${data.awb}`);
        } catch (e) {
            alert(`Shipment Failed: ${e.message}`);
        }
    };

    const handleLabel = async (order) => {
        try {
            const res = await fetch(`/api/shipment?action=label&waybill=${encodeURIComponent(order.awb_number)}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            const link = data.packages?.[0]?.pdf_download_link;
            if (link) window.open(link, '_blank');
            else alert('Label generated but no PDF link returned:\n' + JSON.stringify(data).slice(0, 300));
        } catch (e) {
            alert(`Label Failed: ${e.message}`);
        }
    };

    const handleCancelShipment = async (order) => {
        if (!window.confirm(`Cancel the Delhivery shipment for AWB ${order.awb_number}? The order stays; you can re-ship later.`)) return;
        try {
            const res = await fetch('/api/shipment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'cancel', waybill: order.awb_number })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            await supabase.from('orders').update({ awb_number: null, status: 'confirmed' }).eq('id', order.id);
            alert('✅ Shipment cancelled. Order reset to confirmed — you can re-ship it.');
        } catch (e) {
            alert(`Cancel Failed: ${e.message}`);
        }
    };

    const handleRejectCancellation = async (orderId) => {
        await supabase.from('orders').update({ cancellation_requested: false }).eq('id', orderId);
    };

    const handleSaveNowPicking = async () => {
        setSavingPicking(true);
        await updateNowPicking(nowPickingDraft.trim());
        setSavingPicking(false);
    };

    // Season switch: one toggle flips every variety of a fruit in or out
    // of the shop at once (e.g. cherry season ends → cherries disappear).
    const handleToggleProductSeason = async (group) => {
        const anyActive = group.vars.some(v => {
            const inv = inventory.find(i => i.variety_id === v.id);
            return inv ? inv.is_active !== false : true;
        });
        const target = !anyActive;
        for (const v of group.vars) {
            const item = inventory.find(i => i.variety_id === v.id) || {
                is_active: true, is_bestseller: false,
                price_per_kg: v.price_per_kg, pack_sizes: []
            };
            await updateInventory(
                v.id,
                target,
                item.is_bestseller ?? false,
                item.price_per_kg || v.price_per_kg,
                item.pack_sizes || []
            );
        }
    };

    // ---- filtered lists ----
    const filteredOrders = orders.filter(order => {
        if (orderStatusFilter === 'to_pack' && !TO_PACK.includes(order.status)) return false;
        if (orderStatusFilter === 'processing' && order.status !== 'processing') return false;
        if (orderStatusFilter === 'out_for_delivery' && order.status !== 'out_for_delivery') return false;
        if (orderStatusFilter === 'delivered' && order.status !== 'delivered') return false;
        if (orderStatusFilter === 'cancelled' && order.status !== 'cancelled') return false;
        if (orderStatusFilter === 'cancel_requests' && !(order.cancellation_requested && order.status !== 'cancelled')) return false;
        const s = searchTerm.toLowerCase();
        if (!s) return true;
        return (
            order.id.toLowerCase().includes(s) ||
            (order.customer_details?.name || '').toLowerCase().includes(s) ||
            order.status.toLowerCase().includes(s)
        );
    });

    const filteredVarieties = varieties.filter(v => {
        const product = products.find(p => p.id === v.product_id);
        return `${product?.name || ''} ${v.name}`.toLowerCase().includes(searchTerm.toLowerCase());
    });
    const productGroups = products
        .map(p => ({ product: p, vars: filteredVarieties.filter(v => v.product_id === p.id) }))
        .filter(g => g.vars.length > 0);

    // Customer sheet: every order as one row — searchable by anything
    const sheetOrders = orders.filter(o => {
        const s = searchTerm.toLowerCase();
        if (!s) return true;
        const d = o.customer_details || {};
        return (
            o.id.toLowerCase().includes(s) ||
            (d.name || '').toLowerCase().includes(s) ||
            (d.phone || '').toLowerCase().includes(s) ||
            (d.email || '').toLowerCase().includes(s) ||
            (o.awb_number || '').toLowerCase().includes(s) ||
            o.status.toLowerCase().includes(s)
        );
    });

    const copyAwb = (awb) => {
        navigator.clipboard?.writeText(awb);
        setCopiedAwb(awb);
        setTimeout(() => setCopiedAwb(null), 1500);
    };

    const exportSheetCsv = () => {
        const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
        const rows = sheetOrders.map(o => {
            const d = o.customer_details || {};
            const addr = typeof d.address === 'object' && d.address !== null ? d.address : {};
            return [
                `#${o.id.slice(0, 8).toUpperCase()}`,
                new Date(o.created_at).toLocaleDateString('en-IN'),
                d.name || '', d.phone || '', d.email || '',
                addr.city || '', addr.pincode || '',
                o.total_price || 0,
                o.payment_method === 'cod' ? 'COD' : 'Online',
                o.status,
                o.awb_number || ''
            ].map(esc).join(',');
        });
        const csv = ['Order,Date,Name,Phone,Email,City,Pincode,Total,Payment,Status,AWB', ...rows].join('\r\n');
        // BOM so Excel opens it as UTF-8
        const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `naliban-orders-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(a.href);
    };

    const orderFilters = [
        { key: 'All', label: 'All', count: orders.length },
        { key: 'to_pack', label: 'To pack', count: toPackOrders.length },
        { key: 'processing', label: 'Packed', count: orders.filter(o => o.status === 'processing').length },
        { key: 'out_for_delivery', label: 'Shipped', count: orders.filter(o => o.status === 'out_for_delivery').length },
        { key: 'delivered', label: 'Delivered', count: orders.filter(o => o.status === 'delivered').length },
        { key: 'cancel_requests', label: 'Cancellations', count: cancelRequests.length },
        { key: 'cancelled', label: 'Cancelled', count: orders.filter(o => o.status === 'cancelled').length },
    ];

    const goTo = (v) => { setView(v); setSearchTerm(''); };

    if (!isAuthenticated) {
        return <AdminLogin onLogin={() => setIsAuthenticated(true)} />;
    }

    const viewTitles = { overview: 'Overview', orders: 'Orders', inventory: 'Inventory', sheet: 'Customer Sheet' };

    // ---- shared render helpers ----
    const statusPill = (status) => {
        const meta = STATUS_META[status] || { label: status.toUpperCase(), cls: 'confirmed' };
        return <span className={`adm-pill p-${meta.cls}`}>{meta.label}</span>;
    };

    const renderOrderExpanded = (order) => (
        <div className="adm-order-detail">
            {order.cancellation_requested && order.status !== 'cancelled' && (
                <div className="adm-panel adm-panel-crit">
                    <div className="adm-panel-head">{I.alert} Customer requested cancellation</div>
                    <div className="adm-btn-row">
                        <button className="adm-btn adm-btn-danger" onClick={() => handleStatusUpdate(order.id, 'cancelled')}>
                            Approve cancellation
                        </button>
                        <button className="adm-btn" onClick={() => handleRejectCancellation(order.id)}>
                            Reject request
                        </button>
                    </div>
                </div>
            )}

            <div className="adm-panel">
                <div className="adm-panel-head">{I.truck} Logistics</div>
                <div className="adm-btn-row">
                    <button
                        className="adm-btn"
                        disabled={pushedOrderIds.has(order.id)}
                        onClick={() => handlePushToSheet(order)}
                    >
                        {I.sheet} {pushedOrderIds.has(order.id) ? 'Pushed to Sheet' : 'Push to Google Sheet'}
                    </button>
                    <button className="adm-btn adm-btn-primary" onClick={() => handleManualShip(order)}>
                        {I.truck} Ship via Delhivery
                    </button>
                </div>
                {order.awb_number && (
                    <div className="adm-btn-row" style={{ marginTop: 10 }}>
                        <span className="adm-awb">AWB {order.awb_number}</span>
                        <button className="adm-btn" onClick={() => handleLabel(order)}>{I.label} Label (PDF)</button>
                        <button className="adm-btn adm-btn-danger-ghost" onClick={() => handleCancelShipment(order)}>{I.x} Cancel shipment</button>
                    </div>
                )}
            </div>

            <div className="adm-panel">
                <div className="adm-panel-head">{I.sync} Set exact status</div>
                <div className="adm-btn-row">
                    {ALL_STATUSES.map(status => (
                        <button
                            key={status}
                            className={`adm-chip ${order.status === status ? 'active' : ''}`}
                            onClick={() => handleStatusUpdate(order.id, status)}
                        >
                            {(STATUS_META[status]?.label || status).toLowerCase()}
                        </button>
                    ))}
                </div>
            </div>

            <div className="adm-detail-cols">
                <div>
                    <p className="adm-detail-label">Items</p>
                    {order.cart_items?.filter(item => item).map((item, idx) => (
                        <div key={idx} className="adm-item-row">
                            <span>{item.productName || 'Unknown'} · {item.varietyName || '-'}</span>
                            <span className="adm-num">{item.quantity || 0} × {item.quantityKg || 0}kg</span>
                        </div>
                    ))}
                </div>
                <div>
                    <p className="adm-detail-label">Delivery</p>
                    {typeof order.customer_details?.address === 'object' && order.customer_details?.address !== null ? (
                        <p className="adm-addr">
                            {order.customer_details.address.addressLine1}, {order.customer_details.address.addressLine2}<br />
                            {order.customer_details.address.city} · {order.customer_details.address.pincode}
                        </p>
                    ) : (
                        <p className="adm-addr">{order.customer_details?.address || 'No address provided'}</p>
                    )}
                    <p className="adm-addr">{order.customer_details?.phone || 'No phone provided'}</p>
                </div>
            </div>
        </div>
    );

    const renderOrderRow = (order, compact = false) => {
        const next = NEXT_STEP[order.status];
        const isOpen = expandedOrderId === order.id;
        return (
            <div key={order.id} className={`adm-order ${isOpen ? 'open' : ''}`}>
                <button
                    className="adm-order-row"
                    onClick={() => {
                        if (compact) { setView('orders'); setExpandedOrderId(order.id); }
                        else setExpandedOrderId(isOpen ? null : order.id);
                    }}
                    aria-expanded={!compact ? isOpen : undefined}
                >
                    <span className="adm-oref">#{order.id.slice(0, 8).toUpperCase()}</span>
                    <span className="adm-cust">
                        <b>{order.customer_details?.name || 'Unknown'}</b>
                        <small>
                            {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            {order.customer_details?.address?.city ? ` · ${order.customer_details.address.city}` : ''}
                        </small>
                    </span>
                    <span className="adm-num adm-total">{inr(order.total_price)}</span>
                    <span className={`adm-pill ${order.payment_method === 'cod' ? 'p-cod' : 'p-paid'}`}>
                        {order.payment_method === 'cod' ? 'COD' : 'PAID'}
                    </span>
                    {order.cancellation_requested && order.status !== 'cancelled'
                        ? <span className="adm-pill p-cancel">CANCEL REQ</span>
                        : statusPill(order.status)}
                    {!compact && (
                        <span className={`adm-caret ${isOpen ? 'open' : ''}`}>{I.chevron}</span>
                    )}
                </button>
                {!compact && next && !isOpen && (
                    <button
                        className="adm-advance"
                        onClick={(e) => { e.stopPropagation(); handleStatusUpdate(order.id, next.to); }}
                    >
                        {next.label} {I.arrow}
                    </button>
                )}
                {!compact && isOpen && renderOrderExpanded(order)}
            </div>
        );
    };

    return (
        <div className="adm">
            {/* ===== Rail ===== */}
            <nav className="adm-rail" aria-label="Admin sections">
                <div className="adm-brand">
                    <LogoMark size={30} />
                    <span className="adm-brand-word">Naliban<small>Back Office</small></span>
                </div>

                <div className="adm-rail-links">
                    <button className={`adm-rail-link ${view === 'overview' ? 'active' : ''}`} onClick={() => goTo('overview')}>
                        {I.overview}<span className="adm-rail-label">Overview</span>
                    </button>
                    <button className={`adm-rail-link ${view === 'orders' ? 'active' : ''}`} onClick={() => goTo('orders')}>
                        {I.orders}<span className="adm-rail-label">Orders</span>
                        {toPackOrders.length > 0 && <span className="adm-badge">{toPackOrders.length}</span>}
                    </button>
                    <button className={`adm-rail-link ${view === 'inventory' ? 'active' : ''}`} onClick={() => goTo('inventory')}>
                        {I.inventory}<span className="adm-rail-label">Inventory</span>
                        {lowStock.length > 0 && <span className="adm-badge crit">{lowStock.length}</span>}
                    </button>
                    <button className={`adm-rail-link ${view === 'sheet' ? 'active' : ''}`} onClick={() => goTo('sheet')}>
                        {I.table}<span className="adm-rail-label">Sheet</span>
                    </button>
                </div>

                <div className="adm-rail-foot">
                    Naliban Khatasu · 2,300m<br />v2.0
                </div>
            </nav>

            {/* ===== Main ===== */}
            <div className="adm-main">
                <div className="adm-topbar">
                    <span className="adm-crumb">{viewTitles[view]}</span>
                    <label className="adm-search">
                        {I.search}
                        <input
                            type="text"
                            placeholder={
                                view === 'inventory' ? 'Search products…'
                                    : view === 'sheet' ? 'Search name, phone, email, AWB…'
                                        : 'Search orders…'
                            }
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </label>
                    <div className="adm-top-right">
                        <button
                            className={`adm-shop-toggle ${settings.shop_open ? 'open' : 'closed'}`}
                            onClick={() => updateShopStatus(!settings.shop_open)}
                            title="Toggle whether customers can place orders"
                        >
                            <span className="adm-shop-dot" />
                            {settings.shop_open ? 'SHOP OPEN' : 'SHOP CLOSED'}
                        </button>
                        <button className="adm-btn" onClick={handleLogout}>{I.logout} Logout</button>
                    </div>
                </div>

                {/* ===== Overview ===== */}
                {view === 'overview' && (
                    <section className="adm-view">
                        <div className="adm-vhead">
                            <h1>{now.toLocaleDateString('en-IN', { weekday: 'long' })} at the orchard</h1>
                            <span>{now.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        </div>

                        <div className="adm-tiles">
                            <div className="adm-tile">
                                <span className="adm-tile-label">{I.rupee} Revenue · today</span>
                                <span className="adm-tile-num">{inr(revenueToday)}</span>
                                <span className="adm-tile-meta">{todays.length} order{todays.length !== 1 ? 's' : ''} today</span>
                                <svg className="adm-spark" width="100%" height="34" viewBox="0 0 160 34" preserveAspectRatio="none" aria-label="Seven day revenue trend">
                                    <path d={`${sparkLine} L156 32 L4 32 Z`} fill="rgba(45,51,25,.09)" stroke="none" />
                                    <path d={sparkLine} fill="none" stroke="#2D3319" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <circle cx={sparkPts[6][0]} cy={sparkPts[6][1]} r="3" fill="#2D3319" />
                                </svg>
                            </div>
                            <div className="adm-tile">
                                <span className="adm-tile-label">{I.orders} Orders · today</span>
                                <span className="adm-tile-num">{todays.length}</span>
                                <span className="adm-tile-meta">{todays.length - codToday} paid online · {codToday} COD</span>
                            </div>
                            <div className="adm-tile warn">
                                <span className="adm-tile-label">{I.clock} Waiting to pack</span>
                                <span className="adm-tile-num">{toPackOrders.length}</span>
                                <span className="adm-tile-meta">
                                    {toPackOrders.length ? `oldest: ${oldestToPackHrs} hour${oldestToPackHrs !== 1 ? 's' : ''} ago` : 'all caught up'}
                                </span>
                            </div>
                            <div className="adm-tile crit">
                                <span className="adm-tile-label">{I.alert} Low stock</span>
                                <span className="adm-tile-num">{lowStock.length}</span>
                                <span className="adm-tile-meta">
                                    {lowStock.length
                                        ? <button className="adm-link" onClick={() => goTo('inventory')}>Restock in Inventory →</button>
                                        : 'everything stocked'}
                                </span>
                            </div>
                        </div>

                        <div className="adm-grid2">
                            <div className="adm-card">
                                <div className="adm-card-head">
                                    <span>Latest orders</span>
                                    <button className="adm-link" onClick={() => goTo('orders')}>All orders →</button>
                                </div>
                                <div className="adm-order-list">
                                    {orders.slice(0, 6).map(o => renderOrderRow(o, true))}
                                    {orders.length === 0 && <p className="adm-empty">No orders yet.</p>}
                                </div>
                            </div>

                            <div className="adm-col">
                                <div className="adm-card">
                                    <div className="adm-card-head"><span>{I.leaf} Now picking</span></div>
                                    <div className="adm-picking">
                                        {(nowPickingDraft || '').split('·').map(s => s.trim()).filter(Boolean).map(chip => (
                                            <span className="adm-pick-chip" key={chip}>{chip}</span>
                                        ))}
                                        {!nowPickingDraft && <span className="adm-empty">Nothing set — the ticker falls back to the season calendar.</span>}
                                    </div>
                                    <div className="adm-picking-edit">
                                        <input
                                            type="text"
                                            value={nowPickingDraft}
                                            placeholder="e.g. Santa Rosa Plums · Peaches · Early Gala"
                                            onChange={(e) => setNowPickingDraft(e.target.value)}
                                        />
                                        <button
                                            className="adm-btn adm-btn-primary"
                                            disabled={savingPicking || (nowPickingDraft === (settings?.now_picking || ''))}
                                            onClick={handleSaveNowPicking}
                                        >
                                            {savingPicking ? 'Saving…' : 'Save'}
                                        </button>
                                    </div>
                                    <p className="adm-note">Shown live in the homepage ticker. Separate fruits with a “·”.</p>
                                </div>

                                <div className="adm-card">
                                    <div className="adm-card-head"><span>Needs your attention</span></div>
                                    {cancelRequests.length > 0 && (
                                        <button className="adm-alert" onClick={() => { setView('orders'); setOrderStatusFilter('cancel_requests'); }}>
                                            <span className="adm-alert-ic crit">{I.x}</span>
                                            <span><b>{cancelRequests.length} cancellation request{cancelRequests.length !== 1 ? 's' : ''}</b> — review and respond.</span>
                                        </button>
                                    )}
                                    {lowStock.slice(0, 3).map((ls, i) => (
                                        <button className="adm-alert" key={i} onClick={() => { setView('inventory'); setSearchTerm(ls.variety.name); }}>
                                            <span className="adm-alert-ic warn">{I.alert}</span>
                                            <span><b>{ls.product?.name} · {ls.variety.name}</b> — {formatWeight(ls.pack.weight)} pack down to {ls.pack.stock}.</span>
                                        </button>
                                    ))}
                                    {!settings.shop_open && (
                                        <div className="adm-alert">
                                            <span className="adm-alert-ic crit">{I.alert}</span>
                                            <span><b>The shop is CLOSED</b> — customers cannot place orders right now.</span>
                                        </div>
                                    )}
                                    {cancelRequests.length === 0 && lowStock.length === 0 && settings.shop_open && (
                                        <p className="adm-empty" style={{ padding: '16px 20px' }}>All clear. Nothing needs you right now.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* ===== Orders ===== */}
                {view === 'orders' && (
                    <section className="adm-view">
                        <div className="adm-vhead">
                            <h1>Orders</h1>
                            <div className="adm-vhead-actions">
                                <button className="adm-btn" onClick={handleSchedulePickup}>{I.truck} Schedule pickup</button>
                                <button className="adm-btn adm-btn-danger-ghost" onClick={handleClearAllOrders}>{I.trash} Clear all</button>
                            </div>
                        </div>

                        <div className="adm-filters">
                            {orderFilters.map(f => (
                                <button
                                    key={f.key}
                                    className={`adm-chip ${orderStatusFilter === f.key ? 'active' : ''}`}
                                    onClick={() => setOrderStatusFilter(f.key)}
                                >
                                    {f.label} <span className="adm-chip-n">{f.count}</span>
                                </button>
                            ))}
                        </div>

                        <div className="adm-card">
                            <div className="adm-order-list">
                                {filteredOrders.map(o => renderOrderRow(o))}
                                {filteredOrders.length === 0 && (
                                    <p className="adm-empty" style={{ padding: '22px' }}>
                                        No orders match{searchTerm ? ` “${searchTerm}”` : ' this filter'}.
                                    </p>
                                )}
                            </div>
                        </div>
                    </section>
                )}

                {/* ===== Inventory ===== */}
                {view === 'inventory' && (
                    <section className="adm-view">
                        <div className="adm-vhead">
                            <h1>Inventory</h1>
                            <div className="adm-vhead-actions">
                                <span className="adm-threshold" title='A variety shows "Selling Fast" in the shop when its total stock is at or below this'>
                                    Selling Fast at ≤
                                    <input
                                        type="number" min="1"
                                        value={thresholdDraft}
                                        onChange={(e) => setThresholdDraft(e.target.value)}
                                    />
                                    units
                                    {Number(thresholdDraft) !== sellingFastThreshold && (
                                        <button className="adm-btn adm-btn-primary" onClick={() => updateSellingFastThreshold(thresholdDraft)}>
                                            Save
                                        </button>
                                    )}
                                </span>
                                <button className="adm-btn" onClick={handleSyncPrices}>{I.sync} Sync prices from defaults</button>
                            </div>
                        </div>

                        {productGroups.map(group => {
                            const groupActive = group.vars.some(v => {
                                const inv = inventory.find(i => i.variety_id === v.id);
                                return inv ? inv.is_active !== false : true;
                            });
                            return (
                            <div className="adm-card" key={group.product.id}>
                                <div className="adm-card-head">
                                    <span>{group.product.name} · {group.vars.length} variet{group.vars.length !== 1 ? 'ies' : 'y'}</span>
                                    <span className={`adm-season ${groupActive ? 'on' : ''}`}>
                                        {groupActive ? 'In season' : 'Out of season'}
                                        <button
                                            className={`adm-switch ${groupActive ? '' : 'off'}`}
                                            title={groupActive
                                                ? `End the season — hide all ${group.product.name} from the shop`
                                                : `Start the season — show all ${group.product.name} in the shop`}
                                            aria-pressed={groupActive}
                                            onClick={() => handleToggleProductSeason(group)}
                                        />
                                    </span>
                                </div>
                                {group.vars.map(variety => {
                                    const invItem = inventory.find(i => i.variety_id === variety.id) || {
                                        is_active: true, is_bestseller: false,
                                        price_per_kg: variety.price_per_kg, pack_sizes: []
                                    };
                                    const edited = editedItems[variety.id] || {};
                                    const hasChanges = edited.hasChanges;
                                    const currentPackSizes = (edited.pack_sizes && edited.pack_sizes[0]?.weight !== undefined
                                        ? edited.pack_sizes
                                        : invItem.pack_sizes || []).filter(p => p);
                                    const currentPrice = edited.price_per_kg !== undefined ? parseFloat(edited.price_per_kg) || 0 : (invItem.price_per_kg || variety.price_per_kg);
                                    const currentActive = edited.is_active !== undefined ? edited.is_active : (invItem.is_active ?? true);
                                    const currentBestseller = edited.is_bestseller !== undefined ? edited.is_bestseller : (invItem.is_bestseller || false);
                                    const enabledWeights = currentPackSizes.map(p => p.weight);
                                    const isExpanded = expandedVarietyId === variety.id;

                                    const handleToggleWeight = (weight) => {
                                        const exists = currentPackSizes.findIndex(p => p.weight === weight);
                                        let newArr;
                                        if (exists >= 0) newArr = currentPackSizes.filter((_, i) => i !== exists);
                                        else {
                                            newArr = [...currentPackSizes, { weight, stock: 0, price: currentPrice * weight }];
                                            newArr.sort((a, b) => a.weight - b.weight);
                                        }
                                        setEditedItems(prev => ({
                                            ...prev,
                                            [variety.id]: { ...prev[variety.id], pack_sizes: newArr, hasChanges: true }
                                        }));
                                    };

                                    const setStock = (index, stock) => {
                                        const newArr = currentPackSizes.map((p, i) => i === index ? { ...p, stock } : p);
                                        setEditedItems(prev => ({
                                            ...prev,
                                            [variety.id]: { ...prev[variety.id], pack_sizes: newArr, hasChanges: true }
                                        }));
                                    };

                                    return (
                                        <div className={`adm-inv-row ${!currentActive ? 'inactive' : ''}`} key={variety.id}>
                                            <div className="adm-inv-main">
                                                <button
                                                    className={`adm-star ${currentBestseller ? 'on' : ''}`}
                                                    title={currentBestseller ? 'Bestseller — click to remove' : 'Mark as bestseller'}
                                                    onClick={() => handleFieldChange(variety.id, 'is_bestseller', !currentBestseller)}
                                                >
                                                    {I.star}
                                                </button>
                                                <div className="adm-inv-name">
                                                    <b>{variety.name}</b>
                                                    <small>{group.product.name}{!currentActive ? ' · hidden from shop' : ''}</small>
                                                </div>
                                                <label className="adm-price">
                                                    ₹<input
                                                        type="number" min="0"
                                                        value={currentPrice}
                                                        onChange={(e) => handleFieldChange(variety.id, 'price_per_kg', e.target.value)}
                                                    /><small>/kg</small>
                                                </label>
                                                <div className="adm-packs">
                                                    {currentPackSizes.map((pack, index) => (
                                                        <label className={`adm-pack ${Number(pack.stock) <= 5 ? 'low' : ''}`} key={`p-${pack.weight}`}>
                                                            {formatWeight(pack.weight)}
                                                            <input
                                                                type="number" min="0"
                                                                value={pack.stock}
                                                                onChange={(e) => setStock(index, parseInt(e.target.value) || 0)}
                                                            />
                                                        </label>
                                                    ))}
                                                    {currentPackSizes.length === 0 && <span className="adm-empty">no pack sizes — open ⌄</span>}
                                                </div>
                                                <button
                                                    className={`adm-switch ${currentActive ? '' : 'off'}`}
                                                    title={currentActive ? 'Visible in shop — click to hide' : 'Hidden — click to show in shop'}
                                                    onClick={() => handleFieldChange(variety.id, 'is_active', !currentActive)}
                                                    aria-pressed={currentActive}
                                                />
                                                <button
                                                    className={`adm-caret-btn ${isExpanded ? 'open' : ''}`}
                                                    onClick={() => setExpandedVarietyId(isExpanded ? null : variety.id)}
                                                    aria-label="More options"
                                                    aria-expanded={isExpanded}
                                                >
                                                    {I.chevron}
                                                </button>
                                            </div>

                                            {hasChanges && (
                                                <div className="adm-inv-save">
                                                    <span>Unsaved changes</span>
                                                    <button className="adm-btn adm-btn-primary" onClick={() => handleSave(variety.id)}>Save</button>
                                                    <button className="adm-btn" onClick={() => handleDiscard(variety.id)}>Discard</button>
                                                </div>
                                            )}

                                            {isExpanded && (
                                                <div className="adm-inv-more">
                                                    <div>
                                                        <p className="adm-detail-label">Pack sizes on sale</p>
                                                        <div className="adm-btn-row">
                                                            {AVAILABLE_WEIGHTS.map(w => (
                                                                <label className={`adm-chip ${enabledWeights.includes(w) ? 'active' : ''}`} key={w}>
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={enabledWeights.includes(w)}
                                                                        onChange={() => handleToggleWeight(w)}
                                                                        style={{ display: 'none' }}
                                                                    />
                                                                    {formatWeight(w)}
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    {currentPackSizes.length > 0 && (
                                                        <div>
                                                            <p className="adm-detail-label">Box prices at ₹{currentPrice}/kg</p>
                                                            <div className="adm-btn-row">
                                                                {currentPackSizes.map(pack => (
                                                                    <span className="adm-pill p-cod" key={`pr-${pack.weight}`}>
                                                                        {formatWeight(pack.weight)} = {inr(currentPrice * pack.weight)}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                    <button
                                                        className="adm-btn adm-btn-danger-ghost"
                                                        onClick={() => {
                                                            if (window.confirm(`Delete inventory for "${group.product.name} - ${variety.name}"?`)) {
                                                                updateInventory(variety.id, false, false, 0, []);
                                                            }
                                                        }}
                                                    >
                                                        {I.trash} Delete inventory entry
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            );
                        })}
                        {productGroups.length === 0 && (
                            <p className="adm-empty" style={{ padding: '22px' }}>No products match “{searchTerm}”.</p>
                        )}
                    </section>
                )}

                {/* ===== Customer Sheet ===== */}
                {view === 'sheet' && (
                    <section className="adm-view">
                        <div className="adm-vhead">
                            <h1>Customer Sheet</h1>
                            <span>{sheetOrders.length} of {orders.length} orders</span>
                            <div className="adm-vhead-actions">
                                <button className="adm-btn adm-btn-primary" onClick={exportSheetCsv}>
                                    {I.sheet} Export CSV for Excel
                                </button>
                            </div>
                        </div>

                        <div className="adm-card">
                            <div className="adm-tbl-wrap">
                                <table className="adm-table">
                                    <thead>
                                        <tr>
                                            <th>Order</th><th>Date</th><th>Name</th><th>Phone</th>
                                            <th>Email</th><th>City</th><th>Total</th><th>Status</th><th>AWB</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sheetOrders.map(o => {
                                            const d = o.customer_details || {};
                                            const addr = typeof d.address === 'object' && d.address !== null ? d.address : {};
                                            return (
                                                <tr key={o.id}>
                                                    <td className="adm-oref">#{o.id.slice(0, 8).toUpperCase()}</td>
                                                    <td>{new Date(o.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}</td>
                                                    <td className="adm-td-strong">{d.name || '—'}</td>
                                                    <td className="adm-num">{d.phone || '—'}</td>
                                                    <td>{d.email || '—'}</td>
                                                    <td>{addr.city || '—'}</td>
                                                    <td className="adm-num adm-td-strong">{inr(o.total_price)}</td>
                                                    <td>{statusPill(o.status)}</td>
                                                    <td>
                                                        {o.awb_number ? (
                                                            <span className="adm-awb-cell">
                                                                <span className="adm-num">{o.awb_number}</span>
                                                                <button
                                                                    className="adm-mini-btn"
                                                                    title={copiedAwb === o.awb_number ? 'Copied!' : 'Copy AWB'}
                                                                    onClick={() => copyAwb(o.awb_number)}
                                                                >
                                                                    {copiedAwb === o.awb_number ? I.check : I.copy}
                                                                </button>
                                                                <a
                                                                    className="adm-mini-btn"
                                                                    title="Track on Delhivery"
                                                                    href={`https://www.delhivery.com/track/package/${encodeURIComponent(o.awb_number)}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                >
                                                                    {I.external}
                                                                </a>
                                                            </span>
                                                        ) : (
                                                            <span style={{ color: 'var(--ink-faint, #83866F)' }}>—</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {sheetOrders.length === 0 && (
                                            <tr>
                                                <td colSpan={9}>
                                                    <p className="adm-empty" style={{ padding: '14px 0' }}>
                                                        No orders match{searchTerm ? ` “${searchTerm}”` : ''}.
                                                    </p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};

export default Admin;
