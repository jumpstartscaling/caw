import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDirectusClient, readItems, createItem, deleteItem } from '@/lib/directus/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { FileText, Plus, Trash2, Edit, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

const client = getDirectusClient();

interface Page {
    id: string;
    title: string;
    permalink: string;
    status: string;
    date_updated: string;
}

interface SitePagesManagerProps {
    siteId: string;
    siteDomain: string;
}

export default function SitePagesManager({ siteId, siteDomain }: SitePagesManagerProps) {
    const queryClient = useQueryClient();
    const [createOpen, setCreateOpen] = useState(false);
    const [newPageTitle, setNewPageTitle] = useState('');

    const { data: pages = [], isLoading } = useQuery({
        queryKey: ['pages', siteId],
        queryFn: async () => {
            // @ts-ignore
            const res = await client.request(readItems('pages', {
                filter: { site: { _eq: siteId } },
                sort: ['permalink']
            }));
            return res as unknown as Page[];
        }
    });

    const createMutation = useMutation({
        mutationFn: async () => {
            // @ts-ignore
            const res = await client.request(createItem('pages', {
                title: newPageTitle,
                site: siteId, // UUID usually
                permalink: `/${newPageTitle.toLowerCase().replace(/ /g, '-')}`,
                status: 'draft',
                blocks: []
            }));
            return res;
        },
        onSuccess: (data: any) => {
            queryClient.invalidateQueries({ queryKey: ['pages', siteId] });
            toast.success('Page created');
            setCreateOpen(false);
            setNewPageTitle('');
            // Redirect to editor
            window.location.href = `/admin/sites/editor/${data.id}`;
        },
        onError: (e: any) => {
            toast.error('Failed to create page: ' + e.message);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            // @ts-ignore
            await client.request(deleteItem('pages', id));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pages', siteId] });
            toast.success('Page deleted');
        }
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center px-1">
                <h3 className="text-lg font-medium text-white flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-400" /> Pages
                </h3>
                <Button onClick={() => setCreateOpen(true)} className="bg-blue-600 hover:bg-blue-500">
                    <Plus className="mr-2 h-4 w-4" /> New Page
                </Button>
            </div>

            <div className="rounded-md border border-zinc-800 bg-zinc-900/50 overflow-hidden">
                <Table>
                    <TableHeader className="bg-zinc-950">
                        <TableRow className="border-zinc-800 hover:bg-zinc-950">
                            <TableHead className="text-zinc-400">Title</TableHead>
                            <TableHead className="text-zinc-400">Permalink</TableHead>
                            <TableHead className="text-zinc-400">Status</TableHead>
                            <TableHead className="text-zinc-400 text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {pages.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-zinc-500">
                                    No pages yet.
                                </TableCell>
                            </TableRow>
                        ) : (
                            pages.map((page) => (
                                <TableRow key={page.id} className="border-zinc-800 hover:bg-zinc-900/50">
                                    <TableCell className="font-medium text-white">
                                        {page.title}
                                    </TableCell>
                                    <TableCell className="text-zinc-400 font-mono text-xs">
                                        {page.permalink}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={page.status === 'published' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-zinc-500/10 text-zinc-500'}>
                                            {page.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white" onClick={() => window.location.href = `/admin/sites/editor/${page.id}`}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-red-500" onClick={() => { if (confirm('Delete page?')) deleteMutation.mutate(page.id); }}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                            {page.status === 'published' && (
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-400 hover:text-blue-300" onClick={() => window.open(`https://${siteDomain}${page.permalink}`, '_blank')}>
                                                    <ExternalLink className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
                    <DialogHeader>
                        <DialogTitle>Create New Page</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <label className="text-xs uppercase font-bold text-zinc-500 mb-2 block">Page Title</label>
                        <Input
                            value={newPageTitle}
                            onChange={e => setNewPageTitle(e.target.value)}
                            placeholder="e.g. About Us"
                            className="bg-zinc-950 border-zinc-800"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
                        <Button onClick={() => createMutation.mutate()} disabled={!newPageTitle} className="bg-blue-600 hover:bg-blue-500">Create & Edit</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
