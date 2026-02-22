// src/components/calculators/CACCalculator.tsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function CACCalculator() {
    const [spend, setSpend] = useState<string>('');
    const [customers, setCustomers] = useState<string>('');
    const [cac, setCac] = useState<number | null>(null);

    useEffect(() => {
        if (spend && customers && Number(customers) > 0) {
            const calculated = Number(spend) / Number(customers);
            setCac(calculated);
        } else {
            setCac(null);
        }
    }, [spend, customers]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="w-full"
        >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 gradient-text">
                Customer Acquisition Cost (CAC) Calculator
            </h2>

            <div className="bg-white/10 rounded-2xl p-6 mb-8">
                <h3 className="text-xl font-bold mb-4">2025-2026 SaaS Benchmarks</h3>
                <ul className="space-y-2 text-muted">
                    <li>• Average B2B SaaS CAC: $500–$1,000+ (higher for enterprise)</li>
                    <li>• SMB SaaS: Aim &lt; $500</li>
                    <li>• Top performers: &lt; $300</li>
                    <li>• Rule: CAC should be &lt; 1/3 of LTV (healthy 3:1 LTV:CAC ratio)</li>
                </ul>
            </div>

            <p className="text-lg mb-8 text-muted">
                CAC measures the total cost of acquiring a new customer. Lower is better — aim for under $200-500 depending on your industry and LTV.
            </p>

            <div className="grid md:grid-cols-2 gap-8 mb-10">
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Total Sales & Marketing Spend ($)
                    </label>
                    <input
                        type="number"
                        value={spend}
                        onChange={(e) => setSpend(e.target.value)}
                        placeholder="e.g., 50000"
                        className="w-full px-4 py-3 bg-white text-black rounded-xl border border-gray-300 focus:border-accent focus:outline-none transition"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">
                        New Customers Acquired
                    </label>
                    <input
                        type="number"
                        value={customers}
                        onChange={(e) => setCustomers(e.target.value)}
                        placeholder="e.g., 250"
                        className="w-full px-4 py-3 bg-white text-black rounded-xl border border-gray-300 focus:border-accent focus:outline-none transition"
                    />
                </div>
            </div>

            {cac !== null && (
                <motion.div
                    role="status"
                    aria-live="polite"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="text-center"
                >
                    <div className="text-5xl md:text-6xl font-bold gradient-text mb-4">
                        ${cac.toFixed(2)}
                    </div>
                    <p className="text-xl">
                        Your CAC is{' '}
                        <span className="font-bold">
                            {cac < 300 ? 'Elite 🔥 (Top 10%)' : cac < 500 ? 'Excellent ✅ (Better than 70% of SaaS)' : cac < 1000 ? 'Average ⚠️' : 'Needs Improvement 🔴'}
                        </span>
                    </p>
                    <p className="mt-4 text-muted">
                        Benchmark: Aim for CAC &lt; 1/3 of Customer Lifetime Value (LTV)
                    </p>
                    <p className="mt-4 text-muted">Source: SaaS Capital, FirstPageSage 2025 data</p>
                </motion.div>
            )}
        </motion.div>
    );
}
