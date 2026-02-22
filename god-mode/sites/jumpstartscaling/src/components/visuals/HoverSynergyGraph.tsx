import { motion } from 'framer-motion';
import { useState } from 'react';

const services = [
    { name: 'Paid Acquisition', desc: 'Engineered media buying for 5-10x ROAS' },
    { name: 'Funnel Architecture', desc: 'Sub-100ms landing pages and conversion systems' },
    { name: 'CRM Transformation', desc: 'Automated nurture pipelines fixing leaky buckets' },
    { name: 'Data Attribution', desc: 'Server-side tracking surviving privacy changes' },
    { name: 'Authority Engine', desc: 'Content & validation building market moats' },
    { name: 'Growth Retainer', desc: 'Fractional CMO partnership' },
];

export default function HoverSynergyGraph() {
    const [hovered, setHovered] = useState<number | null>(null);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="relative w-full h-[600px] my-20 flex items-center justify-center"
        >
            <svg viewBox="0 0 800 800" className="w-full h-full max-w-[800px]">
                {/* Central Hub */}
                <circle cx="400" cy="400" r="80" fill="var(--accent)" opacity="0.2" />
                <circle cx="400" cy="400" r="60" fill="var(--surface)" stroke="var(--accent)" strokeWidth="2" />
                <text x="400" y="400" textAnchor="middle" dominantBaseline="middle" fill="var(--text-primary)" fontSize="18" fontWeight="bold" style={{ textTransform: 'uppercase', letterSpacing: '2px' }}>Domination</text>

                {services.map((s, i) => {
                    const angle = (i / services.length) * Math.PI * 2 - Math.PI / 2;
                    const x = 400 + Math.cos(angle) * 280;
                    const y = 400 + Math.sin(angle) * 280;
                    return (
                        <g key={i}>
                            <line x1="400" y1="400" x2={x} y2={y} stroke="var(--accent-dim)" strokeWidth="2" opacity="0.3" />

                            <motion.circle
                                cx={x} cy={y} r="60" fill="var(--surface)" stroke="var(--accent-dim)" strokeWidth="2"
                                initial={{ scale: 1 }}
                                whileHover={{ scale: 1.2, stroke: 'var(--accent)', fill: 'var(--surface)' }}
                                onHoverStart={() => setHovered(i)}
                                onHoverEnd={() => setHovered(null)}
                                style={{ cursor: 'pointer' }}
                            />

                            {/* Icon placeholder or initial */}
                            <text x={x} y={y} textAnchor="middle" dominantBaseline="middle" fill="var(--text-secondary)" fontSize="24" fontWeight="bold" pointerEvents="none">
                                {i + 1}
                            </text>

                            <text x={x} y={y + 80} textAnchor="middle" fill="var(--text-primary)" fontSize="14" fontWeight="bold" className="uppercase tracking-wider">
                                {s.name.split(' ')[0]}
                            </text>
                            <text x={x} y={y + 96} textAnchor="middle" fill="var(--text-primary)" fontSize="14" fontWeight="bold" className="uppercase tracking-wider">
                                {s.name.split(' ')[1]}
                            </text>
                        </g>
                    );
                })}
            </svg>

            {hovered !== null && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 glass-card p-6 min-w-[300px] text-center pointer-events-none z-50 bg-[var(--surface)]/95 border-[var(--accent)]"
                >
                    <h4 className="text-xl font-bold gradient-text mb-2">{services[hovered].name}</h4>
                    <p className="text-[var(--text-secondary)]">{services[hovered].desc}</p>
                </motion.div>
            )}
        </motion.div>
    );
}
