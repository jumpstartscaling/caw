import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDirectusClient, readItems, createItem, updateItem, deleteItem } from '@/lib/directus/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger
} from '@/components/ui/dialog';
import { Globe, Plus, Settings, Trash2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

const client = getDirectusClient();

interface Site {
    id: string;
    name: string;
    url: string;
    status: 'active' | 'inactive';
    settings?: any;
}

export default function SitesManager() {
    const queryClient = useQueryClient();
    const [editorOpen, setEditorOpen] = useState(false);
    const [editingSite, setEditingSite] = useState<Partial<Site>>({});

    // Fetch
    const { data: sites = [], isLoading } = useQuery({
        queryKey: ['sites'],
        queryFn: async () => {
            // @ts-ignore
            const res = await client.request(readItems('sites', { limit: -1 }));
            return res as unknown as Site[];
        }
    });

    // Mutations
    const mutation = useMutation({
        mutationFn: async (site: Partial<Site>) => {
            if (site.id) {
                // @ts-ignore
                await client.request(updateItem('sites', site.id, site));
            } else {
                // @ts-ignore
                await client.request(createItem('sites', site));
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sites'] });
            toast.success(editingSite.id ? 'Site updated' : 'Site created');
            setEditorOpen(false);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            // @ts-ignore
            await client.request(deleteItem('sites', id));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sites'] });
            toast.success('Site deleted');
        }
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-zinc-900/50 p-6 rounded-lg border border-zinc-800 backdrop-blur-sm">
                <div>
                    <h2 className="text-xl font-bold text-white">Your Sites</h2>
                    <p className="text-zinc-400 text-sm">Manage your deployed web properties.</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-500" onClick={() => { setEditingSite({}); setEditorOpen(true); }}>
                    <Plus className="mr-2 h-4 w-4" /> Add Site
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sites.map((site) => (
                    <Card key={site.id} className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors group">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-200">
                                {site.name}
                            </CardTitle>
                            <Badge variant={site.status === 'active' ? 'default' : 'secondary'} className={site.status === 'active' ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' : ''}>
                                {site.status || 'inactive'}
                            </Badge>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold truncate text-white tracking-tight">{site.url}</div>
                            <p className="text-xs text-zinc-500 mt-1 flex items-center">
                                <Globe className="h-3 w-3 mr-1" />
                                deployed via Launchpad
                            </p>
                        </CardContent>
                        <CardFooter className="flex justify-between border-t border-zinc-800 pt-4">
                            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white" onClick={() => window.open(`https://${site.url}`, '_blank')}>
                                <ExternalLink className="h-4 w-4 mr-2" /> Visit
                            </Button>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-zinc-300" onClick={() => window.location.href = `/admin/sites/${site.id}`}>
                                    Manage Content
                                </Button>
                                <Button variant="outline" size="sm" className="bg-purple-900/30 border-purple-700 hover:bg-purple-800/40 text-purple-300" onClick={() => window.open(`/preview/site/${site.id}`, '_blank')}>
                                    👁️ Preview
                                </Button>
                            </div>
                            <div className="flex gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white" onClick={() => { setEditingSite(site); setEditorOpen(true); }}>
                                    <Settings className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-red-500" onClick={() => { if (confirm('Delete site?')) deleteMutation.mutate(site.id); }}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardFooter>
                    </Card>
                ))}

                {sites.length === 0 && (
                    <div className="col-span-full h-64 flex flex-col items-center justify-center border-2 border-dashed border-zinc-800 rounded-lg text-zinc-500">
                        <Globe className="h-10 w-10 mb-4 opacity-20" />
                        <p>No sites configured yet.</p>
                        <Button variant="link" onClick={() => { setEditingSite({}); setEditorOpen(true); }}>Create your first site</Button>
                    </div>
                )}
            </div>

            <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
                <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
                    <DialogHeader>
                        <DialogTitle>{editingSite.id ? 'Edit Site' : 'New Site'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-xs uppercase font-bold text-zinc-500">Site Name</label>
                            <Input
                                value={editingSite.name || ''}
                                onChange={e => setEditingSite({ ...editingSite, name: e.target.value })}
                                placeholder="My Awesome Blog"
                                className="bg-zinc-950 border-zinc-800"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase font-bold text-zinc-500">Domain</label>
                            <div className="flex">
                                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-zinc-800 bg-zinc-900 text-zinc-500 text-sm">https://</span>
                                <Input
                                    value={editingSite.url || ''}
                                    onChange={e => setEditingSite({ ...editingSite, url: e.target.value })}
                                    placeholder="example.com"
                                    className="rounded-l-none bg-zinc-950 border-zinc-800"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase font-bold text-zinc-500">Status</label>
                            <select
                                className="flex h-9 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-1 text-sm shadow-sm transition-colors text-white"
                                value={editingSite.status || 'active'}
                                onChange={e => setEditingSite({ ...editingSite, status: e.target.value as any })}
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setEditorOpen(false)}>Cancel</Button>
                        <Button onClick={() => mutation.mutate(editingSite)} className="bg-blue-600 hover:bg-blue-500">Save Site</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
