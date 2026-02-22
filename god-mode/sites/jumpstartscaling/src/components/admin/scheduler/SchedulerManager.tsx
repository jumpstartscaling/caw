import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDirectusClient, readItems, deleteItem, updateItem } from '@/lib/directus/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Plus, Play, Pause, Trash2, Calendar, LayoutGrid } from 'lucide-react';
import CampaignWizard from './CampaignWizard';
import { toast } from 'sonner';

const client = getDirectusClient();

interface Campaign {
    id: string;
    name: string;
    status: 'active' | 'paused' | 'completed';
    type: string;
    frequency: string;
    current_count: number;
    max_articles: number;
    next_run: string;
}

export default function SchedulerManager() {
    const queryClient = useQueryClient();
    const [wizardOpen, setWizardOpen] = useState(false);

    const { data: campaigns = [], isLoading } = useQuery({
        queryKey: ['campaigns'],
        queryFn: async () => {
            // @ts-ignore
            const res = await client.request(readItems('campaigns', { limit: 50, sort: ['-date_created'] }));
            return res as unknown as Campaign[];
        }
    });

    const toggleStatusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string, status: string }) => {
            const newStatus = status === 'active' ? 'paused' : 'active';
            // @ts-ignore
            await client.request(updateItem('campaigns', id, { status: newStatus }));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['campaigns'] });
            toast.success('Campaign status updated');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            // @ts-ignore
            await client.request(deleteItem('campaigns', id));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['campaigns'] });
            toast.success('Campaign deleted');
        }
    });

    const getProgress = (c: Campaign) => {
        if (!c.max_articles) return 0;
        return Math.min(100, Math.round((c.current_count / c.max_articles) * 100));
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center bg-zinc-900/50 p-6 rounded-lg border border-zinc-800 backdrop-blur-sm">
                <div>
                    <h2 className="text-xl font-bold text-white">Campaign Scheduler</h2>
                    <p className="text-zinc-400 text-sm">Manage bulk generation and automated workflows.</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-500" onClick={() => setWizardOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> New Campaign
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {campaigns.map(campaign => (
                    <Card key={campaign.id} className="bg-zinc-900 border-zinc-800 transition-colors hover:border-zinc-700 group">
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                                <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'} className={campaign.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-zinc-700/50 text-zinc-400'}>
                                    {campaign.status}
                                </Badge>
                                <span className="text-xs text-zinc-500 font-mono flex items-center">
                                    <Calendar className="h-3 w-3 mr-1" /> {campaign.frequency}
                                </span>
                            </div>
                            <CardTitle className="text-lg font-bold text-white mt-2 truncate mb-1">
                                {campaign.name}
                            </CardTitle>
                            <div className="flex items-center text-xs text-zinc-400">
                                <LayoutGrid className="h-3 w-3 mr-1" /> {campaign.type}
                            </div>
                        </CardHeader>
                        <CardContent className="pb-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs text-zinc-400">
                                    <span>Progress</span>
                                    <span>{campaign.current_count} / {campaign.max_articles}</span>
                                </div>
                                <Progress value={getProgress(campaign)} className="h-2 bg-zinc-800" />
                            </div>
                        </CardContent>
                        <CardFooter className="pt-2 border-t border-zinc-800 flex justify-end gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                className={`h-8 w-8 ${campaign.status === 'active' ? 'text-yellow-500 hover:text-yellow-400' : 'text-green-500 hover:text-green-400'}`}
                                onClick={() => toggleStatusMutation.mutate({ id: campaign.id, status: campaign.status })}
                            >
                                {campaign.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 text-zinc-500 hover:text-red-500" onClick={() => { if (confirm('Delete campaign?')) deleteMutation.mutate(campaign.id); }}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </CardFooter>
                    </Card>
                ))}

                {campaigns.length === 0 && (
                    <div className="col-span-full h-64 flex flex-col items-center justify-center border-2 border-dashed border-zinc-800 rounded-lg text-zinc-500">
                        <Calendar className="h-10 w-10 mb-4 opacity-20" />
                        <p>No active campaigns.</p>
                        <Button variant="link" onClick={() => setWizardOpen(true)}>Create your first automated campaign</Button>
                    </div>
                )}
            </div>

            <Dialog open={wizardOpen} onOpenChange={setWizardOpen}>
                <DialogContent className="max-w-3xl bg-zinc-950 border-zinc-800 p-0 overflow-hidden">
                    <div className="p-8 bg-zinc-900 border-b border-zinc-800">
                        <h2 className="text-xl font-bold text-white">Campaign Wizard</h2>
                        <p className="text-zinc-400">Setup your bulk automation in 4 steps.</p>
                    </div>
                    <div className="p-8 max-h-[70vh] overflow-y-auto">
                        <CampaignWizard
                            onComplete={() => setWizardOpen(false)}
                            onCancel={() => setWizardOpen(false)}
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
