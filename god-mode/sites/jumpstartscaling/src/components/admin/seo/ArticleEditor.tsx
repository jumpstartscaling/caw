// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { getDirectusClient, readItem, updateItem } from '@/lib/directus/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Simple rich text area placeholder
const TextArea = (props: any) => <textarea {...props} className="w-full min-h-[400px] p-4 bg-slate-900 border-slate-700 rounded-lg text-slate-300 font-mono text-sm leading-relaxed" />;

export default function ArticleEditor({ id }: { id: string }) {
    const [article, setArticle] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        async function load() {
            try {
                const client = getDirectusClient();
                const a = await client.request(readItem('generated_articles', id));
                setArticle(a);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        if (id) load();
    }, [id]);

    const handleSave = async () => {
        if (!article) return;
        setSaving(true);
        try {
            const client = getDirectusClient();
            await client.request(updateItem('generated_articles', id, {
                title: article.title,
                slug: article.slug,
                html_content: article.html_content,
                meta_desc: article.meta_desc,
                is_published: article.is_published
            }));
            alert("Article Saved!");
        } catch (e) {
            console.error(e);
            alert("Failed to save.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Loading article data...</div>;
    if (!article) return <div>Article not found</div>;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content Column */}
            <div className="lg:col-span-2 space-y-6">

                <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                        <CardTitle>Content Editor</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Title</Label>
                            <Input
                                value={article.title}
                                onChange={e => setArticle({ ...article, title: e.target.value })}
                                className="bg-slate-900 border-slate-700 font-bold text-lg"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>HTML Content</Label>
                            <TextArea
                                value={article.html_content || ''}
                                onChange={e => setArticle({ ...article, html_content: e.target.value })}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Sidebar Column */}
            <div className="space-y-6">

                {/* Status & Meta */}
                <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                        <CardTitle>Publishing</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center bg-slate-900 p-3 rounded">
                            <span className="text-sm text-slate-400">Status</span>
                            <Badge variant={article.is_published ? 'default' : 'secondary'}>
                                {article.is_published ? 'Published' : 'Draft'}
                            </Badge>
                        </div>

                        <div className="space-y-2">
                            <Label>Slug</Label>
                            <Input
                                value={article.slug}
                                onChange={e => setArticle({ ...article, slug: e.target.value })}
                                className="bg-slate-900 border-slate-700 text-xs font-mono"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Meta Description</Label>
                            <textarea
                                className="w-full text-xs p-2 bg-slate-900 border border-slate-700 rounded h-24"
                                value={article.meta_desc || ''}
                                onChange={e => setArticle({ ...article, meta_desc: e.target.value })}
                            />
                        </div>

                        <Button onClick={handleSave} disabled={saving} className="w-full bg-blue-600 hover:bg-blue-700">
                            {saving ? 'Saving...' : 'Update Article'}
                        </Button>
                    </CardContent>
                </Card>

                {/* Generation Metadata (ReadOnly) */}
                <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-sm text-slate-400">Generation Data</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-xs font-mono">
                        <div className="flex justify-between">
                            <span className="text-slate-500">Job ID</span>
                            <span className="text-slate-300">{article.job_id}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Created</span>
                            <span className="text-slate-300">{new Date(article.date_created).toLocaleDateString()}</span>
                        </div>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}
