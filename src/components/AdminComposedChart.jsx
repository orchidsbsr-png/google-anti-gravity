import React, { useMemo } from 'react';
import {
    ComposedChart, Bar, Line, Area, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import './AdminComposedChart.css';

/**
 * Composed revenue/orders chart for the admin Overview — bars are orders
 * per day, the line + soft area is revenue, on a shared time axis
 * (the Recharts ComposedChart pattern, styled to the admin palette).
 */

const inrCompact = (v) => {
    if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
    if (v >= 1000) return `₹${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}k`;
    return `₹${v}`;
};

const inrFull = (v) => `₹${Number(v || 0).toLocaleString('en-IN')}`;

const isSameDay = (a, b) => {
    const da = new Date(a), db = new Date(b);
    return da.getFullYear() === db.getFullYear()
        && da.getMonth() === db.getMonth()
        && da.getDate() === db.getDate();
};

const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const row = payload[0]?.payload;
    if (!row) return null;
    return (
        <div className="adm-chart-tip">
            <span className="adm-chart-tip-day">{row.fullLabel}</span>
            <span className="adm-chart-tip-row">
                <span className="adm-chart-tip-dot revenue" /> Revenue
                <b>{inrFull(row.revenue)}</b>
            </span>
            <span className="adm-chart-tip-row">
                <span className="adm-chart-tip-dot orders" /> Orders
                <b>{row.orders}</b>
            </span>
        </div>
    );
};

const AdminComposedChart = ({ orders, days = 14 }) => {
    const data = useMemo(() => (
        [...Array(days)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (days - 1 - i));
            const dayOrders = orders.filter(o => isSameDay(o.created_at, d));
            return {
                label: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
                fullLabel: d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }),
                revenue: dayOrders.reduce((s, o) => s + (o.total_price || 0), 0),
                orders: dayOrders.length,
            };
        })
    ), [orders, days]);

    const hasAny = data.some(d => d.orders > 0);

    return (
        <div className="adm-chart-wrap">
            {!hasAny && <p className="adm-chart-empty">No orders in the last {days} days yet — the chart fills in as they come.</p>}
            <ResponsiveContainer width="100%" height={260}>
                <ComposedChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: 4 }}>
                    <defs>
                        <linearGradient id="admRevenueFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#2D3319" stopOpacity={0.16} />
                            <stop offset="100%" stopColor="#2D3319" stopOpacity={0.02} />
                        </linearGradient>
                    </defs>

                    <CartesianGrid strokeDasharray="3 6" stroke="rgba(45, 51, 25, 0.12)" vertical={false} />

                    <XAxis
                        dataKey="label"
                        tickLine={false}
                        axisLine={false}
                        interval="preserveStartEnd"
                        tick={{ fill: '#83866F', fontSize: 11, fontFamily: 'Inter, sans-serif' }}
                        tickMargin={8}
                    />
                    <YAxis
                        yAxisId="revenue"
                        tickLine={false}
                        axisLine={false}
                        width={44}
                        tickFormatter={inrCompact}
                        tick={{ fill: '#83866F', fontSize: 11, fontFamily: 'Inter, sans-serif' }}
                    />
                    <YAxis
                        yAxisId="orders"
                        orientation="right"
                        tickLine={false}
                        axisLine={false}
                        width={28}
                        allowDecimals={false}
                        tick={{ fill: '#B08C1D', fontSize: 11, fontFamily: 'Inter, sans-serif' }}
                    />

                    <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(45, 51, 25, 0.05)' }} />

                    <Bar
                        yAxisId="orders"
                        dataKey="orders"
                        fill="#D4A017"
                        fillOpacity={0.75}
                        radius={[5, 5, 0, 0]}
                        maxBarSize={22}
                    />
                    <Area
                        yAxisId="revenue"
                        type="monotone"
                        dataKey="revenue"
                        stroke="none"
                        fill="url(#admRevenueFill)"
                        activeDot={false}
                    />
                    <Line
                        yAxisId="revenue"
                        type="monotone"
                        dataKey="revenue"
                        stroke="#2D3319"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4, fill: '#2D3319', strokeWidth: 0 }}
                    />
                </ComposedChart>
            </ResponsiveContainer>

            <div className="adm-chart-legend">
                <span><span className="adm-chart-tip-dot revenue" /> Revenue (₹)</span>
                <span><span className="adm-chart-tip-dot orders" /> Orders</span>
            </div>
        </div>
    );
};

export default AdminComposedChart;
