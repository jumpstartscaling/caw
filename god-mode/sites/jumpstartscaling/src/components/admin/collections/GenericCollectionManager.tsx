import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDirectusClient, readItems, createItem, updateItem, deleteItem } from '@/lib/directus/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Trash2, Edit, Search } from 'lucide-react';
import { toast } from 'sonner';

const client = getDirectusClient();

interface FieldConfig {
    key: string;
    label: string;
    type: 'text' | 'textarea' | 'number' | 'json';
}

interface GenericManagerProps {
    collection: string;
    title: string;
    fields: FieldConfig[];
    displayField: string;
}

export default function GenericCollectionManager({ collection, title, fields, displayField }: GenericManagerProps) {
    const queryClient = useQueryClient();
    const [editorOpen, setEditorOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingItem, setEditingItem] = useState<any>({});

    const { data: items = [], isLoading } = useQuery({
        queryKey: [collection],
        queryFn: async () => {
            // @ts-ignore
            const res = await client.request(readItems(collection, {
                limit: 100,
                sort: ['-date_created']
            }));
            return res as any[];
        }
    });

    const mutation = useMutation({
        mutationFn: async (item: any) => {
            if (item.id) {
                // @ts-ignore
                await client.request(updateItem(collection, item.id, item));
            } else {
                // @ts-ignore
                await client.request(createItem(collection, item));
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [collection] });
            toast.success('Item saved');
            setEditorOpen(false);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            // @ts-ignore
            await client.request(deleteItem(collection, id));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [collection] });
            toast.success('Item deleted');
        }
    });

    const filteredItems = items.filter(item =>
        (item[displayField] || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-zinc-900/50 p-6 rounded-lg border border-zinc-800 backdrop-blur-sm">
                <div>
                    <h2 className="text-xl font-bold text-white">{title}</h2>
                    <p className="text-zinc-400 text-sm">Manage {title.toLowerCase()} inventory.</p>
                </div>
                <div className="flex gap-4">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
                        <Input
                            className="pl-9 bg-zinc-950 border-zinc-800 w-[200px]"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button className="bg-blue-600 hover:bg-blue-500" onClick={() => { setEditingItem({}); setEditorOpen(true); }}>
                        <Plus className="mr-2 h-4 w-4" /> Add New
                    </Button>
                </div>
            </div>

            <div className="rounded-md border border-zinc-800 bg-zinc-900/50 overflow-hidden">
                <Table>
                    <TableHeader className="bg-zinc-950">
                        <TableRow className="border-zinc-800 hover:bg-zinc-950">
                            {fields.slice(0, 3).map(f => <TableHead key={f.key} className="text-zinc-400">{f.label}</TableHead>)}
                            <TableHead className="text-zinc-400 text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredItems.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={fields.length + 1} className="h-24 text-center text-zinc-500">
                                    No items found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredItems.map((item) => (
                                <TableRow key={item.id} className="border-zinc-800 hover:bg-zinc-900/50">
                                    {fields.slice(0, 3).map(f => (
                                        <TableCell key={f.key} className="text-zinc-300">
                                            {typeof item[f.key] === 'object' ? JSON.stringify(item[f.key]).slice(0, 50) : item[f.key]}
                                        </TableCell>
                                    ))}
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white" onClick={() => { setEditingItem(item); setEditorOpen(true); }}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-red-500" onClick={() => { if (confirm('Delete item?')) deleteMutation.mutate(item.id); }}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
                <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>{editingItem.id ? 'Edit Item' : 'New Item'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                        {fields.map(f => (
                            <div key={f.key} className="space-y-2">
                                <label className="text-xs uppercase font-bold text-zinc-500">{f.label}</label>
                                {f.type === 'textarea' ? (
                                    <Textarea
                                        value={editingItem[f.key] || ''}
                                        onChange={e => setEditingItem({ ...editingItem, [f.key]: e.target.value })}
                                        className="bg-zinc-950 border-zinc-800 min-h-[100px]"
                                    />
                                ) : f.type === 'json' ? (
                                    <Textarea
                                        value={typeof editingItem[f.key] === 'object' ? JSON.stringify(editingItem[f.key], null, 2) : editingItem[f.key]}
                                        onChange={e => {
                                            try {
                                                const val = JSON.parse(e.target.value);
                                                setEditingItem({ ...editingItem, [f.key]: val });
                                            } catch (err) {
                                                // allow typing invalid json, validate on save or blur? logic simplifies to raw text for now if managed manually, but directus client handles object.
                                                // Simplifying: basic handling
                                            }
                                        }}
                                        className="bg-zinc-950 border-zinc-800 font-mono text-xs"
                                        placeholder="{}"
                                    />
                                ) : (
                                    <Input
                                        type={f.type}
                                        value={editingItem[f.key] || ''}
                                        onChange={e => setEditingItem({ ...editingItem, [f.key]: e.target.value })}
                                        className="bg-zinc-950 border-zinc-800"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setEditorOpen(false)}>Cancel</Button>
                        <Button onClick={() => mutation.mutate(editingItem)} className="bg-blue-600 hover:bg-blue-500">Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
