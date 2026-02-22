import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
    { name: 'Q1', growth: 400 },
    { name: 'Q2', growth: 1200 },
    { name: 'Q3', growth: 3400 },
    { name: 'Q4', growth: 5800 },
];

export default function NeonChart() {
    return (
        <div className="h-64 w-full bg-gray-900/50 rounded-xl border border-indigo-500/30 p-4 shadow-[0_0_15px_rgba(79,70,229,0.3)]">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="#666" />
                    <Tooltip contentStyle={{ backgroundColor: '#111', border: 'none' }} />
                    <Area type="monotone" dataKey="growth" stroke="#8884d8" fillOpacity={1} fill="url(#colorGrowth)" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
