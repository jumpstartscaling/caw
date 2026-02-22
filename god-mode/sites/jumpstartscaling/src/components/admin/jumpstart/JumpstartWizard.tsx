
// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { WordPressClient } from '@/lib/wordpress/WordPressClient';
import { getDirectusClient, createItem, readItems } from '@/lib/directus/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import SendToFactoryButton from '@/components/admin/factory/SendToFactoryButton';

type Step = 'connect' | 'inventory' | 'qc' | 'launch';

export default function JumpstartWizard() {
    const [step, setStep] = useState<Step>('connect');
    const [logs, setLogs] = useState<string[]>([]);

    // Connection State
    const [siteUrl, setSiteUrl] = useState('');
    const [username, setUsername] = useState('');
    const [appPassword, setAppPassword] = useState('');

    // Inventory State
    const [inventory, setInventory] = useState<any>(null);
    const [qcItems, setQcItems] = useState<any[]>([]);

    // State for Job Tracking
    const [jobId, setJobId] = useState<string | number | null>(null);
    const [progress, setProgress] = useState({ total: 0, processed: 0, status: 'Idle' });

    const addLog = (msg: string) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);

    // Polling Effect
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (step === 'launch' && jobId) {
            const client = getDirectusClient();
            interval = setInterval(async () => {
                try {
                    const job = await client.request(readItem('generation_jobs', jobId));
                    const current = job.current_offset || 0;
                    const total = job.target_quantity || 1;

                    setProgress({
                        total: total,
                        processed: current,
                        status: job.status
                    });

                    // Auto-logging based on progress
                    if (current > progress.processed) {
                        addLog(`⚙️ Processed ${current} / ${total}`);
                    }

                    if (job.status === 'Complete') {
                        addLog("✅ Job Complete!");
                        clearInterval(interval);
                    }
                } catch (e) {
                    // Silent fail on poll
                }
            }, 2000);
        }
        return () => clearInterval(interval);
    }, [step, jobId, progress.processed]);

    // 1. CONNECT THE CABLES
    const handleConnect = async () => {
        addLog(`🔌 Connecting to ${siteUrl}...`);
        try {
            const wp = new WordPressClient(siteUrl, appPassword ? `${username}:${appPassword}` : undefined);
            const alive = await wp.testConnection();
            if (alive) {
                addLog("✅ Connection Successful.");
                setStep('inventory');
                await scanInventory(wp);
            } else {
                addLog("❌ Connection Failed. Check URL.");
            }
        } catch (e) { addLog(`❌ Error: ${e.message}`); }
    };

    // 2. INVENTORY & FILTER
    const scanInventory = async (wp: WordPressClient) => {
        addLog("📦 Fetching Inventory (ALL Posts)... this may take a moment.");
        try {
            const posts = await wp.getAllPosts();
            const categories = await wp.getCategories();

            addLog(`📊 Found ${posts.length} Posts, ${categories.length} Categories.`);

            // Map posts to clean format
            const items = posts.map(p => ({
                id: p.id,
                slug: p.slug,
                title: p.title.rendered,
                content: p.content.rendered,
                link: p.link, // Keep original link
                status: 'pending' // Default for our tracker
            }));

            setInventory({
                total_posts: posts.length,
                valid_categories: categories.length,
                items: items
            });
            setStep('qc');
            generateQC(wp, items);
        } catch (e) {
            addLog(`❌ Scan Error: ${e.message}`);
        }
    };

    // 3. QC GENERATION (First 3)
    const generateQC = async (wp: WordPressClient, items: any[]) => {
        addLog("🧪 Generating QC Batch (First 3 Articles)...");
        // Just pick the first 3 real items
        const sample = items.slice(0, 3).map(i => ({
            ...i,
            status: 'Review Needed' // Fake status for UI
        }));
        setQcItems(sample);
        addLog("⚠️ QC Paused. Waiting for Approval.");
    };

    // 4. IGNITION
    const handleLaunch = async () => {
        setStep('launch');
        addLog("🚀 IGNITION! Registering Job in System...");

        try {
            const client = getDirectusClient();

            // A. Find or Create Site
            const siteUrlFull = siteUrl.startsWith('http') ? siteUrl : `https://${siteUrl}`;
            let siteId: string | number;

            addLog(`🔎 Checking Site Record for ${siteUrlFull}...`);
            const existingSites = await client.request(readItems('sites', {
                filter: { url: { _eq: siteUrlFull } },
                limit: 1
            }));

            if (existingSites && existingSites.length > 0) {
                siteId = existingSites[0].id;
                addLog(`✅ Found existing site (ID: ${siteId})`);
            } else {
                addLog(`✨ Creating new site record...`);
                const newSite = await client.request(createItem('sites', {
                    name: new URL(siteUrlFull).hostname,
                    url: siteUrlFull
                }));
                siteId = newSite.id;
            }

            // B. Create Job
            addLog("📝 Creating Generation Job...");
            const job = await client.request(createItem('generation_jobs', {
                site_id: siteId,
                status: 'Pending',
                type: 'Refactor',
                target_quantity: inventory.total_posts,
                config: {
                    wordpress_url: siteUrl,
                    wordpress_auth: appPassword ? `${username}:${appPassword}` : null,
                    mode: 'refactor',
                    batch_size: 5,
                    total_posts: inventory.total_posts
                }
            }));
            const newJobId = job.id;
            setJobId(newJobId); // Set state for polling
            addLog(`✅ Job #${newJobId} Created.`);

            // C. Trigger Engine
            addLog("🔥 Firing Engine...");
            const res = await fetch('/api/generate-content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jobId: newJobId,
                    mode: 'refactor',
                    batchSize: 5
                })
            });

            if (res.ok) {
                addLog("✅ Jumpstart Job Queued Successfully. Engine is processing.");
            } else {
                const err = await res.json();
                addLog(`❌ Ignition Error: ${err.message || err.error}`);
            }
        } catch (e) {
            const errorMsg = e?.message || e?.error || e?.toString() || 'Unknown error';
            addLog(`❌ Error: ${errorMsg}`);
            console.error('Full Jumpstart error:', e);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header / Animation */}
            <div className="flex items-center justify-between bg-slate-900 p-6 rounded-xl border border-slate-700 relative overflow-hidden">
                <div className="z-10 relative">
                    <h1 className="text-3xl font-extrabold text-white mb-2">Guided Jumpstart Test</h1>
                    <p className="text-slate-400">Phase 6: Connection, Inventory, QC, Ignition.</p>
                </div>
                <img
                    src="/assets/rocket_man.webp"
                    className={`w-32 h-32 object-contain transition-transform duration-1000 ${step === 'launch' ? 'translate-x-[200px] -translate-y-[100px] opacity-0' : ''}`}
                />
            </div>

            <div className="grid grid-cols-3 gap-6">
                {/* Main Control Panel */}
                <Card className="col-span-2 bg-slate-800 border-slate-700">
                    <CardContent className="p-6 space-y-6">
                        {step === 'connect' && (
                            <div className="space-y-4">
                                <h2 className="text-xl font-bold text-white">1. Connect the Cables</h2>
                                <div className="space-y-2">
                                    <label className="text-sm text-slate-400">Site URL</label>
                                    <Input value={siteUrl} onChange={e => setSiteUrl(e.target.value)} className="bg-slate-900 border-slate-600" placeholder="https://..." />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm text-slate-400">Username</label>
                                        <Input value={username} onChange={e => setUsername(e.target.value)} className="bg-slate-900 border-slate-600" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm text-slate-400">App Password</label>
                                        <Input type="password" value={appPassword} onChange={e => setAppPassword(e.target.value)} className="bg-slate-900 border-slate-600" />
                                    </div>
                                </div>
                                <Button onClick={handleConnect} className="w-full bg-blue-600 hover:bg-blue-500">Connect & Scan</Button>
                            </div>
                        )}

                        {step === 'inventory' && (
                            <div className="flex items-center justify-center h-40">
                                <p className="text-slate-400 animate-pulse">Scanning Inventory...</p>
                            </div>
                        )}

                        {step === 'qc' && (
                            <div className="space-y-4">
                                <h2 className="text-xl font-bold text-white">2. Quality Control Gate</h2>
                                <div className="bg-slate-900 p-4 rounded-lg space-y-2">
                                    {qcItems.map(item => (
                                        <div key={item.id} className="flex justify-between items-center bg-slate-800 p-3 rounded border border-slate-700">
                                            <div className="flex flex-col">
                                                <span className="text-slate-200 font-medium truncate w-64">{item.title}</span>
                                                <a href={item.link} target="_blank" className="text-xs text-blue-400 hover:underline">View Original</a>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <SendToFactoryButton
                                                    postId={item.id}
                                                    postTitle={item.title}
                                                    siteUrl={siteUrl}
                                                    siteAuth={appPassword ? `${username}:${appPassword}` : undefined}
                                                    variant="small"
                                                    onSuccess={(result) => {
                                                        addLog(`✅ Article generated: ${result.article.title}`);
                                                        addLog(`🔗 Preview: ${result.previewUrl}`);
                                                    }}
                                                    onError={(error) => {
                                                        addLog(`❌ Factory error: ${error}`);
                                                    }}
                                                />
                                                <Badge variant="outline" className="text-yellow-400 border-yellow-400">Review Needed</Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-4">
                                    <Button variant="outline" className="flex-1 border-slate-600 text-slate-300">Reject / Regenerate</Button>
                                    <Button onClick={handleLaunch} className="flex-1 bg-green-600 hover:bg-green-500">Approve & Ignite 🚀</Button>
                                </div>
                            </div>
                        )}

                        {step === 'launch' && (
                            <div className="space-y-4 text-center py-8">
                                <h2 className="text-2xl font-bold text-green-400 animate-pulse">Engine Running</h2>
                                <p className="text-slate-400">Job #{jobId}: {progress.status}</p>
                                <Progress value={(progress.processed / (progress.total || 1)) * 100} className="h-4 bg-slate-900" />
                                <div className="grid grid-cols-3 gap-4 pt-4">
                                    <div className="bg-slate-900 p-3 rounded">
                                        <div className="text-2xl font-bold text-white">{progress.total}</div>
                                        <div className="text-xs text-slate-500">Total</div>
                                    </div>
                                    <div className="bg-slate-900 p-3 rounded">
                                        <div className="text-2xl font-bold text-blue-400">{progress.processed}</div>
                                        <div className="text-xs text-slate-500">Processed</div>
                                    </div>
                                    <div className="bg-slate-900 p-3 rounded">
                                        <div className="text-2xl font-bold text-green-400">{progress.processed}</div>
                                        <div className="text-xs text-slate-500">Deployed</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Live Logs */}
                <Card className="bg-slate-900 border-slate-800 shadow-inner h-[500px] overflow-hidden flex flex-col">
                    <div className="p-3 border-b border-slate-800 bg-slate-950">
                        <h3 className="text-xs font-mono text-green-500 uppercase">System Logs</h3>
                    </div>
                    <div className="flex-1 p-4 overflow-y-auto font-mono text-xs space-y-2">
                        {logs.map((log, i) => (
                            <div key={i} className="text-slate-400 border-l-2 border-slate-800 pl-2">
                                {log}
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
}
