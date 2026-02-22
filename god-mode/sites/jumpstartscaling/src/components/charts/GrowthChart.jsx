import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
    { name: 'Jan', value: 400 },
    { name: 'Feb', value: 300 },
    { name: 'Mar', value: 600 },
    { name: 'Apr', value: 800 },
    { name: 'May', value: 1500 },
];

export default function GrowthChart() {
    return (
        <div className="h-64 w-full p-4 bg-gray-900 rounded-xl border border-gray-800">
            <h3 className="text-white mb-4 font-bold">Projected Velocity</h3>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <XAxis dataKey="name" stroke="#888888" />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#111', borderColor: '#333' }}
                        itemStyle={{ color: '#fff' }}
                    />
                    <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={3} dot={{ r: 6 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
