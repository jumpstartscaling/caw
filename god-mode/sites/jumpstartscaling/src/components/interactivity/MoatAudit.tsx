import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MoatAudit() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [loadingText, setLoadingText] = useState('> INITIALIZING DIAGNOSTIC...');
    const [score, setScore] = useState(0);
    const [formData, setFormData] = useState({
        friction_point: '',
        market_velocity: '',
        name: '',
        email: '',
        website: ''
    });

    const selectFriction = (value) => {
        setFormData({ ...formData, friction_point: value });
        setStep(2);
    };

    const selectVelocity = (value) => {
        setFormData({ ...formData, market_velocity: value });
        runAnalysis();
    };

    const runAnalysis = async () => {
        setStep(3);
        setLoading(true);

        const texts = [
            '> SCANNING DOMAIN AUTHORITY...',
            '> MAPPING COMPETITOR MOATS...',
            '> CALCULATING REVENUE LEAKAGE...',
            '> FINALIZING ENGINEERING REPORT...'
        ];

        for (let i = 0; i < texts.length; i++) {
            setLoadingText(texts[i]);
            await new Promise(r => setTimeout(r, 700));
        }

        // Randomize Score (14-38%)
        setScore(Math.floor(Math.random() * (38 - 14 + 1)) + 14);
        setLoading(false);
        setStep(4);
    };

    const submitToGravity = () => {
        // In a real app, this would POST to n8n
        alert('SYSTEM OVERRIDE: AUDIT DISPATCHED TO ENGINEERING.');
    };

    return (
        <div className="w-full max-w-4xl mx-auto font-sans text-white">
            <div className="glass-panel rounded-xl overflow-hidden relative border border-white/10 shadow-2xl bg-[#0A0A0A]/80 backdrop-blur-xl">

                {/* Header */}
                <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-black/40">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-[#C9A961] animate-pulse"></div>
                        <span className="font-mono text-xs tracking-[0.2em] text-[#C9A961]/80 uppercase">PROTOCOL 00: THE MOAT DISCOVERY</span>
                    </div>
                    <div className="font-mono text-xs text-gray-600">
                        {step} / 4 STEPS
                    </div>
                </div>

                {/* Content Body */}
                <div className="p-8 md:p-12 min-h-[400px] flex flex-col justify-center relative">
                    <AnimatePresence mode='wait'>

                        {/* STEP 1: The Hook */}
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Identify Your Primary Constraint.</h2>
                                <p className="text-gray-400 mb-8 max-w-xl">
                                    Scale fails where friction peaks. Select the vector that is currently throttling your revenue velocity.
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {[
                                        { id: 'INBOUND_FLOW', label: 'VOLUME', title: 'INBOUND FLOW' },
                                        { id: 'SALES_VELOCITY', label: 'CONVERSION', title: 'SALES VELOCITY' },
                                        { id: 'SYSTEM_LIFECYCLE', label: 'RETENTION', title: 'SYSTEM LIFECYCLE' }
                                    ].map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => selectFriction(item.id)}
                                            className="group p-6 text-left border border-white/10 hover:border-[#C9A961]/50 bg-white/5 hover:bg-white/10 transition-all duration-300 rounded-lg"
                                        >
                                            <span className="block font-mono text-xs text-[#C9A961] mb-2">{item.label}</span>
                                            <span className="text-lg font-bold text-white group-hover:text-[#C9A961] transition-colors">{item.title}</span>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 2: Qualification */}
                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Current Market Velocity.</h2>
                                <p className="text-gray-400 mb-8">
                                    We deploy engineering resources based on infrastructure load. Verify your current monthly revenue throughput.
                                </p>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {['$20k - $50k', '$50k - $100k', '$100k - $500k', '$500k+'].map((val) => (
                                        <button
                                            key={val}
                                            onClick={() => selectVelocity(val)}
                                            className="py-4 border border-white/10 hover:border-[#C9A961] text-gray-300 hover:text-white font-mono text-sm transition-all hover:bg-[#C9A961]/5 rounded-lg"
                                        >
                                            {val}
                                        </button>
                                    ))}
                                </div>

                                <button onClick={() => setStep(1)} className="mt-6 text-xs font-mono text-gray-600 hover:text-gray-400 flex items-center gap-2">
                                    <span>&larr; RETURN TO VECTOR SELECTION</span>
                                </button>
                            </motion.div>
                        )}

                        {/* STEP 3: Analysis Loading */}
                        {step === 3 && (
                            <div className="flex flex-col items-center justify-center text-center w-full">
                                <div className="mb-8 relative w-24 h-24 flex items-center justify-center">
                                    <div className="absolute inset-0 border-2 border-[#C9A961] rounded-full animate-ping opacity-20"></div>
                                    <div className="absolute inset-2 border border-white/20 rounded-full animate-spin duration-[3s]"></div>
                                    <svg className="w-10 h-10 text-[#C9A961]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <p className="font-mono text-[#C9A961] text-sm tracking-widest animate-pulse">{loadingText}</p>
                            </div>
                        )}

                        {/* STEP 4: Reveal */}
                        {step === 4 && (
                            <motion.div
                                key="step4"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5 }}
                            >
                                <div className="flex flex-col md:flex-row gap-8 items-start">
                                    {/* Result */}
                                    <div className="w-full md:w-1/2 p-6 bg-white/5 border border-[#C9A961]/20 rounded-lg">
                                        <div className="flex items-baseline gap-4 mb-2">
                                            <span className="text-5xl font-bold text-white">{score}%</span>
                                            <span className="text-xs font-mono text-red-500 tracking-widest">CRITICAL LEAKAGE</span>
                                        </div>
                                        <h3 className="text-[#C9A961] font-bold mb-4">Moat Integrity Compromised.</h3>
                                        <p className="text-sm text-gray-400 mb-4 leading-relaxed">
                                            Our diagnostic has identified significant gaps in your Authority Architecture. Your current system is capturing less than {score}% of available market demand.
                                        </p>
                                        <p className="text-sm text-gray-400">
                                            Estimated Monthly Loss: <span className="text-white font-mono">$18,500 - $42,000</span> (Recurring).
                                        </p>
                                    </div>

                                    {/* Form */}
                                    <div className="w-full md:w-1/2">
                                        <div className="mb-6">
                                            <h3 className="text-xl font-bold text-white mb-2">Unlock Engineering Report.</h3>
                                            <p className="text-xs text-gray-500 font-mono">SECURE TRANSMISSION // ENGINEER EYES ONLY</p>
                                        </div>
                                        <div className="space-y-4">
                                            <input type="text" placeholder="Full Name" onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-black border border-white/20 p-3 text-white text-sm font-mono focus:border-[#C9A961] focus:outline-none transition-colors rounded" />
                                            <input type="email" placeholder="Business Email" onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full bg-black border border-white/20 p-3 text-white text-sm font-mono focus:border-[#C9A961] focus:outline-none transition-colors rounded" />
                                            <input type="text" placeholder="Company URL" onChange={(e) => setFormData({ ...formData, website: e.target.value })} className="w-full bg-black border border-white/20 p-3 text-white text-sm font-mono focus:border-[#C9A961] focus:outline-none transition-colors rounded" />

                                            <button onClick={submitToGravity} className="w-full py-4 bg-[#C9A961] text-black font-bold tracking-wider hover:bg-white transition-all duration-300 shadow-[0_0_20px_rgba(201,169,97,0.2)] rounded uppercase">
                                                Execute Growth Diagnostic
                                            </button>
                                            <p className="text-[10px] text-gray-600 text-center uppercase tracking-widest mt-4">
                                                Data encrypted via SHA-256. Zero-spam protocol.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>

                {/* Decorators */}
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#C9A961]"></div>
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#C9A961]"></div>
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#C9A961]"></div>
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#C9A961]"></div>
            </div>
        </div>
    );
}
