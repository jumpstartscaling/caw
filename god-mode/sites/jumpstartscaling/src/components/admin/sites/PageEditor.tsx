import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDirectusClient, readItem, updateItem } from '@/lib/directus/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GripVertical, Plus, Trash2, LayoutTemplate, Type, Image as ImageIcon, Save, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const client = getDirectusClient();

interface PageBlock {
    id: string;
    block_type: 'hero' | 'content' | 'features' | 'cta';
    block_config: any;
}

interface Page {
    id: string;
    title: string;
    permalink: string;
    status: string;
    blocks: PageBlock[];
}

interface PageEditorProps {
    pageId: string;
    onBack?: () => void;
}

export default function PageEditor({ pageId, onBack }: PageEditorProps) {
    const queryClient = useQueryClient();
    const [blocks, setBlocks] = useState<PageBlock[]>([]);
    const [pageMeta, setPageMeta] = useState<Partial<Page>>({});

    const { isLoading } = useQuery({
        queryKey: ['page', pageId],
        queryFn: async () => {
            // @ts-ignore
            const res = await client.request(readItem('pages', pageId));
            const page = res as unknown as Page;
            setBlocks(page.blocks || []);
            setPageMeta({ title: page.title, permalink: page.permalink, status: page.status });
            return page;
        },
        enabled: !!pageId
    });

    const saveMutation = useMutation({
        mutationFn: async () => {
            // @ts-ignore
            await client.request(updateItem('pages', pageId, {
                ...pageMeta,
                blocks: blocks
            }));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['page', pageId] });
            toast.success('Page saved successfully');
        }
    });

    const addBlock = (block_type: PageBlock['block_type']) => {
        const newBlock: PageBlock = {
            id: crypto.randomUUID(),
            block_type,
            block_config: block_type === 'hero' ? { title: 'New Hero', subtitle: 'Subtitle here', bg: 'default' } :
                block_type === 'content' ? { content: '<p>Start writing...</p>' } :
                    block_type === 'features' ? { items: [{ title: 'Feature 1', desc: 'Description' }] } :
                        { label: 'Click Me', url: '#' }
        };
        setBlocks([...blocks, newBlock]);
    };

    const updateBlock = (id: string, config: any) => {
        setBlocks(blocks.map(b => b.id === id ? { ...b, block_config: { ...b.block_config, ...config } } : b));
    };

    const removeBlock = (id: string) => {
        setBlocks(blocks.filter(b => b.id !== id));
    };

    const moveBlock = (index: number, direction: 'up' | 'down') => {
        const newBlocks = [...blocks];
        if (direction === 'up' && index > 0) {
            [newBlocks[index - 1], newBlocks[index]] = [newBlocks[index], newBlocks[index - 1]];
        } else if (direction === 'down' && index < newBlocks.length - 1) {
            [newBlocks[index + 1], newBlocks[index]] = [newBlocks[index], newBlocks[index + 1]];
        }
        setBlocks(newBlocks);
    };

    if (isLoading) return <div className="p-8 text-center text-zinc-500">Loading editor...</div>;

    return (
        <div className="flex h-screen bg-zinc-950 text-white overflow-hidden">
            {/* Sidebar Controls */}
            <div className="w-80 border-r border-zinc-800 bg-zinc-900/50 flex flex-col">
                <div className="p-4 border-b border-zinc-800 flex items-center gap-2">
                    {onBack && <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-4 w-4" /></Button>}
                    <div>
                        <h2 className="font-bold text-sm">Page Editor</h2>
                        <Input
                            value={pageMeta.title || ''}
                            onChange={e => setPageMeta({ ...pageMeta, title: e.target.value })}
                            className="h-7 text-xs bg-transparent border-0 px-0 focus-visible:ring-0 placeholder:text-zinc-600"
                            placeholder="Page Title"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    <div>
                        <label className="text-xs uppercase font-bold text-zinc-500 mb-2 block">Add Blocks</label>
                        <div className="grid grid-cols-2 gap-2">
                            <Button variant="outline" className="justify-start border-zinc-800 hover:bg-zinc-800" onClick={() => addBlock('hero')}>
                                <LayoutTemplate className="mr-2 h-4 w-4 text-purple-400" /> Hero
                            </Button>
                            <Button variant="outline" className="justify-start border-zinc-800 hover:bg-zinc-800" onClick={() => addBlock('content')}>
                                <Type className="mr-2 h-4 w-4 text-blue-400" /> Content
                            </Button>
                            <Button variant="outline" className="justify-start border-zinc-800 hover:bg-zinc-800" onClick={() => addBlock('features')}>
                                <ImageIcon className="mr-2 h-4 w-4 text-green-400" /> Features
                            </Button>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs uppercase font-bold text-zinc-500 mb-2 block">Page Settings</label>
                        <div className="space-y-3">
                            <div className="space-y-1">
                                <label className="text-xs text-zinc-400">Permalink</label>
                                <Input
                                    value={pageMeta.permalink || ''}
                                    onChange={e => setPageMeta({ ...pageMeta, permalink: e.target.value })}
                                    className="bg-zinc-950 border-zinc-800 h-8"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-zinc-400">Status</label>
                                <select
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-sm h-8"
                                    value={pageMeta.status || 'draft'}
                                    onChange={e => setPageMeta({ ...pageMeta, status: e.target.value })}
                                >
                                    <option value="draft">Draft</option>
                                    <option value="published">Published</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-zinc-800">
                    <Button className="w-full bg-blue-600 hover:bg-blue-500" onClick={() => saveMutation.mutate()}>
                        <Save className="mr-2 h-4 w-4" /> Save Page
                    </Button>
                </div>
            </div>

            {/* Visual Canvas (Preview + Edit) */}
            <div className="flex-1 overflow-y-auto bg-zinc-950 p-8">
                <div className="max-w-4xl mx-auto space-y-4">
                    {blocks.map((block, index) => (
                        <Card key={block.id} className="bg-zinc-900 border-zinc-800 relative group transition-all hover:border-zinc-700">
                            {/* Block Actions */}
                            <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-zinc-900 border border-zinc-800 rounded-md p-1 shadow-xl z-20">
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveBlock(index, 'up')}><span className="sr-only">Up</span>↑</Button>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveBlock(index, 'down')}><span className="sr-only">Down</span>↓</Button>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => removeBlock(block.id)}><Trash2 className="h-3 w-3" /></Button>
                            </div>

                            <CardContent className="p-6">
                                {/* Type Label */}
                                <div className="absolute left-0 top-0 bg-zinc-800 text-zinc-500 text-[10px] uppercase font-bold px-2 py-1 rounded-br opacity-50">{block.block_type}</div>

                                {/* HERO EDITOR */}
                                {block.block_type === 'hero' && (
                                    <div className="text-center space-y-4 py-8">
                                        <Input
                                            value={block.block_config.title}
                                            onChange={e => updateBlock(block.id, { title: e.target.value })}
                                            className="text-4xl font-bold bg-transparent border-0 text-center placeholder:text-zinc-700 h-auto focus-visible:ring-0 p-0"
                                            placeholder="Hero Headline"
                                        />
                                        <Input
                                            value={block.block_config.subtitle}
                                            onChange={e => updateBlock(block.id, { subtitle: e.target.value })}
                                            className="text-xl text-zinc-400 bg-transparent border-0 text-center placeholder:text-zinc-700 h-auto focus-visible:ring-0 p-0"
                                            placeholder="Hero Subtitle"
                                        />
                                    </div>
                                )}

                                {/* CONTENT EDITOR */}
                                {block.block_type === 'content' && (
                                    <div className="space-y-2">
                                        <Textarea
                                            value={block.block_config.content}
                                            onChange={e => updateBlock(block.id, { content: e.target.value })}
                                            className="min-h-[150px] bg-zinc-950 border-zinc-800 font-serif text-lg leading-relaxed text-zinc-300"
                                            placeholder="Write your HTML content or markdown here..."
                                        />
                                    </div>
                                )}

                                {/* FEATURES EDITOR */}
                                {block.block_type === 'features' && (
                                    <div className="grid grid-cols-3 gap-4">
                                        {(block.block_config.items || []).map((item: any, i: number) => (
                                            <div key={i} className="p-4 rounded bg-zinc-950 border border-zinc-800 space-y-2">
                                                <Input
                                                    value={item.title}
                                                    onChange={e => {
                                                        const newItems = [...block.block_config.items];
                                                        newItems[i].title = e.target.value;
                                                        updateBlock(block.id, { items: newItems });
                                                    }}
                                                    className="font-bold bg-transparent border-0 p-0 h-auto focus-visible:ring-0"
                                                />
                                                <Textarea
                                                    value={item.desc}
                                                    onChange={e => {
                                                        const newItems = [...block.block_config.items];
                                                        newItems[i].desc = e.target.value;
                                                        updateBlock(block.id, { items: newItems });
                                                    }}
                                                    className="text-xs text-zinc-400 bg-transparent border-0 p-0 h-auto resize-none min-h-[40px] focus-visible:ring-0"
                                                />
                                            </div>
                                        ))}
                                        <Button variant="outline" className="h-full border-dashed border-zinc-800 text-zinc-600" onClick={() => {
                                            const newItems = [...(block.block_config.items || []), { title: 'New Feature', desc: 'Desc' }];
                                            updateBlock(block.id, { items: newItems });
                                        }}>
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}

                    {blocks.length === 0 && (
                        <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-zinc-800 rounded-lg text-zinc-600">
                            <LayoutTemplate className="h-12 w-12 mb-4 opacity-20" />
                            <p>Page is empty.</p>
                            <p className="text-sm">Use the sidebar to add blocks.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
