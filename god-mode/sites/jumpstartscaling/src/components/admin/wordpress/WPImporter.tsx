// @ts-nocheck
import React, { useState } from 'react';
import { WordPressClient, type WPPost } from '@/lib/wordpress/WordPressClient';
import { getDirectusClient, createItem } from '@/lib/directus/client'; // Import Directus helper
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

export default function WPImporter() {
    const [url, setUrl] = useState('');
    const [connected, setConnected] = useState(false);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');
    const [items, setItems] = useState<WPPost[]>([]);
    const [selection, setSelection] = useState<Set<number>>(new Set());

    const connect = async () => {
        setLoading(true);
        setStatus('Scanning site...');
        try {
            const wp = new WordPressClient(url);
            const isAlive = await wp.testConnection();
            if (isAlive) {
                const pages = await wp.getPages();
                const posts = await wp.getPosts();
                setItems([...pages, ...posts].map(i => ({...i, id: i.id}))); // Ensure ID
                setConnected(true);
            } else {
                alert("Could not connect to WordPress site.");
            }
        } catch (e) {
            console.error(e);
            alert("Connection error");
        } finally {
            setLoading(false);
            setStatus('');
        }
    };

    const toggleSelection = (id: number) => {
        const next = new Set(selection);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelection(next);
    };

    const handleImport = async () => {
        setLoading(true);
        setStatus('Creating Site & Job...');
        
        try {
            const client = getDirectusClient();
            
            // 1. Create Site
            // We assume url is like 'https://domain.com'
            const domain = new URL(url).hostname;
            const sitePayload = {
                name: domain,
                url: url,
                domain: domain,
                status: 'setup'
            };
            const site = await client.request(createItem('sites', sitePayload));
            
            // 2. Prepare Import Queue
            const selectedItems = items.filter(i => selection.has(i.id)).map(i => ({
                 original_id: i.id,
                 slug: i.slug,
                 title: i.title.rendered,
                 type: i.type 
            }));

            // 3. Create Generation Job
            const jobPayload = {
                site_id: site.id,
                status: 'Pending',
                target_quantity: selectedItems.length,
                filters: {
                    mode: 'refactor',
                    items: selectedItems
                }
            };
            const job = await client.request(createItem('generation_jobs', jobPayload));

            // 4. Trigger Generation API
            setStatus('Starting Refactor Engine...');
            const res = await fetch('/api/generate-content', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ jobId: job.id, mode: 'refactor' })
            });

            if (res.ok) {
                alert(`Success! Site created and ${selectedItems.length} items queued for refactoring.`);
                window.location.href = `/admin/sites/${site.id}`; // Redirect to site
            } else {
                const err = await res.json();
                alert('Error starting job: ' + err.error);
            }

        } catch (e) {
            console.error(e);
            alert("Import failed: " + e.message);
        } finally {
            setLoading(false);
            setStatus('');
        }
    };

    return (
        <div className="space-y-6">
            {!connected ? (
                <Card className="bg-slate-800 border-slate-700 max-w-xl mx-auto">
                    <CardHeader>
                        <CardTitle>Connect WordPress Site</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Site URL</Label>
                            <Input
                                placeholder="https://example.com"
                                value={url}
                                onChange={e => setUrl(e.target.value)}
                                className="bg-slate-900 border-slate-700 text-white"
                            />
                        </div>
                        <Button
                            onClick={connect}
                            disabled={loading || !url}
                            className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                            {loading ? 'Connecting...' : 'Scan Site'}
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    <div className="flex justify-between items-center bg-slate-800 p-4 rounded-lg border border-slate-700">
                        <div>
                            <h2 className="text-xl font-bold text-white">Select Content to Import</h2>
                            <p className="text-slate-400 text-sm">Found {items.length} items from {url}</p>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline" onClick={() => setConnected(false)} className="border-slate-600 text-slate-300">
                                Output
                            </Button>
                            <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={handleImport} disabled={selection.size === 0}>
                                Import {selection.size} Items
                            </Button>
                        </div>
                    </div>

                    <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                        <table className="w-full text-left text-sm text-slate-400">
                            <thead className="bg-slate-900/50 text-slate-200 uppercase font-medium">
                                <tr>
                                    <th className="px-6 py-3 w-12">
                                        <input type="checkbox" className="rounded border-slate-600 bg-slate-800" />
                                    </th>
                                    <th className="px-6 py-3">Title</th>
                                    <th className="px-6 py-3">Type</th>
                                    <th className="px-6 py-3">Slug</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {items.map(item => (
                                    <tr key={item.id} className="hover:bg-slate-700/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <input
                                                type="checkbox"
                                                checked={selection.has(item.id)}
                                                onChange={() => toggleSelection(item.id)}
                                                className="rounded border-slate-600 bg-slate-800"
                                            />
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-200" dangerouslySetInnerHTML={{ __html: item.title.rendered }} />
                                        <td className="px-6 py-4">
                                            <Badge variant="outline">{item.type}</Badge>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs">{item.slug}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
