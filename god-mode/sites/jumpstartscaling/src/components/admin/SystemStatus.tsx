import React, { useEffect, useState } from 'react';

type SystemMetric = {
    label: string;
    status: 'active' | 'standby' | 'online' | 'connected' | 'ready' | 'error';
    color: string;
};

export default function SystemStatus() {
    const [metrics, setMetrics] = useState<SystemMetric[]>([
        { label: 'Intelligence Station', status: 'active', color: 'bg-green-500' },
        { label: 'Production Station', status: 'active', color: 'bg-green-500' },
        { label: 'WordPress Ignition', status: 'standby', color: 'bg-yellow-500' },
        { label: 'Core API', status: 'online', color: 'bg-blue-500' },
        { label: 'Directus DB', status: 'connected', color: 'bg-emerald-500' },
        { label: 'WP Connection', status: 'ready', color: 'bg-green-500' }
    ]);

    // In a real scenario, we would poll an API here. 
    // For now, we simulate the "Live" feeling or check basic connectivity.
    useEffect(() => {
        const checkHealth = async () => {
            // We can check Directus health via SDK in future
            // For now, we trust the static state or toggle visually to show life
        };
        checkHealth();
    }, []);

    return (
        <div className="p-4 rounded-lg bg-slate-900 border border-slate-700 shadow-xl w-full">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Sub-Station Status
            </h3>
            <div className="grid grid-cols-1 gap-2">
                {metrics.map((m, idx) => (
                    <div key={idx} className="flex items-center justify-between group">
                        <span className="text-sm text-slate-300 font-medium group-hover:text-white transition-colors">{m.label}</span>
                        <div className="flex items-center gap-2">
                            <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded text-white ${getStatusColor(m.status)}`}>
                                {m.status}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function getStatusColor(status: string) {
    switch (status) {
        case 'active': return 'bg-green-600';
        case 'standby': return 'bg-yellow-600';
        case 'online': return 'bg-blue-600';
        case 'connected': return 'bg-emerald-600';
        case 'ready': return 'bg-green-600';
        case 'error': return 'bg-red-600';
        default: return 'bg-gray-600';
    }
}
