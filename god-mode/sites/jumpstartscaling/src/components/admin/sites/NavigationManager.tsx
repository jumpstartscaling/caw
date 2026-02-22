import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDirectusClient, readItems, createItem, updateItem, deleteItem } from '@/lib/directus/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Save, GripVertical } from 'lucide-react';
import { toast } from 'sonner';

const client = getDirectusClient();

interface NavItem {
    id: string;
    label: string;
    url: string;
    sort: number;
}

interface NavigationManagerProps {
    siteId: string;
}

export default function NavigationManager({ siteId }: NavigationManagerProps) {
    const queryClient = useQueryClient();
    const [newItem, setNewItem] = useState({ label: '', url: '' });

    const { data: items = [], isLoading } = useQuery({
        queryKey: ['navigation', siteId],
        queryFn: async () => {
            // @ts-ignore
            const res = await client.request(readItems('navigation', {
                filter: { site: { _eq: siteId } },
                sort: ['sort']
            }));
            return res as unknown as NavItem[];
        }
    });

    const createMutation = useMutation({
        mutationFn: async () => {
            // @ts-ignore
            await client.request(createItem('navigation', {
                ...newItem,
                site: siteId,
                sort: items.length + 1
            }));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['navigation', siteId] });
            setNewItem({ label: '', url: '' });
            toast.success('Menu item added');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            // @ts-ignore
            await client.request(deleteItem('navigation', id));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['navigation', siteId] });
            toast.success('Menu item deleted');
        }
    });

    const updateSortMutation = useMutation({
        mutationFn: async ({ id, sort }: { id: string, sort: number }) => {
            // @ts-ignore
            await client.request(updateItem('navigation', id, { sort }));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['navigation', siteId] });
        }
    });

    return (
        <div className="space-y-6 max-w-4xl">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
                <h3 className="text-white font-medium mb-4">Add Menu Item</h3>
                <div className="flex gap-4">
                    <Input
                        placeholder="Label (e.g. Home)"
                        value={newItem.label}
                        onChange={e => setNewItem({ ...newItem, label: e.target.value })}
                        className="bg-zinc-950 border-zinc-800"
                    />
                    <Input
                        placeholder="URL (e.g. /home)"
                        value={newItem.url}
                        onChange={e => setNewItem({ ...newItem, url: e.target.value })}
                        className="bg-zinc-950 border-zinc-800"
                    />
                    <Button onClick={() => createMutation.mutate()} disabled={!newItem.label} className="bg-blue-600 hover:bg-blue-500 whitespace-nowrap">
                        <Plus className="mr-2 h-4 w-4" /> Add Item
                    </Button>
                </div>
            </div>

            <div className="rounded-md border border-zinc-800 bg-zinc-900/50 overflow-hidden">
                <Table>
                    <TableHeader className="bg-zinc-950">
                        <TableRow className="border-zinc-800 hover:bg-zinc-950">
                            <TableHead className="w-[50px]"></TableHead>
                            <TableHead className="text-zinc-400">Label</TableHead>
                            <TableHead className="text-zinc-400">URL</TableHead>
                            <TableHead className="text-zinc-400 text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-zinc-500">
                                    No menu items. Add one above.
                                </TableCell>
                            </TableRow>
                        ) : (
                            items.map((item, index) => (
                                <TableRow key={item.id} className="border-zinc-800 hover:bg-zinc-900/50">
                                    <TableCell>
                                        <GripVertical className="h-4 w-4 text-zinc-600 cursor-grab" />
                                    </TableCell>
                                    <TableCell className="font-medium text-white">
                                        {item.label}
                                    </TableCell>
                                    <TableCell className="text-zinc-400 font-mono text-xs">
                                        {item.url}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-600 hover:text-red-500" onClick={() => deleteMutation.mutate(item.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
