// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { getDirectusClient, readItem, updateItem } from '@/lib/directus/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function PageEditor({ id }: { id: string }) {
    const [page, setPage] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            const client = getDirectusClient();
            try {
                const data = await client.request(readItem('pages', id));
                setPage(data);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        }
        if (id) load();
    }, [id]);

    if (loading) return <div>Loading...</div>;
    if (!page) return <div>Page not found</div>;

    return (
        <div className="space-y-6 max-w-4xl">
            <Card className="bg-slate-800 border-slate-700 p-6 space-y-4">
                <div className="space-y-2">
                    <Label>Page Title</Label>
                    <Input value={page.title} className="bg-slate-900 border-slate-700" />
                </div>
                <div className="space-y-2">
                    <Label>Permalink</Label>
                    <Input value={page.permalink} className="bg-slate-900 border-slate-700" />
                </div>
                <Button className="mt-4">Save Changes</Button>
            </Card>
        </div>
    );
}
