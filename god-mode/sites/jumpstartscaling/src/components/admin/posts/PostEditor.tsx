// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { getDirectusClient, readItem } from '@/lib/directus/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function PostEditor({ id }: { id: string }) {
    const [post, setPost] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            const client = getDirectusClient();
            try {
                const data = await client.request(readItem('posts', id));
                setPost(data);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        }
        if (id) load();
    }, [id]);

    if (loading) return <div>Loading...</div>;
    if (!post) return <div>Post not found</div>;

    return (
        <div className="space-y-6 max-w-4xl">
            <Card className="bg-slate-800 border-slate-700 p-6 space-y-4">
                <div className="space-y-2">
                    <Label>Post Title</Label>
                    <Input value={post.title} className="bg-slate-900 border-slate-700" />
                </div>
                <div className="space-y-2">
                    <Label>Slug</Label>
                    <Input value={post.slug} className="bg-slate-900 border-slate-700" />
                </div>
                <div className="space-y-2">
                    <Label>Content (Markdown/HTML)</Label>
                    <textarea className="w-full bg-slate-900 border-slate-700 rounded p-3 min-h-[300px]" value={post.content || ''}></textarea>
                </div>
                <Button className="mt-4">Save Changes</Button>
            </Card>
        </div>
    );
}
