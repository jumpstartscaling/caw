import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getDirectusClient, readItems, aggregate } from '@/lib/directus/client';
import type { DirectusSchema, GenerationJobs as GenerationJob, CampaignMasters as CampaignMaster, WorkLog } from '@/lib/schemas';

export default function ContentFactoryDashboard() {
    const [stats, setStats] = useState({ total: 0, published: 0, processing: 0 });
    const [jobs, setJobs] = useState<GenerationJob[]>([]);
    const [campaigns, setCampaigns] = useState<CampaignMaster[]>([]);
    const [logs, setLogs] = useState<WorkLog[]>([]);
    const [loading, setLoading] = useState(true);

    const DIRECTUS_ADMIN_URL = "https://spark.jumpstartscaling.com/admin";

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 5000); // Poll every 5s for "Factory" feel
        return () => clearInterval(interval);
    }, []);

    const loadData = async () => {
        try {
            const client = getDirectusClient();

            // 1. Fetch KPI Stats
            // Article Count
            const articleAgg = await client.request(aggregate('generated_articles', {
                aggregate: { count: '*' }
            }));
            const totalArticles = Number(articleAgg[0]?.count || 0);

            // Published Count
            const publishedAgg = await client.request(aggregate('generated_articles', {
                aggregate: { count: '*' },
                filter: { is_published: { _eq: true } }
            }));
            const totalPublished = Number(publishedAgg[0]?.count || 0);

            // Active Jobs Count
            const processingAgg = await client.request(aggregate('generation_jobs', {
                aggregate: { count: '*' },
                filter: { status: { _eq: 'Processing' } }
            }));
            const totalProcessing = Number(processingAgg[0]?.count || 0);

            setStats({
                total: totalArticles,
                published: totalPublished,
                processing: totalProcessing
            });

            // 2. Fetch Active Campaigns
            const activeCampaigns = await client.request(readItems('campaign_masters', {
                limit: 5,
                sort: ['-id'],
                filter: { status: { _in: ['active', 'paused'] } } // Both active and paused are valid
            }));
            setCampaigns(activeCampaigns as unknown as CampaignMaster[]);

            // 3. Fetch Production Jobs (The real "Factory" work)
            const recentJobs = await client.request(readItems('generation_jobs', {
                limit: 5,
                sort: ['-id']
            }));
            setJobs(recentJobs as unknown as GenerationJob[]);

            // 4. Fetch Work Log
            const recentLogs = await client.request(readItems('work_log', {
                limit: 20,
                sort: ['-date_created']
            }));
            setLogs(recentLogs as unknown as WorkLog[]);

            setLoading(false);
        } catch (error) {
            console.error("Dashboard Load Error:", error);
            setLoading(false);
        }
    };

    const StatusBadge = ({ status }: { status: string }) => {
        const colors: Record<string, string> = {
            active: 'bg-green-600',
            paused: 'bg-yellow-600',
            completed: 'bg-blue-600',
            draft: 'bg-slate-600',
            Pending: 'bg-slate-600',
            Processing: 'bg-blue-600',
            Complete: 'bg-green-600',
            Failed: 'bg-red-600'
        };
        return <Badge className={`${colors[status] || 'bg-slate-600'} text-white`}>{status}</Badge>;
    };

    if (loading) return <div className="text-white p-8 animate-pulse">Initializing Factory Command Center...</div>;

    return (
        <div className="space-y-8">
            {/* Header Actions */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-white">Tactical Command Center</h2>
                    <p className="text-slate-400">Shields (SEO Defense) & Weapons (Content Offense) Status</p>
                </div>
                <div className="flex gap-4">
                    <Button variant="outline" className="text-slate-200 border-slate-700 hover:bg-slate-800" onClick={() => window.open(`${DIRECTUS_ADMIN_URL}/content/posts`, '_blank')}>
                        Manage Arsenal (Posts)
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => window.open(`${DIRECTUS_ADMIN_URL}`, '_blank')}>
                        Open HQ (Directus) ↗
                    </Button>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Total Units (Articles)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats.total}</div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900 border-slate-800 border-l-4 border-l-purple-500">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Pending QA</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats.total - stats.published}</div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900 border-slate-800 border-l-4 border-l-green-500">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Deployed (Live)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats.published}</div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900 border-slate-800 border-l-4 border-l-blue-500">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Active Operations</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats.processing}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Active Campaigns */}
                <Card className="bg-slate-900 border-slate-800 lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-white flex justify-between">
                            <span>Active Campaigns</span>
                            <Button variant="ghost" size="sm" onClick={() => window.open(`${DIRECTUS_ADMIN_URL}/content/campaign_masters`, '_blank')}>View All</Button>
                        </CardTitle>
                        <CardDescription>Recent campaign activity and status</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow className="border-slate-800 hover:bg-slate-900/50">
                                    <TableHead className="text-slate-400">Campaign Name</TableHead>
                                    <TableHead className="text-slate-400">Mode</TableHead>
                                    <TableHead className="text-slate-400">Status</TableHead>
                                    <TableHead className="text-right text-slate-400">Target</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {campaigns.length > 0 ? campaigns.map((campaign) => (
                                    <TableRow key={campaign.id} className="border-slate-800 hover:bg-slate-800/50">
                                        <TableCell className="font-medium text-white">{campaign.name}</TableCell>
                                        <TableCell className="text-slate-400">{campaign.location_mode || 'Standard'}</TableCell>
                                        <TableCell><StatusBadge status={campaign.status} /></TableCell>
                                        <TableCell className="text-right text-slate-400">{campaign.batch_count || 0}</TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center text-slate-500 py-8">No active campaigns</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Production Queue */}
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-white">Production Jobs</CardTitle>
                        <CardDescription>Recent generation tasks</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {jobs.length > 0 ? jobs.map((job) => (
                                <div key={job.id} className="bg-slate-950 p-4 rounded border border-slate-800 flex justify-between items-center">
                                    <div>
                                        <div className="text-sm font-medium text-white mb-1">Job #{String(job.id)}</div>
                                        <div className="text-xs text-slate-500">
                                            {job.current_offset} / {job.target_quantity} articles
                                        </div>
                                    </div>
                                    <StatusBadge status={job.status} />
                                </div>
                            )) : (
                                <div className="text-center text-slate-500 py-8">Queue is empty</div>
                            )}
                            <Button className="w-full bg-slate-800 hover:bg-slate-700 text-white border border-slate-700" onClick={() => window.open('/admin/sites/jumpstart', '_blank')}>
                                + Start Refactor Job
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Work Log / Activity */}
            <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                    <CardTitle className="text-white">System Activity Log</CardTitle>
                    <CardDescription>Real-time backend operations</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="bg-black rounded-lg p-4 font-mono text-sm h-64 overflow-y-auto border border-slate-800">
                        {logs.length > 0 ? logs.map((log) => (
                            <div key={log.id} className="mb-2 border-b border-slate-900 pb-2 last:border-0">
                                <span className="text-slate-500">[{new Date(log.date_created || '').toLocaleTimeString()}]</span>{' '}
                                <span className={log.action === 'create' ? 'text-green-400' : 'text-blue-400'}>{(log.action || 'INFO').toUpperCase()}</span>{' '}
                                <span className="text-slate-300">{log.entity_type} #{log.entity_id}</span>{' '}
                                <span className="text-slate-600">- {typeof log.details === 'string' ? log.details.substring(0, 50) : JSON.stringify(log.details || '').substring(0, 50)}...</span>
                            </div>
                        )) : (
                            <div className="text-slate-600 text-center mt-8">No recent activity</div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
