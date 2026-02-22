import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function SettingsManager() {
    const [activeTab, setActiveTab] = useState('general');
    const [health, setHealth] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        checkHealth();
    }, []);

    const checkHealth = async () => {
        setLoading(true);
        try {
            const start = Date.now();
            const res = await fetch('/api/seo/stats');
            const latency = Date.now() - start;
            const data = await res.json();
            setHealth({
                api: res.ok,
                latency,
                version: '1.0.0',
                directus: data.success ? 'Connected' : 'Error',
                env: process.env.NODE_ENV || 'production'
            });
        } catch (e: any) {
            setHealth({ api: false, error: e.message });
        }
        setLoading(false);
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">System Settings</h1>

            {/* Tabs */}
            <div className="flex border-b border-slate-700 space-x-6">
                <button
                    onClick={() => setActiveTab('general')}
                    className={`pb-3 px-1 text-sm font-medium transition-colors ${activeTab === 'general' ? 'border-b-2 border-blue-500 text-blue-400' : 'text-slate-400 hover:text-slate-200'}`}
                >
                    General
                </button>
                <button
                    onClick={() => setActiveTab('health')}
                    className={`pb-3 px-1 text-sm font-medium transition-colors ${activeTab === 'health' ? 'border-b-2 border-blue-500 text-blue-400' : 'text-slate-400 hover:text-slate-200'}`}
                >
                    System Health
                </button>
            </div>

            {/* General Tab */}
            {activeTab === 'general' && (
                <div className="grid gap-6">
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader>
                            <CardTitle className="text-white">Admin Profile</CardTitle>
                            <CardDescription>Current session information</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-400">Role</label>
                                    <div className="p-2 bg-slate-950 border border-slate-800 rounded text-white">Administrator</div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-400">Access Level</label>
                                    <div className="p-2 bg-slate-950 border border-slate-800 rounded text-white">Full System Access</div>
                                </div>
                            </div>
                            <div className="pt-4">
                                <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800" onClick={() => window.open('https://spark.jumpstartscaling.com/admin/users', '_blank')}>
                                    Manage Users in Directus ↗
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader>
                            <CardTitle className="text-white">Configuration</CardTitle>
                            <CardDescription>Global system defaults</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm text-slate-400 mb-4">
                                Configuration for API limits, default SEO constraints, and other system-wide constants are managed via Environment Variables or the Directus Settings collection.
                            </div>
                            <Button className="bg-slate-800 hover:bg-slate-700 mx-2" onClick={() => window.open('https://spark.jumpstartscaling.com/admin/settings', '_blank')}>
                                Open Directus Settings ↗
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Health Tab */}
            {activeTab === 'health' && (
                <div className="grid gap-6">
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader>
                            <CardTitle className="text-white">System Diagnostics</CardTitle>
                            <div className="flex justify-between items-center">
                                <CardDescription>Real-time system status check</CardDescription>
                                <Button size="sm" onClick={checkHealth} disabled={loading}>
                                    {loading ? 'Checking...' : 'Refresh Status'}
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-slate-950 rounded border border-slate-800">
                                    <span className="text-slate-300">API Connectivity</span>
                                    {health?.api ? (
                                        <Badge className="bg-green-600">Online ({health.latency}ms)</Badge>
                                    ) : (
                                        <Badge variant="destructive">Offline</Badge>
                                    )}
                                </div>
                                <div className="flex items-center justify-between p-3 bg-slate-950 rounded border border-slate-800">
                                    <span className="text-slate-300">Directus Backend</span>
                                    <Badge className={health?.directus === 'Connected' ? 'bg-green-600' : 'bg-red-600'}>
                                        {health?.directus || 'Checking...'}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-slate-950 rounded border border-slate-800">
                                    <span className="text-slate-300">Frontend Version</span>
                                    <span className="text-white font-mono">{health?.version || '1.0.0'}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-slate-950 rounded border border-slate-800">
                                    <span className="text-slate-300">Environment</span>
                                    <span className="text-white font-mono uppercase">{health?.env || 'PRODUCTION'}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
