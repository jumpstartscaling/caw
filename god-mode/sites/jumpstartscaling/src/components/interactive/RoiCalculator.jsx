import { useState } from 'react';

export default function RoiCalculator() {
    const [leads, setLeads] = useState(100);
    const [rate, setRate] = useState(2);
    const [value, setValue] = useState(500);

    const revenue = leads * (rate / 100) * value;

    return (
        <div className="w-full max-w-md mx-auto p-6 bg-gray-800 rounded-xl shadow-2xl border border-gray-700 my-10">
            <h3 className="text-xl font-bold text-white mb-4">Scaling Potential Calculator</h3>

            <div className="space-y-4">
                <div>
                    <label className="block text-gray-400 text-sm mb-1">
                        Monthly Leads: <span className="text-white font-bold">{leads}</span>
                    </label>
                    <input
                        type="range"
                        min="0"
                        max="1000"
                        value={leads}
                        onChange={(e) => setLeads(e.target.value)}
                        className="w-full accent-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-gray-400 text-sm mb-1">
                        Conversion Rate: <span className="text-white font-bold">{rate}%</span>
                    </label>
                    <input
                        type="range"
                        min="0"
                        max="10"
                        step="0.5"
                        value={rate}
                        onChange={(e) => setRate(e.target.value)}
                        className="w-full accent-green-500"
                    />
                </div>

                <div>
                    <label className="block text-gray-400 text-sm mb-1">Customer Value ($):</label>
                    <input
                        type="number"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white"
                    />
                </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-600 text-center">
                <p className="text-sm text-gray-400">Projected Monthly Revenue</p>
                <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
                    ${revenue.toLocaleString()}
                </p>
            </div>
        </div>
    );
}
