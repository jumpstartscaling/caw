import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const data = [
    { month: 'Start', revenue: 50000, spend: 50000 },
    { month: 'M1', revenue: 65000, spend: 52000 },
    { month: 'M2', revenue: 85000, spend: 55000 },
    { month: 'M3', revenue: 120000, spend: 60000 },
    { month: 'M4', revenue: 180000, spend: 75000 },
    { month: 'M5', revenue: 250000, spend: 90000 },
    { month: 'M6', revenue: 420000, spend: 110000 },
];

const ConversionWaterfall = () => {
    return (
        <div className="w-full bg-white/5 border border-white/10 rounded-xl p-6 lg:p-8 backdrop-blur-sm">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h3 className="text-xl font-bold text-white mb-2">The "Scale Gap"</h3>
                    <p className="text-sm text-gray-400 max-w-md">
                        While ad spend (Linear) increases steadily, revenue (Exponential) explodes once
                        <span className="text-gold font-bold"> Attribution & Optimization</span> kicks in.
                    </p>
                </div>
                <div className="text-right hidden md:block">
                    <div className="text-3xl font-mono font-bold text-accent">+740%</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">6-Month Revenue Lift</div>
                </div>
            </div>

            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                        <XAxis dataKey="month" stroke="#666" tickLine={false} axisLine={false} />
                        <YAxis stroke="#666" tickLine={false} axisLine={false} tickFormatter={(value) => `$${value / 1000}k`} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '8px', color: '#fff' }}
                            itemStyle={{ color: '#fff' }}
                            labelStyle={{ color: '#888' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="#fbbf24"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorRevenue)"
                            name="Revenue"
                        />
                        <Area
                            type="monotone"
                            dataKey="spend"
                            stroke="#94a3b8"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            fillOpacity={1}
                            fill="url(#colorSpend)"
                            name="Ad Spend"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-4 flex justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gold"></div>
                    <span className="text-gray-300">Revenue (Managed)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-slate-400"></div>
                    <span className="text-gray-300">Ad Spend</span>
                </div>
            </div>
        </div>
    );
};

export default ConversionWaterfall;
