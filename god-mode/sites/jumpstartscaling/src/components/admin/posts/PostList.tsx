import React, { useState, useEffect } from 'react';
import { getDirectusClient, readItems } from '@/lib/directus/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'; // Need to implement Table? Or use grid.
// Assume Table isn't fully ready or use Grid for now to be safe.
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Posts as Post } from '@/lib/schemas';

export default function PostList() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const client = getDirectusClient();
                // @ts-ignore
                const data = await client.request(readItems('posts', { fields: ['*', 'site.name', 'author.name'], limit: 50 }));
                setPosts(data as unknown as Post[]);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        }
        load();
    }, []);

    if (loading) return <div>Loading...</div>;

    return (
        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
            <table className="w-full text-left text-sm text-slate-400">
                <thead className="bg-slate-900/50 text-slate-200 uppercase font-medium">
                    <tr>
                        <th className="px-6 py-3">Title</th>
                        <th className="px-6 py-3">Site</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">Date</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                    {posts.map(post => (
                        <tr key={post.id} className="hover:bg-slate-700/50 cursor-pointer transition-colors">
                            <td className="px-6 py-4">
                                <div className="font-medium text-slate-200">{post.title}</div>
                                <div className="text-xs text-slate-500">{post.slug}</div>
                            </td>
                            <td className="px-6 py-4">
                                {/* @ts-ignore */}
                                {post.site?.name || '-'}
                            </td>
                            <td className="px-6 py-4">
                                <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                                    {post.status}
                                </Badge>
                            </td>
                        </tr>
                    ))}
                    {posts.length === 0 && (
                        <tr>
                            <td colSpan={3} className="px-6 py-12 text-center text-slate-500">
                                No posts found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
