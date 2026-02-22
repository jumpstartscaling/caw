// src/components/calculators/BreakEvenCalculator.tsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function BreakEvenCalculator() {
    const [margin, setMargin] = useState<string>('');
    const [roas, setRoas] = useState<number | null>(null);

    useEffect(() => {
        if (margin && Number(margin) > 0 && Number(margin) <= 100) {
            const calculated = 100 / Number(margin);
            setRoas(calculated);
        } else {
            setRoas(null);
        }
    }, [margin]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="w-full"
        >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 gradient-text">
                Break-Even ROAS Calculator
            </h2>

            <div className="bg-white/10 rounded-2xl p-6 mb-8">
                <h3 className="text-xl font-bold mb-4">2025-2026 Benchmarks</h3>
                <ul className="space-y-2 text-secondary">
                    <li>• Average eCommerce/SaaS ad ROAS: 2.8–4:1</li>
                    <li>• Break-even typical: 2–3x (depends on 30–50% margins)</li>
                    <li>• Profitable scaling: &gt; 4–6x</li>
                </ul>
            </div>

            <p className="text-lg mb-8 text-secondary">
                Break-even ROAS is the minimum return on ad spend needed to cover costs (no profit/loss). Aim to exceed this by 2-3x for healthy growth.
            </p>

            <div className="max-w-md mx-auto mb-10">
                <label className="block text-sm font-medium mb-2">
                    Gross Profit Margin (%)
                </label>
                <input
                    type="number"
                    value={margin}
                    onChange={(e) => setMargin(e.target.value)}
                    placeholder="e.g., 40"
                    min="1"
                    max="100"
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur border border-white/20 rounded-xl focus:border-accent focus:outline-none transition"
                />
                <p className="text-sm text-secondary mt-2">
                    (Revenue − Cost of Goods Sold) ÷ Revenue × 100
                </p>
            </div>

            {roas !== null && (
                <motion.div
                    role="status"
                    aria-live="polite"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="text-center"
                >
                    <div className="text-5xl md:text-6xl font-bold gradient-text mb-4">
                        {roas.toFixed(2)}x
                    </div>
                    <p className="text-xl">
                        You need at least <span className="font-bold">{roas.toFixed(2)}x ROAS</span> to break even
                    </p>
                    <p className="mt-4 text-secondary">
                        Target {(roas * 2.5).toFixed(2)}x+ for profitable scaling
                    </p>
                </motion.div>
            )}
        </motion.div>
    );
}
