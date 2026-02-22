import { useState } from 'react';

interface DomainSetupGuideProps {
    siteDomain?: string;
}

export default function DomainSetupGuide({ siteDomain }: DomainSetupGuideProps) {
    const [activeStep, setActiveStep] = useState(0);
    const [verifying, setVerifying] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error'>('pending');

    const steps = [
        {
            title: '1. Get Your Domain',
            content: (
                <div className="space-y-3">
                    <p className="text-slate-300">Purchase a domain from any registrar:</p>
                    <ul className="list-disc list-inside space-y-1 text-slate-400">
                        <li><a href="https://www.namecheap.com" target="_blank" rel="noopener" className="text-blue-400 hover:underline">Namecheap</a> (Recommended)</li>
                        <li><a href="https://www.godaddy.com" target="_blank" rel="noopener" className="text-blue-400 hover:underline">GoDaddy</a></li>
                        <li><a href="https://www.cloudflare.com/products/registrar/" target="_blank" rel="noopener" className="text-blue-400 hover:underline">Cloudflare</a></li>
                    </ul>
                </div>
            )
        },
        {
            title: '2. Configure DNS Records',
            content: (
                <div className="space-y-3">
                    <p className="text-slate-300">Add these DNS records at your registrar:</p>
                    <div className="bg-slate-900 p-4 rounded border border-slate-700 font-mono text-sm space-y-2">
                        <div>
                            <div className="text-slate-500">Type: <span className="text-green-400">CNAME</span></div>
                            <div className="text-slate-500">Name: <span className="text-blue-400">www</span></div>
                            <div className="text-slate-500">Target: <span className="text-purple-400">launch.jumpstartscaling.com</span></div>
                        </div>
                        <div className="border-t border-slate-700 pt-2">
                            <div className="text-slate-500">Type: <span className="text-green-400">A</span></div>
                            <div className="text-slate-500">Name: <span className="text-blue-400">@</span> (root)</div>
                            <div className="text-slate-500">Value: <span className="text-purple-400">72.61.15.216</span></div>
                        </div>
                    </div>
                    <p className="text-xs text-slate-500 italic">DNS propagation can take 5-60 minutes</p>
                </div>
            )
        },
        {
            title: '3. Update Site Settings',
            content: (
                <div className="space-y-3">
                    <p className="text-slate-300">Add your domain to Spark:</p>
                    <ol className="list-decimal list-inside space-y-2 text-slate-400">
                        <li>Go to Sites & Deployments</li>
                        <li>Edit your site</li>
                        <li>Set the "URL" field to your domain</li>
                        <li>Save changes</li>
                    </ol>
                    {siteDomain && (
                        <div className="bg-blue-900/20 border border-blue-700 rounded p-3">
                            <p className="text-sm text-blue-300">
                                Current domain: <span className="font-mono font-bold">{siteDomain}</span>
                            </p>
                        </div>
                    )}
                </div>
            )
        },
        {
            title: '4. Verify Connection',
            content: (
                <div className="space-y-3">
                    <p className="text-slate-300">Test if your domain is connected:</p>
                    <button
                        onClick={async () => {
                            if (!siteDomain) {
                                alert('Please set a domain in your site settings first');
                                return;
                            }
                            setVerifying(true);
                            try {
                                const response = await fetch(`https://${siteDomain}`, {
                                    method: 'HEAD',
                                    mode: 'no-cors'
                                });
                                setVerificationStatus('success');
                            } catch (error) {
                                setVerificationStatus('error');
                            }
                            setVerifying(false);
                        }}
                        disabled={!siteDomain || verifying}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {verifying ? 'Checking...' : 'Verify Domain'}
                    </button>

                    {verificationStatus === 'success' && (
                        <div className="bg-green-900/20 border border-green-700 rounded p-3">
                            <p className="text-green-300">✅ Domain connected successfully!</p>
                        </div>
                    )}

                    {verificationStatus === 'error' && (
                        <div className="bg-red-900/20 border border-red-700 rounded p-3 space-y-2">
                            <p className="text-red-300">❌ Domain not reachable yet</p>
                            <p className="text-sm text-red-400">DNS may still be propagating. Wait a few minutes and try again.</p>
                        </div>
                    )}
                </div>
            )
        }
    ];

    return (
        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
                <h3 className="text-xl font-bold text-white">🌐 Connect Your Domain</h3>
                <p className="text-blue-100 text-sm mt-1">Follow these steps to point your domain to Spark</p>
            </div>

            {/* Steps */}
            <div className="p-6">
                {/* Step Navigator */}
                <div className="flex justify-between mb-6">
                    {steps.map((step, index) => (
                        <button
                            key={index}
                            onClick={() => setActiveStep(index)}
                            className={`flex-1 py-2 text-sm font-medium transition-colors ${index === activeStep
                                    ? 'text-blue-400 border-b-2 border-blue-400'
                                    : 'text-slate-500 hover:text-slate-300'
                                }`}
                        >
                            Step {index + 1}
                        </button>
                    ))}
                </div>

                {/* Active Step Content */}
                <div className="min-h-[200px]">
                    <h4 className="text-lg font-semibold text-white mb-4">
                        {steps[activeStep].title}
                    </h4>
                    {steps[activeStep].content}
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-6 pt-4 border-t border-slate-700">
                    <button
                        onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                        disabled={activeStep === 0}
                        className="px-4 py-2 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        ← Previous
                    </button>
                    <button
                        onClick={() => setActiveStep(Math.min(steps.length - 1, activeStep + 1))}
                        disabled={activeStep === steps.length - 1}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Next →
                    </button>
                </div>
            </div>
        </div>
    );
}
