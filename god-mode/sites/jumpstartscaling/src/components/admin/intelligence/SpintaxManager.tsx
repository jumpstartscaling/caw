import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDirectusClient, readItems, deleteItem, createItem, updateItem } from '@/lib/directus/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Search, Plus, Edit2, Trash2, Tag, Book, RefreshCw, Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const client = getDirectusClient();

interface SpintaxDictionary {
    id: string;
    key: string;
    base_word: string; // "name" in UI
    category: string;
    data: string[]; // "terms" in UI
}

export default function SpintaxManager() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [selectedDict, setSelectedDict] = useState<SpintaxDictionary | null>(null);
    const [testResult, setTestResult] = useState('');
    const [previewOpen, setPreviewOpen] = useState(false);

    // 1. Fetch Data
    const { data: dictionariesRaw = [], isLoading } = useQuery({
        queryKey: ['spintax_dictionaries'],
        queryFn: async () => {
            // @ts-ignore
            return await client.request(readItems('spintax_dictionaries', { limit: -1 }));
        }
    });

    const spintaxList = dictionariesRaw as unknown as SpintaxDictionary[];

    // 2. Mutations
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            // @ts-ignore
            await client.request(deleteItem('spintax_dictionaries', id));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['spintax_dictionaries'] });
            toast.success('Dictionary deleted');
        }
    });

    // 3. Stats
    const stats = {
        total: spintaxList.length,
        categories: new Set(spintaxList.map(d => d.category)).size,
        totalTerms: spintaxList.reduce((acc, d) => acc + (d.data?.length || 0), 0)
    };

    // 4. Test Logic
    const testSpintax = (dict: SpintaxDictionary) => {
        if (!dict.data || dict.data.length === 0) {
            setTestResult('No terms defined.');
            return;
        }
        const randomTerm = dict.data[Math.floor(Math.random() * dict.data.length)];
        setTestResult(randomTerm);
        setSelectedDict(dict);
        setPreviewOpen(true);
    };

    // 5. Filter
    const filtered = spintaxList.filter(d =>
        (d.base_word && d.base_word.toLowerCase().includes(search.toLowerCase())) ||
        (d.key && d.key.toLowerCase().includes(search.toLowerCase())) ||
        (d.category && d.category.toLowerCase().includes(search.toLowerCase()))
    );

    if (isLoading) return <div className="p-8 text-zinc-500">Loading Spintax Dictionaries...</div>;

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-zinc-400 text-sm">Dictionaries</p>
                            <h3 className="text-2xl font-bold text-white">{stats.total}</h3>
                        </div>
                        <Book className="h-8 w-8 text-blue-500/50" />
                    </CardContent>
                </Card>
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-zinc-400 text-sm">Categories</p>
                            <h3 className="text-2xl font-bold text-white">{stats.categories}</h3>
                        </div>
                        <Tag className="h-8 w-8 text-purple-500/50" />
                    </CardContent>
                </Card>
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-zinc-400 text-sm">Total Variations</p>
                            <h3 className="text-2xl font-bold text-white">{stats.totalTerms}</h3>
                        </div>
                        <RefreshCw className="h-8 w-8 text-green-500/50" />
                    </CardContent>
                </Card>
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-4 bg-zinc-900/50 p-4 rounded-lg border border-zinc-800 backdrop-blur-sm">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                    <Input
                        placeholder="Search dictionaries..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 bg-zinc-950 border-zinc-800"
                    />
                </div>
                <Button className="ml-auto bg-blue-600 hover:bg-blue-500">
                    <Plus className="mr-2 h-4 w-4" /> New Dictionary
                </Button>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((dict) => (
                    <motion.div
                        key={dict.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Card className="bg-zinc-900 border-zinc-800 hover:border-blue-500/50 transition-colors group h-full flex flex-col">
                            <CardHeader className="flex flex-row items-start justify-between pb-2">
                                <div>
                                    <Badge variant="outline" className="mb-2 bg-zinc-950 border-zinc-800 text-zinc-400">
                                        {dict.category || 'Uncategorized'}
                                    </Badge>
                                    <CardTitle className="text-lg font-bold text-white">{dict.base_word || 'Untitled'}</CardTitle>
                                    <code className="text-xs text-blue-400 bg-blue-900/20 px-1 py-0.5 rounded mt-1 inline-block">
                                        {`{${dict.key || dict.base_word}}`}
                                    </code>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1 flex flex-col">
                                <div className="space-y-2 flex-1">
                                    <div className="text-sm text-zinc-400 bg-zinc-950 rounded p-2 h-20 overflow-hidden relative">
                                        {dict.data?.slice(0, 5).join(', ')}
                                        {dict.data?.length > 5 && '...'}
                                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent opacity-50" />
                                    </div>
                                    <p className="text-xs text-right text-zinc-500">
                                        {dict.data?.length || 0} terms
                                    </p>
                                </div>
                                <div className="flex justify-end gap-2 pt-4 mt-auto opacity-60 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-green-500 hover:bg-green-500/10" onClick={() => testSpintax(dict)}>
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800">
                                        <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-zinc-500 hover:text-red-500 hover:bg-red-500/10"
                                        onClick={() => {
                                            if (confirm('Delete this dictionary?')) deleteMutation.mutate(dict.id);
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Preview Modal */}
            <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
                    <DialogHeader>
                        <DialogTitle>Spintax Preview: {selectedDict?.base_word}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="p-4 bg-zinc-950 rounded-lg border border-zinc-800 text-center">
                            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                {testResult}
                            </span>
                        </div>
                        <Button
                            className="w-full bg-zinc-800 hover:bg-zinc-700"
                            onClick={() => selectedDict && testSpintax(selectedDict)}
                        >
                            <RefreshCw className="mr-2 h-4 w-4" /> Spin Again
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
