import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDirectusClient, readItems, deleteItem, createItem, updateItem } from '@/lib/directus/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
    Search, Plus, Edit2, Trash2, Box, Braces, Play, Zap, Copy
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";

const client = getDirectusClient();

interface CartesianPattern {
    id: string;
    pattern_key: string;
    pattern_type: string;
    formula: string;
    example_output?: string;
    description?: string;
}

export default function CartesianManager() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [previewPattern, setPreviewPattern] = useState<CartesianPattern | null>(null);
    const [previewResult, setPreviewResult] = useState('');
    const [previewOpen, setPreviewOpen] = useState(false);
    const [editorOpen, setEditorOpen] = useState(false);
    const [editingPattern, setEditingPattern] = useState<Partial<CartesianPattern>>({});

    // 1. Fetch Data
    const { data: patternsRaw = [], isLoading } = useQuery({
        queryKey: ['cartesian_patterns'],
        queryFn: async () => {
            // @ts-ignore
            return await client.request(readItems('cartesian_patterns', { limit: -1 }));
        }
    });

    const patterns = patternsRaw as unknown as CartesianPattern[];

    // 2. Mutations
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            // @ts-ignore
            await client.request(deleteItem('cartesian_patterns', id));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cartesian_patterns'] });
            toast.success('Pattern deleted');
        }
    });

    // Create Mutation
    const createMutation = useMutation({
        mutationFn: async (newItem: Partial<CartesianPattern>) => {
            // @ts-ignore
            await client.request(createItem('cartesian_patterns', newItem));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cartesian_patterns'] });
            toast.success('Pattern created');
            setEditorOpen(false);
        }
    });

    // Update Mutation
    const updateMutation = useMutation({
        mutationFn: async (updates: Partial<CartesianPattern>) => {
            // @ts-ignore
            await client.request(updateItem('cartesian_patterns', updates.id!, updates));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cartesian_patterns'] });
            toast.success('Pattern updated');
            setEditorOpen(false);
        }
    });

    const handleSave = () => {
        if (!editingPattern.pattern_key || !editingPattern.formula) {
            toast.error('Key and Formula are required');
            return;
        }

        if (editingPattern.id) {
            updateMutation.mutate(editingPattern);
        } else {
            createMutation.mutate(editingPattern);
        }
    };

    const openEditor = (pattern?: CartesianPattern) => {
        setEditingPattern(pattern || { pattern_type: 'General' });
        setEditorOpen(true);
    };

    // 3. Stats
    const stats = {
        total: patterns.length,
        types: new Set(patterns.map(p => p.pattern_type)).size,
        avgLength: patterns.length > 0 ? Math.round(patterns.reduce((acc, p) => acc + (p.formula?.length || 0), 0) / patterns.length) : 0
    };

    // Fetch sample data for preview
    const { data: sampleGeo } = useQuery({
        queryKey: ['geo_sample'],
        queryFn: async () => {
            // @ts-ignore
            const res = await client.request(readItems('geo_intelligence', { limit: 1 }));
            return res[0];
        },
        staleTime: Infinity
    });

    const { data: spintaxDicts } = useQuery({
        queryKey: ['spintax_all'],
        queryFn: async () => {
            // @ts-ignore
            return await client.request(readItems('spintax_dictionaries', { limit: -1 }));
        },
        staleTime: Infinity
    });

    // 4. Test Logic (Dynamic)
    const generatePreview = (formula: string) => {
        let result = formula;

        // Replace Geo Variables
        if (sampleGeo) {
            const geo = sampleGeo as any;
            result = result
                .replace(/{city}/g, geo.city || 'Austin')
                .replace(/{state}/g, geo.state || 'TX')
                .replace(/{zip}/g, geo.zip_code || '78701')
                .replace(/{county}/g, geo.county || 'Travis');
        }

        // Replace Spintax Dictionaries {spintax_key}
        if (spintaxDicts && Array.isArray(spintaxDicts)) {
            // @ts-ignore
            spintaxDicts.forEach((dict: any) => {
                const key = dict.key || dict.base_word;
                if (key && dict.data && dict.data.length > 0) {
                    const regex = new RegExp(`{${key}}`, 'g');
                    const randomTerm = dict.data[Math.floor(Math.random() * dict.data.length)];
                    result = result.replace(regex, randomTerm);
                }
            });
        }

        // Handle inline spintax {A|B}
        result = result.replace(/{([^{}]+)\|([^{}]+)}/g, (match, p1, p2) => Math.random() > 0.5 ? p1 : p2);

        return result;
    };

    const handleTest = (pattern: CartesianPattern) => {
        setPreviewPattern(pattern);
        setPreviewResult(generatePreview(pattern.formula));
        setPreviewOpen(true);
    };

    // 5. Filter
    const filtered = patterns.filter(p =>
        (p.pattern_key && p.pattern_key.toLowerCase().includes(search.toLowerCase())) ||
        (p.formula && p.formula.toLowerCase().includes(search.toLowerCase())) ||
        (p.pattern_type && p.pattern_type.toLowerCase().includes(search.toLowerCase()))
    );

    if (isLoading) return <div className="p-8 text-zinc-500">Loading Patterns...</div>;

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-zinc-400 text-sm">Active Patterns</p>
                            <h3 className="text-2xl font-bold text-white">{stats.total}</h3>
                        </div>
                        <Box className="h-8 w-8 text-blue-500/50" />
                    </CardContent>
                </Card>
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-zinc-400 text-sm">Pattern Types</p>
                            <h3 className="text-2xl font-bold text-white">{stats.types}</h3>
                        </div>
                        <Braces className="h-8 w-8 text-purple-500/50" />
                    </CardContent>
                </Card>
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-zinc-400 text-sm">Avg Complexity</p>
                            <h3 className="text-2xl font-bold text-white">{stats.avgLength} chars</h3>
                        </div>
                        <Zap className="h-8 w-8 text-yellow-500/50" />
                    </CardContent>
                </Card>
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-4 bg-zinc-900/50 p-4 rounded-lg border border-zinc-800 backdrop-blur-sm">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                    <Input
                        placeholder="Search patterns..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 bg-zinc-950 border-zinc-800"
                    />
                </div>
                <Button
                    className="ml-auto bg-gradient-to-r from-purple-600 to-blue-600 border-0 hover:from-purple-500 hover:to-blue-500"
                    onClick={() => openEditor()}
                >
                    <Plus className="mr-2 h-4 w-4" /> New Pattern
                </Button>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filtered.map((pattern) => (
                    <motion.div
                        key={pattern.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Card className="bg-zinc-900 border-zinc-800 hover:border-purple-500/50 transition-colors group h-full flex flex-col">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 bg-zinc-950/30">
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="bg-zinc-950 border-zinc-800 text-zinc-400">
                                        {pattern.pattern_type || 'General'}
                                    </Badge>
                                    <span className="font-bold text-white">{pattern.pattern_key}</span>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-400 hover:text-white" onClick={() => handleTest(pattern)}>
                                        <Play className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-400 hover:text-white" onClick={() => openEditor(pattern)}>
                                        <Edit2 className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-zinc-400 hover:text-red-500"
                                        onClick={() => {
                                            if (confirm('Delete pattern?')) deleteMutation.mutate(pattern.id);
                                        }}
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 pt-4 flex-1 flex flex-col gap-3">
                                <div className="bg-zinc-950 p-3 rounded-md border border-zinc-800 font-mono text-sm text-green-400 break-words line-clamp-3">
                                    {pattern.formula}
                                </div>
                                {pattern.example_output && (
                                    <div className="text-xs text-zinc-500 mt-auto">
                                        <span className="text-zinc-600 uppercase font-bold text-[10px] tracking-wider">Example:</span>
                                        <p className="italic mt-1 line-clamp-2">{pattern.example_output}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Edit Modal */}
            <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
                <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>{editingPattern.id ? 'Edit Pattern' : 'New Pattern'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs uppercase text-zinc-500 font-bold">Key</label>
                                <Input
                                    value={editingPattern.pattern_key || ''}
                                    onChange={e => setEditingPattern({ ...editingPattern, pattern_key: e.target.value })}
                                    className="bg-zinc-950 border-zinc-800"
                                    placeholder="e.g. SEO_INTRO_1"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs uppercase text-zinc-500 font-bold">Type</label>
                                <Input
                                    value={editingPattern.pattern_type || ''}
                                    onChange={e => setEditingPattern({ ...editingPattern, pattern_type: e.target.value })}
                                    className="bg-zinc-950 border-zinc-800"
                                    placeholder="e.g. Intro"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase text-zinc-500 font-bold">Formula</label>
                            <Textarea
                                value={editingPattern.formula || ''}
                                onChange={e => setEditingPattern({ ...editingPattern, formula: e.target.value })}
                                className="bg-zinc-950 border-zinc-800 font-mono min-h-[150px]"
                                placeholder="Enter pattern formula... Use {variable} and {spintax|opts}"
                            />
                            <p className="text-xs text-zinc-500">Supported variables: <code>&#123;city&#125;</code>, <code>&#123;state&#125;</code>, <code>&#123;service&#125;</code></p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setEditorOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-500">Save Pattern</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Test Modal */}
            <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Pattern Test Lab</DialogTitle>
                        <DialogDescription>
                            Testing pattern: <code className="text-blue-400">{previewPattern?.pattern_key}</code>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-xs text-zinc-500 uppercase font-bold">Formula</label>
                            <div className="p-3 bg-zinc-950 rounded border border-zinc-800 font-mono text-sm text-zinc-300">
                                {previewPattern?.formula}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs text-zinc-500 uppercase font-bold">Generated Output (Preview)</label>
                            <div className="p-4 bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded border border-blue-500/20 text-white text-base leading-relaxed">
                                {previewResult}
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="secondary"
                            className="bg-zinc-800 hover:bg-zinc-700"
                            onClick={() => previewPattern && handleTest(previewPattern)}
                        >
                            <Zap className="mr-2 h-4 w-4" /> Re-Generate
                        </Button>
                        <Button
                            className="bg-blue-600 hover:bg-blue-500"
                            onClick={() => {
                                navigator.clipboard.writeText(previewResult);
                                toast.success('Copied to clipboard');
                            }}
                        >
                            <Copy className="mr-2 h-4 w-4" /> Copy Output
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
