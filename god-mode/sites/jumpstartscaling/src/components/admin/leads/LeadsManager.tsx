import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDirectusClient, readItems, createItem, updateItem, deleteItem } from '@/lib/directus/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { Search, Plus, Trash2, Edit2, UserPlus, Mail, Building } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

const client = getDirectusClient();

interface Lead {
    id: string;
    name: string;
    email: string;
    company: string;
    niche: string;
    status: string;
    source: string;
    date_created: string;
}

export default function LeadsManager() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [editorOpen, setEditorOpen] = useState(false);
    const [editingLead, setEditingLead] = useState<Partial<Lead>>({});

    // 1. Fetch
    const { data: leads = [], isLoading } = useQuery({
        queryKey: ['leads'],
        queryFn: async () => {
            // @ts-ignore
            const res = await client.request(readItems('leads', { limit: -1, sort: ['-date_created'] }));
            return res as unknown as Lead[];
        }
    });

    // 2. Mutations
    const createMutation = useMutation({
        mutationFn: async (newItem: Partial<Lead>) => {
            // @ts-ignore
            await client.request(createItem('leads', newItem));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leads'] });
            toast.success('Lead added');
            setEditorOpen(false);
        }
    });

    const updateMutation = useMutation({
        mutationFn: async (updates: Partial<Lead>) => {
            // @ts-ignore
            await client.request(updateItem('leads', updates.id!, updates));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leads'] });
            toast.success('Lead updated');
            setEditorOpen(false);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            // @ts-ignore
            await client.request(deleteItem('leads', id));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leads'] });
            toast.success('Lead deleted');
        }
    });

    const handleSave = () => {
        if (!editingLead.name || !editingLead.email) {
            toast.error('Name and Email are required');
            return;
        }

        if (editingLead.id) {
            updateMutation.mutate(editingLead);
        } else {
            createMutation.mutate({ ...editingLead, status: editingLead.status || 'new', source: 'manual' });
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'new': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'contacted': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            case 'qualified': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
            case 'converted': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'rejected': return 'bg-red-500/10 text-red-500 border-red-500/20';
            default: return 'bg-zinc-500/10 text-zinc-500';
        }
    };

    const filtered = leads.filter(l =>
        l.name?.toLowerCase().includes(search.toLowerCase()) ||
        l.company?.toLowerCase().includes(search.toLowerCase()) ||
        l.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex items-center gap-4 bg-zinc-900/50 p-4 rounded-lg border border-zinc-800 backdrop-blur-sm">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                    <Input
                        placeholder="Search leads..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 bg-zinc-950 border-zinc-800"
                    />
                </div>
                <Button
                    className="ml-auto bg-blue-600 hover:bg-blue-500"
                    onClick={() => { setEditingLead({}); setEditorOpen(true); }}
                >
                    <UserPlus className="mr-2 h-4 w-4" /> Add Lead
                </Button>
            </div>

            {/* Table */}
            <div className="rounded-md border border-zinc-800 bg-zinc-900/50 overflow-hidden">
                <Table>
                    <TableHeader className="bg-zinc-950">
                        <TableRow className="hover:bg-zinc-950 border-zinc-800">
                            <TableHead className="text-zinc-400">Name</TableHead>
                            <TableHead className="text-zinc-400">Contact</TableHead>
                            <TableHead className="text-zinc-400">Company</TableHead>
                            <TableHead className="text-zinc-400">Status</TableHead>
                            <TableHead className="text-zinc-400 text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-zinc-500">
                                    No leads found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((lead) => (
                                <TableRow key={lead.id} className="border-zinc-800 hover:bg-zinc-900/50">
                                    <TableCell className="font-medium text-white">
                                        {lead.name}
                                        <div className="text-xs text-zinc-500">Added {formatDistanceToNow(new Date(lead.date_created), { addSuffix: true })}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center text-zinc-400">
                                            <Mail className="mr-2 h-3.5 w-3.5" />
                                            {lead.email}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center text-zinc-400">
                                            <Building className="mr-2 h-3.5 w-3.5" />
                                            {lead.company || '-'}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={getStatusColor(lead.status)}>
                                            {lead.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white" onClick={() => { setEditingLead(lead); setEditorOpen(true); }}>
                                                <Edit2 className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-zinc-400 hover:text-red-500"
                                                onClick={() => {
                                                    if (confirm('Delete lead?')) deleteMutation.mutate(lead.id);
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

            {/* Edit Modal */}
            <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
                <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingLead.id ? 'Edit Lead' : 'New Lead'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-xs uppercase text-zinc-500 font-bold">Full Name</label>
                            <Input
                                value={editingLead.name || ''}
                                onChange={e => setEditingLead({ ...editingLead, name: e.target.value })}
                                className="bg-zinc-950 border-zinc-800"
                                placeholder="John Doe"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase text-zinc-500 font-bold">Email Address</label>
                            <Input
                                value={editingLead.email || ''}
                                onChange={e => setEditingLead({ ...editingLead, email: e.target.value })}
                                className="bg-zinc-950 border-zinc-800"
                                placeholder="john@example.com"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs uppercase text-zinc-500 font-bold">Company</label>
                                <Input
                                    value={editingLead.company || ''}
                                    onChange={e => setEditingLead({ ...editingLead, company: e.target.value })}
                                    className="bg-zinc-950 border-zinc-800"
                                    placeholder="Acme Inc"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs uppercase text-zinc-500 font-bold">Status</label>
                                <select
                                    className="flex h-9 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 text-white"
                                    value={editingLead.status || 'new'}
                                    onChange={e => setEditingLead({ ...editingLead, status: e.target.value })}
                                >
                                    <option value="new">New</option>
                                    <option value="contacted">Contacted</option>
                                    <option value="qualified">Qualified</option>
                                    <option value="converted">Converted</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setEditorOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-500">Save Lead</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
