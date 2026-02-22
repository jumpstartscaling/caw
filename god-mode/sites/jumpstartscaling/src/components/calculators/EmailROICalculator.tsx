// src/components/calculators/EmailROICalculator.tsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function EmailROICalculator() {
    const [revenue, setRevenue] = useState<string>('');
    const [cost, setCost] = useState<string>('');
    const [roi, setRoi] = useState<number | null>(null);

    useEffect(() => {
        if (revenue && cost && Number(cost) > 0) {
            const calculated = ((Number(revenue) - Number(cost)) / Number(cost)) * 100;
            setRoi(calculated);
        } else {
            setRoi(null);
        }
    }, [revenue, cost]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="w-full"
        >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 gradient-text">
                Email Marketing ROI Calculator
            </h2>

            <div className="bg-white/10 rounded-2xl p-6 mb-8">
                <h3 className="text-xl font-bold mb-4">2025-2026 Benchmarks</h3>
                <ul className="space-y-2 text-muted">
                    <li>• Average email ROI: $36–$42 per $1 spent</li>
                    <li>• Top performers: 3000%+ (30:1)</li>
                    <li>• Healthy campaigns: &gt; 1000% (10:1)</li>
                </ul>
            </div>

            <p className="text-lg mb-8 text-muted">
                ROI shows profit relative to cost. Healthy email campaigns often achieve 3000%+ ROI.
            </p>

            <div className="grid md:grid-cols-2 gap-8 mb-10">
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Revenue Generated from Campaign ($)
                    </label>
                    <input
                        type="number"
                        value={revenue}
                        onChange={(e) => setRevenue(e.target.value)}
                        placeholder="e.g., 25000"
                        className="w-full px-4 py-3 bg-white text-black rounded-xl border border-gray-300 focus:border-accent focus:outline-none transition"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Total Campaign Cost ($)
                    </label>
                    <input
                        type="number"
                        value={cost}
                        onChange={(e) => setCost(e.target.value)}
                        placeholder="e.g., 5000"
                        className="w-full px-4 py-3 bg-white text-black rounded-xl border border-gray-300 focus:border-accent focus:outline-none transition"
                    />
                </div>
            </div>

            {roi !== null && (
                <motion.div
                    role="status"
                    aria-live="polite"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="text-center"
                >
                    <div className="text-5xl md:text-6xl font-bold gradient-text mb-4">
                        {roi.toFixed(0)}%
                    </div>
                    <p className="text-xl">
                        Your ROI is{' '}
                        <span className="font-bold">
                            {roi > 3000 ? 'World-Class 🚀' : roi > 1000 ? 'Excellent ✅' : roi > 300 ? 'Good ⚠️' : 'Needs Work 🔴'}
                        </span>
                    </p>
                    <p className="mt-4 text-muted">
                        For every $1 spent, you earned ${((roi / 100) + 1).toFixed(2)}
                    </p>
                    <p className="mt-4 text-muted">Source: Litmus, Apsis 2025 reports</p>
                </motion.div>
            )}
        </motion.div>
    );
}
