
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getDirectusClient, readItems } from '@/lib/directus/client';

export default function ProductionFloor() {
    const [jobs, setJobs] = useState<any[]>([]);

    const fetchJobs = async () => {
        const client = getDirectusClient();
        try {
            const res = await client.request(readItems('generation_jobs', {
                sort: ['-date_created'],
                limit: 10
            }));
            setJobs(res);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchJobs();
        const interval = setInterval(fetchJobs, 5000); // Poll every 5s
        return () => clearInterval(interval);
    }, []);

    const getProgress = (job: any) => {
        if (!job.target_quantity) return 0;
        return Math.round((job.current_offset / job.target_quantity) * 100);
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Active Job Queue</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Job ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Progress</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Target</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200 text-sm">
                                {jobs.map(job => (
                                    <tr key={job.id}>
                                        <td className="px-6 py-4 whitespace-nowrap font-mono text-xs">{job.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge variant={job.status === 'Processing' ? 'default' : 'secondary'}>
                                                {job.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap w-1/3">
                                            <div className="w-full bg-slate-200 rounded-full h-2.5">
                                                <div
                                                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                                                    style={{ width: `${getProgress(job)}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-xs text-slate-500 mt-1 block">{job.current_offset} / {job.target_quantity}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                                            {job.target_quantity}
                                        </td>
                                    </tr>
                                ))}
                                {jobs.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                                            No active jobs. Launch one from the pad!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Could add Recent Articles feed here */}
        </div>
    );
}
