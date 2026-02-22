import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDirectusClient, readItems, deleteItem, createItem } from '@/lib/directus/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Users, Plus, Search, Edit2, Trash2, Copy, Play,
    ChevronDown, ChevronRight, User, Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface Variant {
    id: string;
    avatar_key: string;
    identity: string; // was name
    variant_type: 'Male' | 'Female' | 'Neutral'; // was gender
    tone_modifiers: string; // was tone
    age_range?: string;
    descriptor?: string;
}

interface Avatar {
    id: string;
    slug: string;
    base_name: string;
}

export default function AvatarVariantsManager() {
    const queryClient = useQueryClient();
    const client = getDirectusClient();
    const [search, setSearch] = useState('');
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

    // 1. Fetch Data
    const { data: variantsRaw = [], isLoading: isLoadingVariants } = useQuery({
        queryKey: ['avatar_variants'],
        queryFn: async () => {
            // @ts-ignore
            return await client.request(readItems('avatar_variants', { limit: -1 }));
        }
    });

    const variants = variantsRaw as unknown as Variant[];

    const { data: avatarsRaw = [] } = useQuery({
        queryKey: ['avatar_intelligence'],
        queryFn: async () => {
            // @ts-ignore
            return await client.request(readItems('avatar_intelligence', { sort: ['base_name'], limit: -1 }));
        }
    });

    const avatars = avatarsRaw as unknown as Avatar[];

    // 2. Compute Stats
    const stats = {
        total: variants.length,
        male: variants.filter((v) => v.variant_type === 'Male').length,
        female: variants.filter((v) => v.variant_type === 'Female').length,
        neutral: variants.filter((v) => v.variant_type === 'Neutral').length
    };

    // 3. deletion
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            // @ts-ignore
            await client.request(deleteItem('avatar_variants', id));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['avatar_variants'] });
            toast.success('Variant deleted');
        },
        onError: (err: any) => toast.error(err.message)
    });

    // 4. Grouping Logic
    const groupedVariants = avatars.map((avatar) => {
        const avatarVariants = variants.filter((v) => v.avatar_key === avatar.slug);
        // Filter by search
        const filtered = avatarVariants.filter((v) =>
            (v.identity && v.identity.toLowerCase().includes(search.toLowerCase())) ||
            (v.tone_modifiers && v.tone_modifiers.toLowerCase().includes(search.toLowerCase()))
        );
        return {
            avatar,
            variants: filtered,
            count: avatarVariants.length
        };
    }).filter((group) => group.variants.length > 0 || search === ''); // Hide empty groups only if searching

    const toggleGroup = (slug: string) => {
        setExpandedGroups(prev => ({ ...prev, [slug]: !prev[slug] }));
    };

    // Helper for gender colors
    const getGenderColor = (gender: string) => {
        switch (gender) {
            case 'Male': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'Female': return 'bg-pink-500/10 text-pink-400 border-pink-500/20';
            default: return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
        }
    };

    if (isLoadingVariants) return <div className="text-zinc-400 p-8">Loading variants...</div>;

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardContent className="p-4 flex flex-col">
                        <span className="text-zinc-500 text-xs uppercase font-bold tracking-wider">Total Variants</span>
                        <div className="flex justify-between items-end mt-2">
                            <span className="text-3xl font-bold text-white">{stats.total}</span>
                            <Users className="h-5 w-5 text-zinc-600 mb-1" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardContent className="p-4 flex flex-col">
                        <span className="text-zinc-500 text-xs uppercase font-bold tracking-wider">Male</span>
                        <div className="flex justify-between items-end mt-2">
                            <span className="text-3xl font-bold text-blue-400">{stats.male}</span>
                            <User className="h-5 w-5 text-blue-500/50 mb-1" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardContent className="p-4 flex flex-col">
                        <span className="text-zinc-500 text-xs uppercase font-bold tracking-wider">Female</span>
                        <div className="flex justify-between items-end mt-2">
                            <span className="text-3xl font-bold text-pink-400">{stats.female}</span>
                            <User className="h-5 w-5 text-pink-500/50 mb-1" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardContent className="p-4 flex flex-col">
                        <span className="text-zinc-500 text-xs uppercase font-bold tracking-wider">Neutral</span>
                        <div className="flex justify-between items-end mt-2">
                            <span className="text-3xl font-bold text-purple-400">{stats.neutral}</span>
                            <User className="h-5 w-5 text-purple-500/50 mb-1" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-4 bg-zinc-900/50 p-4 rounded-lg border border-zinc-800 backdrop-blur-sm">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                    <Input
                        placeholder="Search variants by name or tone..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 bg-zinc-950 border-zinc-800 text-white focus:border-purple-500/50"
                    />
                </div>
                <div className="ml-auto">
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 border-0">
                        <Plus className="mr-2 h-4 w-4" /> New Variant
                    </Button>
                </div>
            </div>

            {/* Grouped List */}
            <div className="space-y-4">
                {groupedVariants.map((group: any) => {
                    const isExpanded = expandedGroups[group.avatar.slug] ?? true; // Default open

                    return (
                        <motion.div
                            key={group.avatar.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/40"
                        >
                            <div
                                className="flex items-center justify-between p-4 bg-zinc-900 cursor-pointer hover:bg-zinc-800/80 transition-colors"
                                onClick={() => toggleGroup(group.avatar.slug)}
                            >
                                <div className="flex items-center gap-3">
                                    {isExpanded ? <ChevronDown className="h-5 w-5 text-zinc-500" /> : <ChevronRight className="h-5 w-5 text-zinc-500" />}
                                    <h3 className="font-bold text-white text-lg">{group.avatar.base_name}</h3>
                                    <Badge variant="outline" className="bg-zinc-950 border-zinc-800 text-zinc-400">
                                        {group.variants.length} base
                                    </Badge>
                                </div>
                                <Button variant="ghost" size="sm" className="hidden opacity-0 group-hover:opacity-100">
                                    <Plus className="h-4 w-4 mr-2" /> Add Variant
                                </Button>
                            </div>

                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 border-t border-zinc-800/50">
                                            {group.variants.map((variant: Variant) => (
                                                <Card key={variant.id} className="bg-zinc-950 border-zinc-800/60 hover:border-purple-500/30 transition-all group">
                                                    <CardContent className="p-4 space-y-3">
                                                        <div className="flex justify-between items-start">
                                                            <h4 className="font-semibold text-white">{variant.identity}</h4>
                                                            <Badge variant="outline" className={getGenderColor(variant.variant_type)}>
                                                                {variant.variant_type}
                                                            </Badge>
                                                        </div>

                                                        <div className="text-sm text-zinc-400 min-h-[40px]">
                                                            <p><span className="text-zinc-600">Tone:</span> {variant.tone_modifiers}</p>
                                                            {variant.age_range && <p><span className="text-zinc-600">Age:</span> {variant.age_range}</p>}
                                                        </div>

                                                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-900 opacity-60 group-hover:opacity-100 transition-opacity">
                                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-green-500 hover:text-green-400 hover:bg-green-500/10" title="Test Preview">
                                                                <Play className="h-3.5 w-3.5" />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-blue-500 hover:text-blue-400 hover:bg-blue-500/10" title="Clone">
                                                                <Copy className="h-3.5 w-3.5" />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-400 hover:text-white hover:bg-zinc-800" title="Edit">
                                                                <Edit2 className="h-3.5 w-3.5" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-7 w-7 text-zinc-500 hover:text-red-500 hover:bg-red-500/10"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (confirm('Delete this variant?')) deleteMutation.mutate(variant.id);
                                                                }}
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}

                                            {group.variants.length === 0 && (
                                                <div className="col-span-full py-8 text-center text-zinc-600 bg-zinc-950/30 border border-dashed border-zinc-800 rounded-lg">
                                                    <p>No variants for this avatar yet.</p>
                                                    <Button variant="link" className="text-purple-400">Create one</Button>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}

                {groupedVariants.length === 0 && (
                    <div className="text-center py-12 text-zinc-500">
                        No avatars or variants found matching your search.
                    </div>
                )}
            </div>
        </div>
    );
}
