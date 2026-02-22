// src/components/forms/ScalingSurvey.tsx
import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';

type Inputs = {
    name: string;
    email: string;
    company: string;
    role: string;
    currentRevenue: string;
    targetRevenue: string;
    teamSize: string;
    industry: string;
    challenges: string[];
    marketingSpend: string;
    channels: string[];
    biggestGoal: string;
};

const STEPS = [
    { id: 1, title: 'Basics' },
    { id: 2, title: 'Revenue & Teams' },
    { id: 3, title: 'Growth Channels' },
    { id: 4, title: 'Final Details' },
];

export default function ScalingSurvey() {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const { register, handleSubmit, watch, trigger, formState: { errors } } = useForm<Inputs>({
        mode: 'onChange'
    });

    const nextStep = async () => {
        let fieldsToValidate: (keyof Inputs)[] = [];
        if (step === 1) fieldsToValidate = ['name', 'email', 'company', 'role'];
        if (step === 2) fieldsToValidate = ['currentRevenue', 'targetRevenue', 'teamSize'];
        if (step === 3) fieldsToValidate = ['marketingSpend']; // Channels optional-ish
        if (step === 4) fieldsToValidate = ['biggestGoal'];

        const isValid = await trigger(fieldsToValidate);
        if (isValid) setStep((s) => s + 1);
    };

    const prevStep = () => setStep((s) => s - 1);

    const onSubmit: SubmitHandler<Inputs> = async (data) => {
        setIsSubmitting(true);

        // Analytics Event
        if (typeof window !== 'undefined' && (window as any).trackEvent) {
            (window as any).trackEvent('survey_submitted', 'audit', 'scaling_survey');
        }

        try {
            const response = await fetch('/api/submit-scaling-survey', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                setIsSuccess(true);
            } else {
                alert('Something went wrong. Please try again.');
            }
        } catch (error) {
            console.error(error);
            alert('Network error. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20 px-6 max-w-2xl mx-auto glass-card border border-accent/20"
            >
                <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(232,198,119,0.4)]">
                    <svg className="w-10 h-10 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h2 className="text-4xl font-bold gradient-text mb-6">Audit Request Received</h2>
                <p className="text-xl text-white/80 mb-8">
                    Our growth engineers are analyzing your data. You will receive your custom Moat Audit report via email within 24-48 hours.
                </p>
                <a href="/resources/calculators" className="inline-block px-8 py-4 bg-white/10 hover:bg-white/20 rounded-full transition text-white border border-white/20">
                    While you wait, try our Calculators &rarr;
                </a>
            </motion.div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto">
            {/* Progress Bar */}
            <div className="mb-8">
                <div className="flex justify-between mb-2">
                    {STEPS.map((s) => (
                        <span key={s.id} className={`text-xs uppercase tracking-widest font-bold ${step >= s.id ? 'text-accent' : 'text-white/30'}`}>
                            {s.title}
                        </span>
                    ))}
                </div>
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-accent"
                        initial={{ width: '0%' }}
                        animate={{ width: `${(step / STEPS.length) * 100}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="glass-card p-8 md:p-12 relative overflow-hidden">
                {/* Step 1: Basics */}
                {step === 1 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        <h2 className="text-3xl font-bold mb-6">Let's start with the basics.</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/70">Full Name *</label>
                                <input {...register("name", { required: true })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-accent focus:outline-none focus:bg-white/10 transition" placeholder="John Doe" />
                                {errors.name && <span className="text-red-400 text-xs">Required</span>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/70">Work Email *</label>
                                <input {...register("email", { required: true, pattern: /^\S+@\S+$/i })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-accent focus:outline-none focus:bg-white/10 transition" placeholder="john@company.com" />
                                {errors.email && <span className="text-red-400 text-xs">Valid email required</span>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/70">Company Name *</label>
                                <input {...register("company", { required: true })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-accent focus:outline-none focus:bg-white/10 transition" placeholder="Acme Inc." />
                                {errors.company && <span className="text-red-400 text-xs">Required</span>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/70">Your Role *</label>
                                <select {...register("role", { required: true })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-accent focus:outline-none focus:bg-white/10 transition text-white">
                                    <option value="" className="bg-zinc-900">Select...</option>
                                    <option value="Founder/CEO" className="bg-zinc-900">Founder/CEO</option>
                                    <option value="Marketing Lead" className="bg-zinc-900">Marketing Lead</option>
                                    <option value="Sales Lead" className="bg-zinc-900">Sales Lead</option>
                                    <option value="Product" className="bg-zinc-900">Product</option>
                                    <option value="Other" className="bg-zinc-900">Other</option>
                                </select>
                                {errors.role && <span className="text-red-400 text-xs">Required</span>}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Step 2: Revenue & Team */}
                {step === 2 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                        <h2 className="text-3xl font-bold mb-6">Scale & Ambition.</h2>
                        <div className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-white/70">Current Annual Revenue (ARR) *</label>
                                    <select {...register("currentRevenue", { required: true })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-accent focus:outline-none text-white">
                                        <option value="" className="bg-zinc-900">Select...</option>
                                        <option value="0-100k" className="bg-zinc-900">&lt; $100k</option>
                                        <option value="100k-500k" className="bg-zinc-900">$100k - $500k</option>
                                        <option value="500k-1m" className="bg-zinc-900">$500k - $1M</option>
                                        <option value="1m-5m" className="bg-zinc-900">$1M - $5M</option>
                                        <option value="5m-10m" className="bg-zinc-900">$5M - $10M</option>
                                        <option value="10m+" className="bg-zinc-900">$10M+</option>
                                    </select>
                                    {errors.currentRevenue && <span className="text-red-400 text-xs">Required</span>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-white/70">Target Revenue (Next 12 Months) *</label>
                                    <input type="number" {...register("targetRevenue", { required: true })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-accent focus:outline-none" placeholder="e.g. 5000000" />
                                    {errors.targetRevenue && <span className="text-red-400 text-xs">Required</span>}
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-white/70">Primary Industry *</label>
                                    <input {...register("industry", { required: true })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-accent focus:outline-none" placeholder="e.g. B2B SaaS, Fintech" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-white/70">Team Size *</label>
                                    <select {...register("teamSize", { required: true })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-accent focus:outline-none text-white">
                                        <option value="" className="bg-zinc-900">Select...</option>
                                        <option value="1-5" className="bg-zinc-900">1-5</option>
                                        <option value="6-20" className="bg-zinc-900">6-20</option>
                                        <option value="21-50" className="bg-zinc-900">21-50</option>
                                        <option value="50+" className="bg-zinc-900">50+</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Step 3: Growth Channels */}
                {step === 3 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                        <h2 className="text-3xl font-bold mb-6">Marketing Engine.</h2>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/70">Monthly Marketing Budget ($) *</label>
                                <select {...register("marketingSpend", { required: true })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-accent focus:outline-none text-white">
                                    <option value="" className="bg-zinc-900">Select...</option>
                                    <option value="0-5k" className="bg-zinc-900">&lt; $5k</option>
                                    <option value="5k-20k" className="bg-zinc-900">$5k - $20k</option>
                                    <option value="20k-50k" className="bg-zinc-900">$20k - $50k</option>
                                    <option value="50k-100k" className="bg-zinc-900">$50k - $100k</option>
                                    <option value="100k+" className="bg-zinc-900">$100k+</option>
                                </select>
                                {errors.marketingSpend && <span className="text-red-400 text-xs">Required</span>}
                            </div>

                            <div className="space-y-4">
                                <label className="text-sm font-medium text-white/70">Active Channels (Select all that apply)</label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {['Google Ads', 'Facebook/IG', 'LinkedIn', 'SEO', 'Cold Email', 'Content', 'Affiliates', 'Events', 'None'].map((channel) => (
                                        <label key={channel} className="flex items-center space-x-3 p-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 cursor-pointer transition">
                                            <input type="checkbox" value={channel} {...register("channels")} className="form-checkbox text-accent rounded focus:ring-accent bg-transparent border-white/30" />
                                            <span className="text-sm text-white/80">{channel}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Step 4: Final Details */}
                {step === 4 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                        <h2 className="text-3xl font-bold mb-6">The Goal.</h2>
                        <div className="space-y-8">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/70">What is your single biggest bottleneck right now? *</label>
                                <textarea {...register("biggestGoal", { required: true })} rows={4} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-accent focus:outline-none focus:bg-white/10 transition" placeholder="e.g. Can't scale ads profitably, high churn, lack of leads..." />
                                {errors.biggestGoal && <span className="text-red-400 text-xs">Required</span>}
                            </div>

                            <div className="bg-accent/10 p-6 rounded-xl border border-accent/20">
                                <h4 className="font-bold text-accent mb-2">What happens next?</h4>
                                <p className="text-sm text-white/70">
                                    Our team will manually review your submission and construct a 9-point "Moat Audit" highlighting your gaps versus best-in-class SaaS companies. You'll receive this via email in 24-48 hours.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Navigation Buttons */}
                <div className="mt-10 flex justify-between items-center pt-8 border-t border-white/10">
                    {step > 1 ? (
                        <button type="button" onClick={prevStep} className="px-6 py-2 text-white/50 hover:text-white transition">
                            &larr; Back
                        </button>
                    ) : <div></div>}

                    {step < 4 ? (
                        <button type="button" onClick={nextStep} className="px-8 py-3 bg-white text-black font-bold rounded-lg hover:bg-accent transition hover:shadow-[0_0_20px_rgba(232,198,119,0.4)]">
                            Next Step &rarr;
                        </button>
                    ) : (
                        <button type="submit" disabled={isSubmitting} className="px-10 py-3 bg-accent text-black font-bold rounded-lg shadow-[0_0_25px_rgba(232,198,119,0.5)] hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed">
                            {isSubmitting ? 'Submitting...' : 'COMPLETE AUDIT REQUEST'}
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}
