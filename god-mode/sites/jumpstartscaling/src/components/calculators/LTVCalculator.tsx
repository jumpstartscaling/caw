// src/components/calculators/LTVCalculator.tsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function LTVCalculator() {
    const [arpu, setArpu] = useState<string>('');
    const [churnRate, setChurnRate] = useState<string>('');
    const [ltv, setLtv] = useState<number | null>(null);

    useEffect(() => {
        if (arpu && churnRate && Number(churnRate) > 0 && Number(churnRate) <= 100) {
            const monthlyChurn = Number(churnRate) / 100;
            const calculated = Number(arpu) / monthlyChurn;
            setLtv(calculated);
        } else {
            setLtv(null);
        }
    }, [arpu, churnRate]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="w-full"
        >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 gradient-text">
                Customer Lifetime Value (LTV) Calculator
            </h2>

            <div className="bg-white/10 rounded-2xl p-6 mb-8">
                <h3 className="text-xl font-bold mb-4">2025-2026 Benchmarks</h3>
                <ul className="space-y-2 text-muted">
                    <li>• Target LTV: ≥ 3x CAC (Ideal)</li>
                    <li>• Excellent LTV: &gt; 3.5x CAC</li>
                    <li>• Average B2B SaaS LTV: $2,000 - $15,000+ depending on ARPU</li>
                </ul>
            </div>

            <p className="text-lg mb-8 text-muted">
                LTV estimates the total revenue a customer generates over their entire relationship with your business.
                Strong businesses aim for LTV that is at least 3x higher than CAC.
            </p>

            <div className="grid md:grid-cols-2 gap-8 mb-10">
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Average Monthly Revenue Per Customer (ARPU) ($)
                    </label>
                    <input
                        type="number"
                        value={arpu}
                        onChange={(e) => setArpu(e.target.value)}
                        placeholder="e.g., 150"
                        className="w-full px-4 py-3 bg-white text-black rounded-xl border border-gray-300 focus:border-accent focus:outline-none transition"
                    />
                    <p className="text-sm text-muted mt-2">
                        Total monthly revenue ÷ Active customers
                    </p>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Monthly Churn Rate (%)
                    </label>
                    <input
                        type="number"
                        value={churnRate}
                        onChange={(e) => setChurnRate(e.target.value)}
                        placeholder="e.g., 5"
                        min="0.1"
                        max="100"
                        step="0.1"
                        className="w-full px-4 py-3 bg-white text-black rounded-xl border border-gray-300 focus:border-accent focus:outline-none transition"
                    />
                    <p className="text-sm text-muted mt-2">
                        Use your churn calculator result here
                    </p>
                </div>
            </div>

            {ltv !== null && (
                <motion.div
                    role="status"
                    aria-live="polite"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="text-center"
                >
                    <div className="text-5xl md:text-6xl font-bold gradient-text mb-4">
                        ${ltv.toFixed(0)}
                    </div>
                    <p className="text-xl">
                        Estimated Customer Lifetime Value
                    </p>
                    <p className="text-lg mt-4">
                        <span className="font-bold">
                            {ltv > 5000 ? 'Elite Tier 🚀' : ltv > 2000 ? 'Strong 💪' : ltv > 500 ? 'Healthy ✅' : 'Needs Focus ⚠️'}
                        </span>
                    </p>
                    <p className="mt-4 text-muted">
                        Rule of thumb: Target LTV ≥ 3× CAC for sustainable growth
                    </p>
                </motion.div>
            )}
        </motion.div>
    );
}
