import React, { useState, useEffect } from 'react';
import { getDirectusClient, readItem, updateItem } from '@/lib/directus/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Sites as Site } from '@/lib/schemas';
import DomainSetupGuide from '@/components/admin/DomainSetupGuide';

interface SiteEditorProps {
    id: string; // Astro passes string params
}

export default function SiteEditor({ id }: SiteEditorProps) {
    const [site, setSite] = useState<Site | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Feature Flags State (mapped to settings)
    const [features, setFeatures] = useState({
        maintenance_mode: false,
        seo_indexing: true,
        https_enforced: true,
        analytics_enabled: false,
        blog_enabled: true,
        leads_capture: true
    });

    useEffect(() => {
        async function load() {
            try {
                const client = getDirectusClient();
                // @ts-ignore
                const result = await client.request(readItem('sites', id));
                setSite(result as unknown as Site);

                // Merge settings into defaults
                if (result.settings) {
                    setFeatures(prev => ({ ...prev, ...(result.settings as Record<string, any>) }));
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        if (id) load();
    }, [id]);

    const handleSave = async () => {
        if (!site) return;
        setSaving(true);
        try {
            const client = getDirectusClient();
            // @ts-ignore
            await client.request(updateItem('sites', id, {
                name: site.name,
                url: site.url,
                status: site.status,
                settings: features
            }));
            // Show toast?
            alert("Site Settings Saved!");
        } catch (e) {
            console.error(e);
            alert("Error saving site.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!site) return <div>Site not found</div>;

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Header / Meta */}
            <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                    <CardTitle>General Information</CardTitle>
                    <CardDescription>Basic site identity and connectivity.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Site Name</Label>
                            <Input
                                value={site.name}
                                onChange={(e) => setSite({ ...site, name: e.target.value })}
                                className="bg-slate-900 border-slate-700"
                                placeholder="My Awesome Site"
                            />
                            <p className="text-xs text-slate-500">Internal identifier for this site</p>
                        </div>
                        <div className="space-y-2">
                            <Label>Domain</Label>
                            <Input
                                value={site.url || ''}
                                onChange={(e) => setSite({ ...site, url: e.target.value })}
                                className="bg-slate-900 border-slate-700 font-mono text-blue-400"
                                placeholder="example.com"
                            />
                            <p className="text-xs text-slate-500">Your custom domain (without https://)</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Feature Toggles (CheckBox Options) */}
            <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                    <CardTitle>Feature Configuration</CardTitle>
                    <CardDescription>Enable or disable specific modules and behaviors for this site.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Maintenance Mode */}
                        <div className="flex items-center justify-between space-x-2 border p-4 rounded-lg border-slate-700 bg-slate-900/50">
                            <div className="space-y-0.5">
                                <Label className="text-base font-medium">Maintenance Mode</Label>
                                <p className="text-sm text-slate-500">
                                    Show a "Coming Soon" page to all visitors.
                                </p>
                            </div>
                            <Switch
                                checked={features.maintenance_mode}
                                onCheckedChange={(c) => setFeatures({ ...features, maintenance_mode: c })}
                            />
                        </div>

                        {/* SEO Indexing */}
                        <div className="flex items-center justify-between space-x-2 border p-4 rounded-lg border-slate-700 bg-slate-900/50">
                            <div className="space-y-0.5">
                                <Label className="text-base font-medium">Search Indexing</Label>
                                <p className="text-sm text-slate-500">
                                    Allow Google/Bing to index this site.
                                </p>
                            </div>
                            <Switch
                                checked={features.seo_indexing}
                                onCheckedChange={(c) => setFeatures({ ...features, seo_indexing: c })}
                            />
                        </div>

                        {/* HTTPS Enforced */}
                        <div className="flex items-center justify-between space-x-2 border p-4 rounded-lg border-slate-700 bg-slate-900/50">
                            <div className="space-y-0.5">
                                <Label className="text-base font-medium">Enforce HTTPS</Label>
                                <p className="text-sm text-slate-500">
                                    Redirect all HTTP traffic to HTTPS.
                                </p>
                            </div>
                            <Switch
                                checked={features.https_enforced}
                                onCheckedChange={(c) => setFeatures({ ...features, https_enforced: c })}
                            />
                        </div>

                        {/* Analytics */}
                        <div className="flex items-center justify-between space-x-2 border p-4 rounded-lg border-slate-700 bg-slate-900/50">
                            <div className="space-y-0.5">
                                <Label className="text-base font-medium">Analytics</Label>
                                <p className="text-sm text-slate-500">
                                    Inject GTM/GA4 scripts.
                                </p>
                            </div>
                            <Switch
                                checked={features.analytics_enabled}
                                onCheckedChange={(c) => setFeatures({ ...features, analytics_enabled: c })}
                            />
                        </div>

                        {/* Blog */}
                        <div className="flex items-center justify-between space-x-2 border p-4 rounded-lg border-slate-700 bg-slate-900/50">
                            <div className="space-y-0.5">
                                <Label className="text-base font-medium">Blog System</Label>
                                <p className="text-sm text-slate-500">
                                    Enable generated posts and archive pages.
                                </p>
                            </div>
                            <Switch
                                checked={features.blog_enabled}
                                onCheckedChange={(c) => setFeatures({ ...features, blog_enabled: c })}
                            />
                        </div>

                        {/* Leads */}
                        <div className="flex items-center justify-between space-x-2 border p-4 rounded-lg border-slate-700 bg-slate-900/50">
                            <div className="space-y-0.5">
                                <Label className="text-base font-medium">Lead Capture</Label>
                                <p className="text-sm text-slate-500">
                                    Process form submissions and webhooks.
                                </p>
                            </div>
                            <Switch
                                checked={features.leads_capture}
                                onCheckedChange={(c) => setFeatures({ ...features, leads_capture: c })}
                            />
                        </div>

                    </div>
                </CardContent>
            </Card>

            {/* Domain Setup Guide */}
            <DomainSetupGuide siteDomain={site.url} />

            <div className="flex justify-end gap-4">
                <Button variant="outline" onClick={() => window.history.back()}>
                    Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving} className="bg-green-600 hover:bg-green-700">
                    {saving ? 'Saving...' : 'Save Configuration'}
                </Button>
            </div>
        </div>
    );
}
