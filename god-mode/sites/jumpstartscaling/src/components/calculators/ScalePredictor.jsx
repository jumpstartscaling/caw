import React, { useState, useEffect } from 'react';

const ScalePredictor = () => {
    const [adSpend, setAdSpend] = useState(50000);
    const [currentROAS, setCurrentROAS] = useState(2.1);
    const [potentialROAS, setPotentialROAS] = useState(3.8);

    const currentRevenue = Math.round(adSpend * currentROAS);
    const potentialRevenue = Math.round(adSpend * potentialROAS);
    const profitLift = potentialRevenue - currentRevenue;
    const annualLift = profitLift * 12;

    // Format currency
    const fmt = (num) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num);

    return (
        <div className="w-full bg-gradient-to-br from-[#111] to-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-white/5">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <span>🚀</span> The "Market Domination" Impact
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                    See the mathematical impact of moving from "Maintenance Mode" (2.1x) to "Elite Scaling" (3.8x+).
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                {/* INPUTS */}
                <div className="p-8 space-y-8 border-r border-white/5 bg-white/[0.02]">

                    <div>
                        <div className="flex justify-between mb-4">
                            <label className="text-sm font-mono text-gray-400 uppercase">Monthly Ad Spend</label>
                            <span className="text-white font-bold font-mono">{fmt(adSpend)}</span>
                        </div>
                        <input
                            type="range"
                            min="10000"
                            max="200000"
                            step="5000"
                            value={adSpend}
                            onChange={(e) => setAdSpend(Number(e.target.value))}
                            className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-gold"
                        />
                    </div>

                    <div>
                        <div className="flex justify-between mb-4">
                            <label className="text-sm font-mono text-gray-400 uppercase">Current ROAS (Avg)</label>
                            <span className="text-white font-mono">{currentROAS}x</span>
                        </div>
                        <input
                            type="range"
                            min="1.0"
                            max="5.0"
                            step="0.1"
                            value={currentROAS}
                            onChange={(e) => setCurrentROAS(Number(e.target.value))}
                            className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-gray-500"
                        />
                    </div>

                    <div>
                        <div className="flex justify-between mb-4">
                            <label className="text-sm font-mono text-gold uppercase">Elite Tier ROAS (Target)</label>
                            <span className="text-gold font-bold font-mono">{potentialROAS}x</span>
                        </div>
                        <input
                            type="range"
                            min="2.0"
                            max="10.0"
                            step="0.1"
                            value={potentialROAS}
                            onChange={(e) => setPotentialROAS(Number(e.target.value))}
                            className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-gold"
                        />
                        <p className="text-xs text-gray-500 mt-2 italic">
                            *JumpStart clients typically see a 40-120% ROAS lift within 90 days.
                        </p>
                    </div>

                </div>

                {/* OUTPUTS */}
                <div className="p-8 flex flex-col justify-center space-y-6 bg-[#050505]">

                    <div className="flex justify-between items-end pb-4 border-b border-white/5 opacity-50">
                        <span className="text-sm text-gray-500">Current Revenue</span>
                        <span className="text-xl font-mono text-gray-300">{fmt(currentRevenue)}</span>
                    </div>

                    <div className="flex justify-between items-end pb-4 border-b border-white/10">
                        <span className="text-sm text-gold">Projected Revenue</span>
                        <span className="text-3xl font-mono font-bold text-white">{fmt(potentialRevenue)}</span>
                    </div>

                    <div className="bg-gold/10 border border-gold/20 rounded-lg p-4 mt-4">
                        <span className="block text-xs text-gold uppercase tracking-widest mb-1">Missed Annual Revenue</span>
                        <div className="text-3xl md:text-4xl font-black text-gold">
                            {fmt(annualLift)}
                        </div>
                        <p className="text-xs text-gold/80 mt-2">
                            This is the cost of staying with a "Standard" agency.
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ScalePredictor;
