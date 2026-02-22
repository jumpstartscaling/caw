// src/components/calculators/MRRForecastCalculator.tsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function MRRForecastCalculator() {
    const monthsToForecast = 12;

    const [currentMRR, setCurrentMRR] = useState<string>('50000'); // Starting MRR
    const [monthlyNewMRR, setMonthlyNewMRR] = useState<string>('8000'); // Consistent new MRR per month
    const [churnRate, setChurnRate] = useState<string>('5'); // Monthly churn %
    const [expansionRate, setExpansionRate] = useState<string>('2'); // Monthly expansion/upsell %

    // Forecast data
    const [forecast, setForecast] = useState<Array<{
        month: number;
        starting: number;
        new: number;
        expansion: number;
        churn: number;
        ending: number;
        netChange: number;
    }>>([]);

    useEffect(() => {
        const churn = Number(churnRate) / 100 || 0;
        const expansion = Number(expansionRate) / 100 || 0;
        const newMRR = Number(monthlyNewMRR) || 0;
        let mrr = Number(currentMRR) || 0;

        const data = [];
        let previousMRR = mrr;

        // Month 0 (current)
        data.push({
            month: 0,
            starting: mrr,
            new: 0,
            expansion: 0,
            churn: 0,
            ending: mrr,
            netChange: 0,
        });

        for (let i = 1; i <= monthsToForecast; i++) {
            const churnLoss = previousMRR * churn;
            const expansionGain = previousMRR * expansion;
            const ending = previousMRR + newMRR + expansionGain - churnLoss;
            const netChange = ending - previousMRR;

            data.push({
                month: i,
                starting: previousMRR,
                new: newMRR,
                expansion: Math.round(expansionGain),
                churn: Math.round(churnLoss),
                ending: Math.round(ending),
                netChange: Math.round(netChange),
            });

            previousMRR = ending;
        }

        setForecast(data);
    }, [currentMRR, monthlyNewMRR, churnRate, expansionRate]);

    const totalProjected = forecast[forecast.length - 1]?.ending || 0;
    const totalGrowth = totalProjected - Number(currentMRR);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="w-full overflow-x-auto"
        >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 gradient-text">
                MRR Growth Forecast Calculator
            </h2>

            <div className="bg-white/10 rounded-2xl p-6 mb-8">
                <h3 className="text-xl font-bold mb-4">2025-2026 Benchmarks</h3>
                <ul className="space-y-2 text-secondary">
                    <li>• Average expansion rate: 2–6% monthly for top performers.</li>
                    <li>• Healthy net MRR growth: 2–5% monthly.</li>
                    <li>• SaaS median: 20–30% annual growth</li>
                </ul>
            </div>

            <p className="text-lg mb-8 text-secondary">
                Project your Monthly Recurring Revenue over the next 12 months based on new signups, churn, and expansion.
                Ideal for SaaS businesses planning growth targets and runway.
            </p>

            <div className="grid md:grid-cols-4 gap-6 mb-12">
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Current MRR ($)
                    </label>
                    <input
                        type="number"
                        value={currentMRR}
                        onChange={(e) => setCurrentMRR(e.target.value)}
                        placeholder="e.g., 50000"
                        className="w-full px-4 py-3 bg-white/10 backdrop-blur border border-white/20 rounded-xl focus:border-accent focus:outline-none transition"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Expected Monthly New MRR ($)
                    </label>
                    <input
                        type="number"
                        value={monthlyNewMRR}
                        onChange={(e) => setMonthlyNewMRR(e.target.value)}
                        placeholder="e.g., 8000"
                        className="w-full px-4 py-3 bg-white/10 backdrop-blur border border-white/20 rounded-xl focus:border-accent focus:outline-none transition"
                    />
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
                        min="0"
                        max="100"
                        step="0.1"
                        className="w-full px-4 py-3 bg-white/10 backdrop-blur border border-white/20 rounded-xl focus:border-accent focus:outline-none transition"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Monthly Expansion Rate (%)
                    </label>
                    <input
                        type="number"
                        value={expansionRate}
                        onChange={(e) => setExpansionRate(e.target.value)}
                        placeholder="e.g., 2"
                        min="0"
                        max="100"
                        step="0.1"
                        className="w-full px-4 py-3 bg-white/10 backdrop-blur border border-white/20 rounded-xl focus:border-accent focus:outline-none transition"
                    />
                    <p className="text-sm text-secondary mt-2">
                        Upsells, cross-sells, seat additions
                    </p>
                </div>
            </div>

            {/* Summary Cards */}
            <div role="status" aria-live="polite" className="grid md:grid-cols-3 gap-6 mb-12">
                <div className="text-center p-6 bg-white/5 rounded-2xl border border-white/10">
                    <div className="text-4xl font-bold gradient-text">
                        ${totalProjected.toLocaleString()}
                    </div>
                    <p className="text-secondary">MRR in 12 Months</p>
                </div>
                <div className="text-center p-6 bg-white/5 rounded-2xl border border-white/10">
                    <div className="text-4xl font-bold gradient-text">
                        +${totalGrowth.toLocaleString()}
                    </div>
                    <p className="text-secondary">Total Growth</p>
                </div>
                <div className="text-center p-6 bg-white/5 rounded-2xl border border-white/10">
                    <div className="text-4xl font-bold gradient-text">
                        {totalGrowth > 0 ? '+' : ''}{((totalGrowth / Number(currentMRR)) * 100).toFixed(1)}%
                    </div>
                    <p className="text-secondary">% Growth</p>
                </div>
            </div>

            {/* Forecast Table */}
            <h3 className="text-2xl font-bold mb-6 text-center">12-Month MRR Forecast</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm md:text-base border-collapse">
                    <thead>
                        <tr className="border-b border-white/20">
                            <th className="text-left p-3 font-bold">Month</th>
                            <th className="text-right p-3 font-bold">Starting MRR</th>
                            <th className="text-right p-3 font-bold">+ New</th>
                            <th className="text-right p-3 font-bold">+ Expansion</th>
                            <th className="text-right p-3 font-bold">- Churn</th>
                            <th className="text-right p-3 font-bold">Ending MRR</th>
                            <th className="text-right p-3 font-bold">Net Change</th>
                        </tr>
                    </thead>
                    <tbody>
                        {forecast.map((row) => (
                            <tr key={row.month} className="border-b border-white/10">
                                <td className="p-3 font-medium">
                                    {row.month === 0 ? 'Current' : `Month ${row.month}`}
                                </td>
                                <td className="p-3 text-right font-mono">
                                    ${row.starting.toLocaleString()}
                                </td>
                                <td className="p-3 text-right font-mono text-green-400">
                                    {row.new > 0 ? '+' : ''}${row.new.toLocaleString()}
                                </td>
                                <td className="p-3 text-right font-mono text-green-400">
                                    {row.expansion > 0 ? '+' : ''}${row.expansion.toLocaleString()}
                                </td>
                                <td className="p-3 text-right font-mono text-red-400">
                                    -${row.churn.toLocaleString()}
                                </td>
                                <td className="p-3 text-right font-mono font-bold">
                                    ${row.ending.toLocaleString()}
                                </td>
                                <td className={`p-3 text-right font-mono font-bold ${row.netChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {row.netChange >= 0 ? '+' : ''}${row.netChange.toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <p className="mt-8 text-center text-secondary">
                Formula: Ending MRR = Previous + New + (Previous × Expansion%) - (Previous × Churn%)
                <br />
                Use this to set realistic growth targets, model scenarios, and align marketing/sales efforts.
            </p>
        </motion.div>
    );
}
