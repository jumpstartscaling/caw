import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDirectusClient, readItems, createItem, updateItem, deleteItem } from '@/lib/directus/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Search, Edit2, Trash2, Zap, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface Avatar {
    id: string;
    slug: string;
    base_name: string;
    wealth_cluster: string;
    tech_stack: string[];
    identity_male: string;
    identity_female?: string;
    identity_neutral?: string;
    pain_points?: string[];
    goals?: string[];
}

export default function AvatarIntelligenceManager() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const client = getDirectusClient();

    // 1. Fetch Avatars
    const { data: avatars = [], isLoading } = useQuery({
        queryKey: ['avatar_intelligence'],
        queryFn: async () => {
            // @ts-ignore
            return await client.request(readItems('avatar_intelligence', {
                sort: ['base_name'],
                limit: 100
            }));
        }
    });

    // 2. Fetch Avatar Variants (for stats)
    const { data: variants = [] } = useQuery({
        queryKey: ['avatar_variants'],
        queryFn: async () => {
            // @ts-ignore
            return await client.request(readItems('avatar_variants', {
                limit: -1
            }));
        }
    });

    // 3. Calculate Stats
    const getVariantCount = (avatarSlug: string) => {
        return variants.filter((v: any) => v.avatar_key === avatarSlug).length;
    };

    // 4. Filter Logic
    const filteredAvatars = avatars.filter((a: Avatar) =>
        a.base_name?.toLowerCase().includes(search.toLowerCase()) ||
        a.slug?.toLowerCase().includes(search.toLowerCase()) ||
        a.wealth_cluster?.toLowerCase().includes(search.toLowerCase())
    );

    // 5. Delete Mutation
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            // @ts-ignore
            await client.request(deleteItem('avatar_intelligence', id));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['avatar_intelligence'] });
            toast.success('Avatar deleted successfully');
        },
        onError: (error: any) => {
            toast.error(`Failed to delete: ${error.message}`);
        }
    });

    const handleDelete = (id: string, name: string) => {
        if (confirm(`Delete avatar "${name}"? This will also delete all variants.`)) {
            deleteMutation.mutate(id);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-zinc-400 text-sm">Total Avatars</p>
                                <h3 className="text-2xl font-bold text-white">{avatars.length}</h3>
                            </div>
                            <Users className="h-8 w-8 text-blue-500 opacity-50" />
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                >
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-zinc-400 text-sm">Total Variants</p>
                                <h3 className="text-2xl font-bold text-white">{variants.length}</h3>
                            </div>
                            <Zap className="h-8 w-8 text-yellow-500 opacity-50" />
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                >
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-zinc-400 text-sm">Avg Variants/Avatar</p>
                                <h3 className="text-2xl font-bold text-white">
                                    {avatars.length > 0 ? Math.round(variants.length / avatars.length) : 0}
                                </h3>
                            </div>
                            <TrendingUp className="h-8 w-8 text-green-500 opacity-50" />
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                >
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-zinc-400 text-sm">Wealth Clusters</p>
                                <h3 className="text-2xl font-bold text-white">
                                    {new Set(avatars.map((a: Avatar) => a.wealth_cluster)).size}
                                </h3>
                            </div>
                            <Users className="h-8 w-8 text-purple-500 opacity-50" />
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Toolbar */}
            <div className="flex justify-between items-center gap-4 bg-zinc-900/50 p-4 rounded-lg border border-zinc-800">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                    <Input
                        placeholder="Search avatars by name, slug, or wealth cluster..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 bg-zinc-950 border-zinc-800 text-white"
                    />
                </div>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500">
                    <Plus className="mr-2 h-4 w-4" /> New Avatar
                </Button>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAvatars.map((avatar: Avatar, index: number) => (
                    <motion.div
                        key={avatar.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                        <Card className="bg-zinc-900 border-zinc-800 hover:border-purple-500/50 transition-all group">
                            <CardHeader className="flex flex-row items-start justify-between pb-2">
                                <div className="flex-1">
                                    <CardTitle className="text-lg font-bold text-white">{avatar.base_name}</CardTitle>
                                    <code className="text-xs text-zinc-500 bg-zinc-950 px-2 py-1 rounded mt-1 inline-block">
                                        {avatar.slug}
                                    </code>
                                    <div className="mt-2">
                                        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                                            {avatar.wealth_cluster}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-zinc-400 hover:text-red-500 hover:bg-red-500/10"
                                        onClick={() => handleDelete(avatar.id, avatar.base_name)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {/* Tech Stack */}
                                    {avatar.tech_stack && avatar.tech_stack.length > 0 && (
                                        <div>
                                            <p className="text-xs text-zinc-500 mb-2">Tech Stack</p>
                                            <div className="flex flex-wrap gap-2">
                                                {avatar.tech_stack.slice(0, 3).map((tech: string) => (
                                                    <Badge key={tech} variant="secondary" className="bg-zinc-800 text-zinc-300">
                                                        {tech}
                                                    </Badge>
                                                ))}
                                                {avatar.tech_stack.length > 3 && (
                                                    <Badge variant="outline" className="text-zinc-500 border-zinc-800">
                                                        +{avatar.tech_stack.length - 3}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Identity */}
                                    <div>
                                        <p className="text-xs text-zinc-500 mb-1">Primary Identity</p>
                                        <p className="text-sm text-zinc-300">{avatar.identity_male || 'Not set'}</p>
                                    </div>

                                    {/* Variants Count */}
                                    <div className="pt-4 border-t border-zinc-800 flex justify-between items-center">
                                        <div className="text-xs text-zinc-500">
                                            <span className="text-lg font-bold text-white">{getVariantCount(avatar.slug)}</span> variants
                                        </div>
                                        <Button
                                            size="sm"
                                            className="bg-purple-600 hover:bg-purple-500 text-xs"
                                        >
                                            <Zap className="h-3 w-3 mr-1" />
                                            Generate Variants
                                        </Button>
                                    </div>

                                    {/* Send to Engine */}
                                    <Button
                                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500"
                                        size="sm"
                                    >
                                        🏭 Send to Engine
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Empty State */}
            {filteredAvatars.length === 0 && (
                <div className="text-center py-12">
                    <Users className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-zinc-400 mb-2">No avatars found</h3>
                    <p className="text-zinc-600 mb-4">
                        {search ? 'Try a different search term' : 'Create your first avatar to get started'}
                    </p>
                    {!search && (
                        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500">
                            <Plus className="mr-2 h-4 w-4" /> Create Avatar
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}
