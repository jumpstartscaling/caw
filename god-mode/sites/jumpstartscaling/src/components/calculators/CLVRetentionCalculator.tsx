// src/components/calculators/CLVRetentionCalculator.tsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function CLVRetentionCalculator() {
    const [arpu, setArpu] = useState<string>('');
    const [grossMargin, setGrossMargin] = useState<string>('80'); // Default 80% per benchmarks
    const [retentionRate, setRetentionRate] = useState<string>('');
    const [clv, setClv] = useState<number | null>(null);

    useEffect(() => {
        if (
            arpu &&
            grossMargin &&
            retentionRate &&
            Number(retentionRate) > 0 &&
            Number(retentionRate) < 100
        ) {
            const monthlyRetention = Number(retentionRate) / 100;
            const monthlyChurn = 1 - monthlyRetention;
            const margin = Number(grossMargin) / 100;
            const calculated = (Number(arpu) * margin) / monthlyChurn;
            setClv(calculated);
        } else {
            setClv(null);
        }
    }, [arpu, grossMargin, retentionRate]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="w-full"
        >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 gradient-text">
                Customer Lifetime Value (CLV) with Retention Calculator
            </h2>

            <div className="bg-white/10 rounded-2xl p-6 mb-8">
                <h3 className="text-xl font-bold mb-4">2025-2026 Benchmarks</h3>
                <ul className="space-y-2 text-secondary">
                    <li>• SaaS Gross Margin Median: 77–81%</li>
                    <li>• Excellent Retention: 85-95%+ monthly</li>
                    <li>• Target CLV: 3-5x CAC</li>
                </ul>
            </div>

            <p className="text-lg mb-8 text-secondary">
                Advanced CLV calculation incorporating gross margin and monthly retention rate.
                This shows the true profit-generating potential of retained customers.
                Top SaaS companies achieve 85-95%+ monthly retention.
            </p>

            <div className="grid md:grid-cols-3 gap-8 mb-10">
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Average Monthly Revenue Per Customer (ARPU) ($)
                    </label>
                    <input
                        type="number"
                        value={arpu}
                        onChange={(e) => setArpu(e.target.value)}
                        placeholder="e.g., 150"
                        className="w-full px-4 py-3 bg-white/10 backdrop-blur border border-white/20 rounded-xl focus:border-accent focus:outline-none transition"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Gross Profit Margin (%)
                    </label>
                    <input
                        type="number"
                        value={grossMargin}
                        onChange={(e) => setGrossMargin(e.target.value)}
                        placeholder="e.g., 80"
                        min="0"
                        max="100"
                        className="w-full px-4 py-3 bg-white/10 backdrop-blur border border-white/20 rounded-xl focus:border-accent focus:outline-none transition"
                    />
                    <p className="text-sm text-secondary mt-2">
                        (Revenue − COGS) ÷ Revenue × 100
                    </p>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Monthly Retention Rate (%)
                    </label>
                    <input
                        type="number"
                        value={retentionRate}
                        onChange={(e) => setRetentionRate(e.target.value)}
                        placeholder="e.g., 92"
                        min="1"
                        max="99.9"
                        step="0.1"
                        className="w-full px-4 py-3 bg-white/10 backdrop-blur border border-white/20 rounded-xl focus:border-accent focus:outline-none transition"
                    />
                    <p className="text-sm text-secondary mt-2">
                        % of customers who stay each month (100% − churn %)
                    </p>
                </div>
            </div>

            {clv !== null && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="text-center"
                >
                    <div className="text-5xl md:text-6xl font-bold gradient-text mb-4">
                        ${clv.toFixed(0)}
                    </div>
                    <p className="text-xl mb-4">
                        Profit-Adjusted Customer Lifetime Value
                    </p>
                    <p className="text-lg">
                        <span className="font-bold">
                            {clv > 10000 ? 'World-Class 🌟' : clv > 5000 ? 'Excellent 🚀' : clv > 2000 ? 'Strong 💪' : clv > 800 ? 'Healthy ✅' : 'Needs Retention Focus ⚠️'}
                        </span>
                    </p>
                    <p className="mt-6 text-secondary">
                        Benchmark: Aim for CLV ≥ 3-5× CAC. High retention dramatically multiplies value.
                    </p>
                    <p className="text-sm text-secondary mt-4">
                        Formula: (ARPU × Gross Margin) ÷ (1 − Retention Rate)
                    </p>
                </motion.div>
            )}
        </motion.div>
    );
}
