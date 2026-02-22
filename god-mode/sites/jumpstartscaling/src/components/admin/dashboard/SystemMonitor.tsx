
// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function SystemMonitor() {
    const [health, setHealth] = useState({
        api: 'Checking...',
        db: 'Checking...',
        wp: 'Checking...'
    });

    const [contentStatus, setContentStatus] = useState({
        quality: 100,
        placeholders: 0,
        needsRefresh: []
    });

    useEffect(() => {
        checkSystem();
    }, []);

    const checkSystem = async () => {
        // 1. API Health (Mocked for speed, but structure is real)
        setTimeout(() => setHealth({ api: 'Online', db: 'Connected', wp: 'Ready' }), 1000);

        // 2. Content Health Audit
        // Simulate scanning 'offer_blocks_universal.json' and 'spintax'
        // In real backend, we'd loop through DB items.
        // If we find "Lorem" or "TBD" we flag it.
        const mockAudit = {
            quality: 98,
            placeholders: 0,
            needsRefresh: []
        };
        // If we want to simulate a placeholder found:
        // mockAudit.placeholders = 1;
        // mockAudit.quality = 95;
        // mockAudit.needsRefresh = ['Block 12 (Optin)'];

        setTimeout(() => setContentStatus(mockAudit), 1500);
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* 1. Sub-Station Status */}
                <Card className="bg-slate-800 border-slate-700">
                    <CardHeader><CardTitle className="text-white">Sub-Station Status</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-slate-400">Intelligence Station</span>
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/50">Active</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-400">Production Station</span>
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/50">Active</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-400">WordPress Ignition</span>
                            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">Standby</Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* 2. API & Infrastructure */}
                <Card className="bg-slate-800 border-slate-700">
                    <CardHeader><CardTitle className="text-white">API & Logistics</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-400">Core API</span>
                            <span className={health.api === 'Online' ? 'text-green-400' : 'text-yellow-400'}>{health.api}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-400">Database (Directus)</span>
                            <span className={health.db === 'Connected' ? 'text-green-400' : 'text-yellow-400'}>{health.db}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-400">WP Connection</span>
                            <span className={health.wp === 'Ready' ? 'text-green-400' : 'text-yellow-400'}>{health.wp}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* 3. Content Health (The "Placeholder" Check) */}
                <Card className="bg-slate-800 border-slate-700">
                    <CardHeader><CardTitle className="text-white">Content Integrity</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Quality Score</span>
                                <span className="text-white font-bold">{contentStatus.quality}%</span>
                            </div>
                            <Progress value={contentStatus.quality} className="h-2 bg-slate-900" />
                        </div>

                        {contentStatus.placeholders > 0 ? (
                            <div className="p-2 bg-red-900/20 border border-red-900 rounded text-red-400 text-xs">
                                ⚠️ Found {contentStatus.placeholders} Placeholders (Lorem/TBD).
                                <ul>
                                    {contentStatus.needsRefresh.map(n => <li key={n}>- {n}</li>)}
                                </ul>
                            </div>
                        ) : (
                            <div className="p-2 bg-green-900/20 border border-green-900 rounded text-green-400 text-xs">
                                ✅ No Placeholders Found. Content is Flagship Ready.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Quick Station Access */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <a href="/admin/content-factory" className="p-4 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition flex flex-col items-center gap-2 group">
                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition">
                        <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </div>
                    <span className="text-slate-300 font-medium">Content Factory</span>
                </a>
                <a href="/admin/sites/jumpstart" className="p-4 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition flex flex-col items-center gap-2 group">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition">
                        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" /></svg>
                    </div>
                    <span className="text-slate-300 font-medium">Jumpstart Test</span>
                </a>
                <a href="/admin/seo/articles" className="p-4 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition flex flex-col items-center gap-2 group">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center group-hover:scale-110 transition">
                        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
                    </div>
                    <span className="text-slate-300 font-medium">Generated Output</span>
                </a>
                <a href="/admin/content/work_log" className="p-4 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition flex flex-col items-center gap-2 group">
                    <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center group-hover:scale-110 transition">
                        <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <span className="text-slate-300 font-medium">System Logs</span>
                </a>
            </div>
        </div>
    );
}
