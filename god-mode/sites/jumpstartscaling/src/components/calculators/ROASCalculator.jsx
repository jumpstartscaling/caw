import React, { useState, useEffect } from 'react';
import './ROASCalculator.css';

const ROASCalculator = () => {
    const [spend, setSpend] = useState(5000);
    const [cpc, setCpc] = useState(2.50);
    const [convRate, setConvRate] = useState(2.0);
    const [aov, setAov] = useState(150);

    const [metrics, setMetrics] = useState({
        clicks: 0,
        conversions: 0,
        revenue: 0,
        roas: 0,
        profit: 0
    });

    useEffect(() => {
        const clicks = spend / cpc;
        const conversions = clicks * (convRate / 100);
        const revenue = conversions * aov;
        const roas = spend > 0 ? revenue / spend : 0;
        const profit = revenue - spend;

        setMetrics({
            clicks: Math.round(clicks),
            conversions: Math.round(conversions),
            revenue: Math.round(revenue),
            roas: roas.toFixed(2),
            profit: Math.round(profit)
        });
    }, [spend, cpc, convRate, aov]);

    const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

    return (
        <div className="roas-calculator-card">
            <div className="calc-header">
                <h3>💰 ROAS Projection Engine</h3>
                <p>See how small improvements compound into massive profit.</p>
            </div>

            <div className="calc-grid">
                <div className="inputs">
                    <div className="input-group">
                        <label>Monthly Ad Spend: {formatCurrency(spend)}</label>
                        <input type="range" min="1000" max="50000" step="500" value={spend} onChange={(e) => setSpend(Number(e.target.value))} />
                    </div>

                    <div className="input-group">
                        <label>Cost Per Click (CPC): {formatCurrency(cpc)}</label>
                        <input type="range" min="0.50" max="20.00" step="0.10" value={cpc} onChange={(e) => setCpc(Number(e.target.value))} />
                    </div>

                    <div className="input-group">
                        <label>Conversion Rate: {convRate}%</label>
                        <input type="range" min="0.1" max="10.0" step="0.1" value={convRate} onChange={(e) => setConvRate(Number(e.target.value))} />
                    </div>

                    <div className="input-group">
                        <label>Avg Order Value: {formatCurrency(aov)}</label>
                        <input type="range" min="50" max="2000" step="50" value={aov} onChange={(e) => setAov(Number(e.target.value))} />
                    </div>
                </div>

                <div className="results">
                    <div className="result-item">
                        <span>Projected Revenue</span>
                        <div className="result-value gold">{formatCurrency(metrics.revenue)}</div>
                    </div>

                    <div className="result-item">
                        <span>ROAS</span>
                        <div className={`result-value ${metrics.roas > 3 ? 'green' : metrics.roas > 1.5 ? 'yellow' : 'red'}`}>
                            {metrics.roas}x
                        </div>
                    </div>

                    <div className="result-item highlight">
                        <span>Net Profit (Ad Spend)</span>
                        <div className="result-value">{formatCurrency(metrics.profit)}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ROASCalculator;
