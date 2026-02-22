import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDirectusClient, readItems, createItem, updateItem } from '@/lib/directus/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Save, Palette, Type } from 'lucide-react';
import { toast } from 'sonner';

const client = getDirectusClient();

interface GlobalSettings {
    id?: string;
    site: string;
    primary_color: string;
    secondary_color: string;
    footer_text: string;
}

interface ThemeSettingsProps {
    siteId: string;
}

export default function ThemeSettings({ siteId }: ThemeSettingsProps) {
    const queryClient = useQueryClient();
    const [settings, setSettings] = useState<Partial<GlobalSettings>>({});

    const { data: globalRecord, isLoading } = useQuery({
        queryKey: ['globals', siteId],
        queryFn: async () => {
            // @ts-ignore
            const res = await client.request(readItems('globals', {
                filter: { site: { _eq: siteId } },
                limit: 1
            }));
            const record = res[0] as GlobalSettings;
            if (record) setSettings(record);
            return record;
        }
    });

    const saveMutation = useMutation({
        mutationFn: async () => {
            if (globalRecord?.id) {
                // @ts-ignore
                await client.request(updateItem('globals', globalRecord.id, settings));
            } else {
                // @ts-ignore
                await client.request(createItem('globals', { ...settings, site: siteId }));
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['globals', siteId] });
            toast.success('Theme settings saved');
        }
    });

    if (isLoading) return <div className="text-zinc-500">Loading settings...</div>;

    return (
        <div className="max-w-2xl space-y-8">
            <div className="space-y-4">
                <h3 className="text-lg font-medium text-white flex items-center gap-2">
                    <Palette className="h-5 w-5 text-purple-400" /> Colors
                </h3>
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs uppercase font-bold text-zinc-500">Primary Color</label>
                        <div className="flex gap-2">
                            <div className="w-10 h-10 rounded border border-zinc-700" style={{ backgroundColor: settings.primary_color || '#000000' }}></div>
                            <Input
                                value={settings.primary_color || ''}
                                onChange={e => setSettings({ ...settings, primary_color: e.target.value })}
                                placeholder="#000000"
                                className="bg-zinc-950 border-zinc-800 font-mono"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs uppercase font-bold text-zinc-500">Secondary Color</label>
                        <div className="flex gap-2">
                            <div className="w-10 h-10 rounded border border-zinc-700" style={{ backgroundColor: settings.secondary_color || '#ffffff' }}></div>
                            <Input
                                value={settings.secondary_color || ''}
                                onChange={e => setSettings({ ...settings, secondary_color: e.target.value })}
                                placeholder="#ffffff"
                                className="bg-zinc-950 border-zinc-800 font-mono"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-zinc-800">
                <h3 className="text-lg font-medium text-white flex items-center gap-2">
                    <Type className="h-5 w-5 text-blue-400" /> Typography & Text
                </h3>
                <div className="space-y-2">
                    <label className="text-xs uppercase font-bold text-zinc-500">Footer Text</label>
                    <Textarea
                        value={settings.footer_text || ''}
                        onChange={e => setSettings({ ...settings, footer_text: e.target.value })}
                        className="bg-zinc-950 border-zinc-800 min-h-[100px]"
                        placeholder="© 2024 My Company. All rights reserved."
                    />
                </div>
            </div>

            <div className="pt-6">
                <Button onClick={() => saveMutation.mutate()} className="bg-blue-600 hover:bg-blue-500 w-full md:w-auto">
                    <Save className="mr-2 h-4 w-4" /> Save Changes
                </Button>
            </div>
        </div>
    );
}
