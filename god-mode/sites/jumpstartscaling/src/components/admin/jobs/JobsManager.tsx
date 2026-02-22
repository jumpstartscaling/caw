import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDirectusClient, readItems, updateItem, deleteItem } from '@/lib/directus/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { RefreshCw, Trash2, StopCircle, Play, FileJson } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

const client = getDirectusClient();

interface Job {
    id: string;
    type: string;
    status: string;
    progress: number;
    priority: string;
    config: any;
    date_created: string;
}

export default function JobsManager() {
    const queryClient = useQueryClient();
    const [viewerOpen, setViewerOpen] = useState(false);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);

    // 1. Fetch with Polling
    const { data: jobs = [], isLoading, isRefetching } = useQuery({
        queryKey: ['generation_jobs'],
        queryFn: async () => {
            // @ts-ignore
            const res = await client.request(readItems('generation_jobs', { limit: 50, sort: ['-date_created'] }));
            return res as unknown as Job[];
        },
        refetchInterval: 5000 // Poll every 5 seconds
    });

    // 2. Mutations
    const updateMutation = useMutation({
        mutationFn: async ({ id, updates }: { id: string, updates: Partial<Job> }) => {
            // @ts-ignore
            await client.request(updateItem('generation_jobs', id, updates));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['generation_jobs'] });
            toast.success('Job updated');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            // @ts-ignore
            await client.request(deleteItem('generation_jobs', id));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['generation_jobs'] });
            toast.success('Job deleted');
        }
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'queued': return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
            case 'processing': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 animate-pulse';
            case 'completed': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'failed': return 'bg-red-500/10 text-red-500 border-red-500/20';
            default: return 'bg-zinc-500/10 text-zinc-500';
        }
    };

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-4 bg-zinc-900/50 p-4 rounded-lg border border-zinc-800 backdrop-blur-sm">
                <div>
                    <h3 className="text-white font-medium">Active Queue</h3>
                    <p className="text-xs text-zinc-500">Auto-refreshing every 5s</p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    className="border-zinc-800 text-zinc-400 hover:text-white"
                    onClick={() => queryClient.invalidateQueries({ queryKey: ['generation_jobs'] })}
                    disabled={isRefetching}
                >
                    <RefreshCw className={`mr-2 h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} /> Refresh
                </Button>
            </div>

            {/* Table */}
            <div className="rounded-md border border-zinc-800 bg-zinc-900/50 overflow-hidden">
                <Table>
                    <TableHeader className="bg-zinc-950">
                        <TableRow className="hover:bg-zinc-950 border-zinc-800">
                            <TableHead className="text-zinc-400">Type</TableHead>
                            <TableHead className="text-zinc-400 w-[150px]">Status</TableHead>
                            <TableHead className="text-zinc-400 w-[200px]">Progress</TableHead>
                            <TableHead className="text-zinc-400">Created</TableHead>
                            <TableHead className="text-zinc-400 text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {jobs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-zinc-500">
                                    No active jobs.
                                </TableCell>
                            </TableRow>
                        ) : (
                            jobs.map((job) => (
                                <TableRow key={job.id} className="border-zinc-800 hover:bg-zinc-900/50">
                                    <TableCell className="font-medium text-white font-mono text-xs uppercase tracking-wide">
                                        {job.type}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={getStatusColor(job.status)}>
                                            {job.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Progress value={job.progress || 0} className="h-2 bg-zinc-800" />
                                            <span className="text-xs text-zinc-500 w-8 text-right">{job.progress}%</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-zinc-400 text-xs">
                                        {formatDistanceToNow(new Date(job.date_created), { addSuffix: true })}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white" onClick={() => { setSelectedJob(job); setViewerOpen(true); }} title="View Config">
                                                <FileJson className="h-3.5 w-3.5" />
                                            </Button>

                                            {(job.status === 'failed' || job.status === 'completed') && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-blue-500 hover:text-blue-400"
                                                    onClick={() => updateMutation.mutate({ id: job.id, updates: { status: 'queued', progress: 0 } })}
                                                    title="Retry Job"
                                                >
                                                    <Play className="h-3.5 w-3.5" />
                                                </Button>
                                            )}

                                            {(job.status === 'processing' || job.status === 'queued') && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-yellow-600 hover:text-yellow-500"
                                                    onClick={() => updateMutation.mutate({ id: job.id, updates: { status: 'failed' } })}
                                                    title="Stop Job"
                                                >
                                                    <StopCircle className="h-3.5 w-3.5" />
                                                </Button>
                                            )}

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-zinc-600 hover:text-red-500"
                                                onClick={() => {
                                                    if (confirm('Delete job log?')) deleteMutation.mutate(job.id);
                                                }}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Config Viewer */}
            <Dialog open={viewerOpen} onOpenChange={setViewerOpen}>
                <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Job Configuration</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <div className="p-4 bg-zinc-950 rounded border border-zinc-800 font-mono text-xs overflow-auto max-h-[400px]">
                            <pre className="text-green-400">
                                {JSON.stringify(selectedJob?.config, null, 2)}
                            </pre>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
