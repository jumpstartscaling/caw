
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getDirectusClient, readItems } from '@/lib/directus/client';
import { Badge } from '@/components/ui/badge';

export default function LiveAssembler() {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any>({ sites: [], avatars: [], cities: [], templates: [] });
    const [selections, setSelections] = useState({
        siteId: '',
        avatarId: '',
        cityId: '', // Need to fetch cities intelligently (too many), for now fetch first 100
        templateId: '',
        niche: ''
    });
    const [preview, setPreview] = useState<any>(null);

    useEffect(() => {
        async function init() {
            const client = getDirectusClient();
            const [sites, avatars, cities, templates] = await Promise.all([
                client.request(readItems('sites')),
                client.request(readItems('avatars')),
                client.request(readItems('geo_locations', { limit: 50 })), // Just sample
                client.request(readItems('article_templates'))
            ]);
            setData({ sites, avatars, cities, templates });
        }
        init();
    }, []);

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/preview-article', {
                method: 'POST',
                body: JSON.stringify(selections)
            });
            const json = await res.json();
            if (json.error) throw new Error(json.error);
            setPreview(json);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
            {/* Controls */}
            <Card className="col-span-1 border-r h-full overflow-y-auto">
                <CardHeader>
                    <CardTitle>Assembler Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label className="text-xs uppercase font-bold text-slate-500">Site</label>
                        <select className="w-full p-2 border rounded mt-1"
                            onChange={e => setSelections({ ...selections, siteId: e.target.value })}>
                            <option value="">Select...</option>
                            {data.sites.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs uppercase font-bold text-slate-500">Avatar</label>
                        <select className="w-full p-2 border rounded mt-1"
                            onChange={e => setSelections({ ...selections, avatarId: e.target.value })}>
                            <option value="">Select...</option>
                            {data.avatars.map((s: any) => <option key={s.id} value={s.id}>{s.base_name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs uppercase font-bold text-slate-500">City (Sample)</label>
                        <select className="w-full p-2 border rounded mt-1"
                            onChange={e => setSelections({ ...selections, cityId: e.target.value })}>
                            <option value="">Select...</option>
                            {data.cities.map((s: any) => <option key={s.id} value={s.id}>{s.city}, {s.state}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs uppercase font-bold text-slate-500">Template</label>
                        <select className="w-full p-2 border rounded mt-1"
                            onChange={e => setSelections({ ...selections, templateId: e.target.value })}>
                            <option value="">Select...</option>
                            {data.templates.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>

                    <Button onClick={handleGenerate} disabled={loading} className="w-full">
                        {loading ? 'Assembling...' : 'Generate Preview'}
                    </Button>
                </CardContent>
            </Card>

            {/* Preview Window */}
            <div className="col-span-2 h-full overflow-y-auto bg-white border rounded-lg shadow-inner p-8">
                {preview ? (
                    <div className="prose max-w-none">
                        <div className="mb-6 pb-6 border-b">
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">{preview.title}</h1>
                            <div className="flex gap-2">
                                <Badge variant="secondary">Slug: {preview.slug}</Badge>
                                <Badge variant="outline">{preview.html_content.length} chars</Badge>
                            </div>
                        </div>
                        <div dangerouslySetInnerHTML={{ __html: preview.html_content }} />
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-slate-400">
                        Configure setttings and click Generate to preview article.
                    </div>
                )}
            </div>
        </div>
    );
}
