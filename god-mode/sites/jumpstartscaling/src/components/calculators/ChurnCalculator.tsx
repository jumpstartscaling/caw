// src/components/calculators/ChurnCalculator.tsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function ChurnCalculator() {
    const [startCustomers, setStartCustomers] = useState<string>('');
    const [lostCustomers, setLostCustomers] = useState<string>('');
    const [churn, setChurn] = useState<number | null>(null);

    useEffect(() => {
        if (startCustomers && lostCustomers && Number(startCustomers) > 0) {
            const calculated = (Number(lostCustomers) / Number(startCustomers)) * 100;
            setChurn(calculated);
        } else {
            setChurn(null);
        }
    }, [startCustomers, lostCustomers]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="w-full"
        >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 gradient-text">
                Monthly Churn Rate Calculator
            </h2>

            <div className="bg-white/10 rounded-2xl p-6 mb-8">
                <h3 className="text-xl font-bold mb-4">2025-2026 SaaS Benchmarks</h3>
                <ul className="space-y-2 text-secondary">
                    <li>• Average B2B SaaS monthly churn: 3–5%</li>
                    <li>• Excellent: &lt; 3% (top quartile)</li>
                    <li>• Enterprise-focused: &lt; 1%</li>
                    <li>• SMB SaaS: 3–7% typical</li>
                </ul>
            </div>

            <p className="text-lg mb-8 text-secondary">
                Churn rate is the percentage of customers you lose in a period. Healthy SaaS businesses target &lt;5% monthly (or &lt;1% for enterprise).
            </p>

            <div className="grid md:grid-cols-2 gap-8 mb-10">
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Customers at Start of Month
                    </label>
                    <input
                        type="number"
                        value={startCustomers}
                        onChange={(e) => setStartCustomers(e.target.value)}
                        placeholder="e.g., 1000"
                        className="w-full px-4 py-3 bg-white/10 backdrop-blur border border-white/20 rounded-xl focus:border-accent focus:outline-none transition"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Customers Lost During Month
                    </label>
                    <input
                        type="number"
                        value={lostCustomers}
                        onChange={(e) => setLostCustomers(e.target.value)}
                        placeholder="e.g., 40"
                        className="w-full px-4 py-3 bg-white/10 backdrop-blur border border-white/20 rounded-xl focus:border-accent focus:outline-none transition"
                    />
                </div>
            </div>

            {churn !== null && (
                <motion.div
                    role="status"
                    aria-live="polite"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="text-center"
                >
                    <div className="text-5xl md:text-6xl font-bold gradient-text mb-4">
                        {churn.toFixed(2)}%
                    </div>
                    <p className="text-xl">
                        Your monthly churn is{' '}
                        <span className="font-bold">
                            {churn < 3 ? 'Elite 🔥 (Top 25%)' : churn < 5 ? 'Strong ✅' : churn < 7 ? 'Average ⚠️' : 'High Risk 🔴'}
                        </span>
                    </p>
                    <p className="mt-4 text-secondary">
                        Annualized: ~{(churn * 12).toFixed(1)}%
                    </p>
                    <p className="mt-4 text-secondary">Source: Recurly 2025 Churn Report, Vena Solutions</p>
                </motion.div>
            )}
        </motion.div>
    );
}
