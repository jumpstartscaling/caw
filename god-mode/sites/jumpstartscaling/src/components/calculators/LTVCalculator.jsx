import React, { useState, useEffect } from 'react';

const LTVCalculator = () => {
    const [retainer, setRetainer] = useState(2000);
    const [months, setMonths] = useState(6);
    const [churn, setChurn] = useState(5); // Monthly Churn Rate

    const [ltv, setLtv] = useState(0);
    const [annualRev, setAnnualRev] = useState(0);

    useEffect(() => {
        // Basic LTV = ARPU / Churn Rate
        // Or simpler: Monthly * Months

        // Scenario 1: Basic Math
        const basicLTV = retainer * months;

        // Scenario 2: Churn Based
        const churnDecimal = churn / 100;
        const churnLTV = churnDecimal > 0 ? retainer / churnDecimal : 0;

        setLtv(basicLTV);
        setAnnualRev(basicLTV * 12); // Extrapolated
    }, [retainer, months, churn]);

    const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

    return (
        <div className="ltv-card">
            <div className="calc-header">
                <h3>🔄 Retention Value Simulator</h3>
                <p>Why keeping clients longer is more profitable than finding new ones.</p>
            </div>

            <div className="grid">
                <div>
                    <label>Monthly Retainer Price</label>
                    <input type="range" min="500" max="10000" step="500" value={retainer} onChange={(e) => setRetainer(Number(e.target.value))} />
                    <div className="val">{formatCurrency(retainer)}</div>
                </div>
                <div>
                    <label>Avg Retention (Months)</label>
                    <input type="range" min="1" max="36" step="1" value={months} onChange={(e) => setMonths(Number(e.target.value))} />
                    <div className="val">{months} months</div>
                </div>
            </div>

            <div className="result">
                <span>Customer Lifetime Value</span>
                <strong>{formatCurrency(ltv)}</strong>
            </div>

            <style jsx>{`
        .ltv-card {
           background: #0a0a0a; border: 1px solid #333; padding: 2rem; border-radius: 8px; margin: 3rem 0;
           font-family: 'Inter', sans-serif;
        }
        .calc-header h3 { color: #fff; margin-bottom: 0.5rem; }
        .calc-header p { color: #888; font-size: 0.9rem; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin: 2rem 0; }
        label { color: #aaa; font-size: 0.9rem; display: block; margin-bottom: 0.5rem; }
        input { width: 100%; accent-color: #00ff94; }
        .val { color: #fff; font-weight: bold; margin-top: 0.5rem; }
        .result { text-align: center; background: rgba(0,255,148,0.05); padding: 1.5rem; border: 1px dashed #00ff94; border-radius: 8px; }
        .result span { display: block; color: #00ff94; text-transform: uppercase; font-size: 0.8rem; margin-bottom: 0.5rem; }
        .result strong { font-size: 2.5rem; color: #fff; }
      `}</style>
        </div>
    );
};

export default LTVCalculator;
