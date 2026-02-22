import React, { useState, useEffect } from 'react';
import { getDirectusClient, readItems } from '@/lib/directus/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pages as Page } from '@/lib/schemas';

export default function PageList() {
    const [pages, setPages] = useState<Page[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const client = getDirectusClient();
                // @ts-ignore
                const data = await client.request(readItems('pages', { fields: ['*', 'site.name'] }));
                setPages(data as unknown as Page[]);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        }
        load();
    }, []);

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-4">
            {pages.map(page => (
                <Card key={page.id} className="bg-slate-800 border-slate-700 hover:bg-slate-800/80 transition-colors cursor-pointer">
                    <CardHeader className="p-4 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg font-medium text-slate-200">{page.title}</CardTitle>
                            <div className="text-sm text-slate-500 font-mono mt-1">/{page.slug}</div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Badge variant="outline" className="text-slate-400 border-slate-600">
                                {/* @ts-ignore */}
                                {page.site?.name || 'Unknown Site'}
                            </Badge>
                            <Badge variant={page.status === 'published' ? 'default' : 'secondary'}>
                                {page.status}
                            </Badge>
                        </div>
                    </CardHeader>
                </Card>
            ))}
            {pages.length === 0 && <div className="text-center text-slate-500 py-10">No pages found.</div>}
        </div>
    );
}
