// src/components/calculators/CohortAnalysisCalculator.tsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function CohortAnalysisCalculator() {
    const maxMonths = 12;
    const maxCohorts = 12;

    // Retention curve: index 0 = 100% (acquisition), index 1-12 = month 1-12 retention %
    const [retentionCurve, setRetentionCurve] = useState<Array<string>>(
        ['100', '80', '65', '55', '48', '43', '40', '37', '35', '33', '32', '31']
    );

    // Acquisitions per cohort (monthly new users)
    const [acquisitions, setAcquisitions] = useState<Array<string>>(
        Array(maxCohorts).fill('1000')
    );

    // Computed cohort data
    const [cohortData, setCohortData] = useState<Array<Array<number>>>([]);
    const [percentData, setPercentData] = useState<Array<Array<number>>>([]);
    const [totals, setTotals] = useState<Array<number>>([]);

    useEffect(() => {
        const data: Array<Array<number>> = [];
        const percents: Array<Array<number>> = [];
        const monthlyTotals: Array<number> = Array(maxMonths + 1).fill(0);

        acquisitions.forEach((acqStr, cohortIndex) => {
            const acq = Number(acqStr) || 0;
            if (acq === 0) return;

            const row: Array<number> = [];
            const percentRow: Array<number> = [];
            row[0] = acq;
            percentRow[0] = 100;
            monthlyTotals[0] += acq;

            for (let month = 1; month <= maxMonths; month++) {
                const retentionPercent = Number(retentionCurve[month]) || 0;
                const retained = acq * (retentionPercent / 100);
                row[month] = Math.round(retained);
                percentRow[month] = retentionPercent;
                if (cohortIndex + month <= maxMonths) {
                    monthlyTotals[month] += Math.round(retained);
                }
            }

            data.push(row);
            percents.push(percentRow);
        });

        setCohortData(data);
        setPercentData(percents);
        setTotals(monthlyTotals);
    }, [retentionCurve, acquisitions]);

    const updateRetention = (index: number, value: string) => {
        const newCurve = [...retentionCurve];
        newCurve[index] = value;
        setRetentionCurve(newCurve);
    };

    const updateAcquisition = (index: number, value: string) => {
        const newAcqs = [...acquisitions];
        newAcqs[index] = value;
        setAcquisitions(newAcqs);
    };

    const getHeatmapClass = (percent: number) => {
        if (percent >= 80) return 'bg-[#E8C677] text-black';
        if (percent >= 60) return 'bg-[#FFE5A0] text-black';
        if (percent >= 40) return 'bg-[#D4B062] text-black';
        if (percent >= 20) return 'bg-[#D4B062]/50';
        return 'bg-white/10';
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="w-full overflow-x-auto"
        >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 gradient-text">
                Cohort Retention Analysis Calculator
            </h2>

            <div className="bg-white/10 rounded-2xl p-6 mb-8 text-black">
                <h3 className="text-xl font-bold mb-4">2025-2026 Benchmarks</h3>
                <ul className="space-y-2 text-muted text-black">
                    <li>• Average Month 1 retention: 70–80%.</li>
                    <li>• Month 12: 30–40% for good SaaS.</li>
                    <li>• Best-in-class Month 12: &gt;50%</li>
                </ul>
            </div>

            <p className="text-lg mb-8 text-black text-muted">
                Build a full cohort retention table to visualize how well you retain customers over time.
                Assumes the same retention curve applies to all cohorts. Great for forecasting active users and identifying retention trends.
            </p>

            <div className="grid lg:grid-cols-2 gap-12 mb-12">
                {/* Retention Curve Inputs */}
                <div>
                    <h3 className="text-xl font-bold mb-4">Retention Curve (% retained)</h3>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                        <div className="text-center">
                            <label className="block text-sm font-medium">Month 0</label>
                            <input
                                type="text"
                                value="100%"
                                disabled
                                className="w-full px-3 py-2 bg-gray-200 text-black rounded-lg text-center"
                            />
                        </div>
                        {retentionCurve.slice(1).map((rate, i) => (
                            <div key={i + 1} className="text-center">
                                <label className="block text-sm font-medium">Month {i + 1}</label>
                                <input
                                    type="number"
                                    value={rate}
                                    onChange={(e) => updateRetention(i + 1, e.target.value)}
                                    min="0"
                                    max="100"
                                    className="w-full px-3 py-2 bg-white text-black rounded-lg border border-gray-300 focus:border-accent"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Cohort Acquisitions */}
                <div>
                    <h3 className="text-xl font-bold mb-4">Monthly Acquisitions (New Users)</h3>
                    <div className="space-y-4">
                        {acquisitions.slice(0, maxCohorts).map((acq, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <span className="text-sm font-medium w-32">Cohort {i + 1} (Month {i + 1})</span>
                                <input
                                    type="number"
                                    value={acq}
                                    onChange={(e) => updateAcquisition(i, e.target.value)}
                                    placeholder="e.g., 1000"
                                    className="flex-1 px-4 py-2 bg-white text-black rounded-lg border border-gray-300 focus:border-accent"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Cohort Table */}
            {cohortData.length > 0 && (
                <motion.div
                    role="status"
                    aria-live="polite"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <h3 className="text-2xl font-bold mb-6 text-center">Cohort Retention Table</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm md:text-base border-collapse">
                            <thead>
                                <tr className="border-b border-black/20">
                                    <th className="text-left p-3 font-bold">Cohort</th>
                                    <th className="text-center p-3 font-bold">Month 0</th>
                                    {Array.from({ length: maxMonths }, (_, i) => (
                                        <th key={i} className="text-center p-3 font-bold">Month {i + 1}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {cohortData.map((row, cohortIdx) => (
                                    <tr key={cohortIdx} className="border-b border-black/10">
                                        <td className="p-3 font-medium">Cohort {cohortIdx + 1}</td>
                                        {row.map((users, month) => (
                                            <td key={month} className={`p-3 text-center font-mono ${getHeatmapClass(percentData[cohortIdx][month])}`}>
                                                {users.toLocaleString()}
                                                <div className="text-xs opacity-80">{percentData[cohortIdx][month]}%</div>
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                                <tr className="border-t-2 border-accent font-bold">
                                    <td className="p-3">Total Active</td>
                                    {totals.map((total, month) => (
                                        <td key={month} className="p-3 text-center font-mono bg-accent/20">
                                            {total.toLocaleString()}
                                        </td>
                                    ))}
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <p className="mt-8 text-center text-muted">
                        Heatmap: Brighter gold = higher retention. Use this to project MRR growth, identify retention drops, and optimize onboarding.
                    </p>
                </motion.div>
            )}
        </motion.div>
    );
}
