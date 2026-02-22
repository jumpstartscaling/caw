import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDirectusClient, readItems, createItem } from '@/lib/directus/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, MapPin, Repeat, Calendar as CalendarIcon, ArrowRight, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const client = getDirectusClient();

interface CampaignWizardProps {
    onComplete: () => void;
    onCancel: () => void;
}

export default function CampaignWizard({ onComplete, onCancel }: CampaignWizardProps) {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        site: '',
        type: 'geo',
        template: 'standard', // default
        config: {} as any,
        frequency: 'once',
        batch_size: 10,
        max_articles: 100
    });

    // Fetch dependencies
    const { data: sites = [] } = useQuery({
        queryKey: ['sites'],
        queryFn: async () => {
            // @ts-ignore
            const res = await client.request(readItems('sites', { limit: -1 }));
            return res as any[];
        }
    });

    const { data: geoClusters = [] } = useQuery({
        queryKey: ['geo_clusters'],
        queryFn: async () => {
            // @ts-ignore
            const res = await client.request(readItems('geo_clusters', { limit: -1 }));
            return res as any[];
        }
    });

    const createMutation = useMutation({
        mutationFn: async () => {
            // @ts-ignore
            await client.request(createItem('campaigns', {
                ...formData,
                status: 'active'
            }));
        },
        onSuccess: () => {
            toast.success('Campaign launched successfully!');
            onComplete();
        }
    });

    const renderStep1 = () => (
        <div className="space-y-6">
            <div className="space-y-2">
                <label className="text-sm font-medium text-white">Campaign Name</label>
                <Input
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Q1 SEO Expansion"
                    className="bg-zinc-950 border-zinc-800"
                />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-white">Target Site</label>
                <select
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-white"
                    value={formData.site}
                    onChange={e => setFormData({ ...formData, site: e.target.value })}
                >
                    <option value="">Select a Site...</option>
                    {sites.map(s => <option key={s.id} value={s.id}>{s.name} ({s.url})</option>)}
                </select>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
                <div
                    onClick={() => setFormData({ ...formData, type: 'geo' })}
                    className={`cursor-pointer p-4 rounded-lg border-2 ${formData.type === 'geo' ? 'border-blue-500 bg-blue-500/10' : 'border-zinc-800 bg-zinc-900'} hover:border-zinc-700 transition-all`}
                >
                    <MapPin className={`h-6 w-6 mb-2 ${formData.type === 'geo' ? 'text-blue-500' : 'text-zinc-500'}`} />
                    <h4 className="font-bold text-white">Geo Expansion</h4>
                    <p className="text-xs text-zinc-400 mt-1">Generate pages for City + Niche combinations.</p>
                </div>
                <div
                    onClick={() => setFormData({ ...formData, type: 'spintax' })}
                    className={`cursor-pointer p-4 rounded-lg border-2 ${formData.type === 'spintax' ? 'border-purple-500 bg-purple-500/10' : 'border-zinc-800 bg-zinc-900'} hover:border-zinc-700 transition-all`}
                >
                    <Repeat className={`h-6 w-6 mb-2 ${formData.type === 'spintax' ? 'text-purple-500' : 'text-zinc-500'}`} />
                    <h4 className="font-bold text-white">Mass Spintax</h4>
                    <p className="text-xs text-zinc-400 mt-1">Generate variations from a spintax dictionary.</p>
                </div>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-6">
            {formData.type === 'geo' && (
                <>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white">Select Geo Cluster</label>
                        <select
                            className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-white"
                            value={formData.config.cluster_id || ''}
                            onChange={e => setFormData({ ...formData, config: { ...formData.config, cluster_id: e.target.value } })}
                        >
                            <option value="">Select Cluster...</option>
                            {geoClusters.map(c => <option key={c.id} value={c.id}>{c.cluster_name}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white">Niches (Comma separated)</label>
                        <Input
                            value={formData.config.niches || ''}
                            onChange={e => setFormData({ ...formData, config: { ...formData.config, niches: e.target.value } })}
                            placeholder="Plumber, Electrician, roofer"
                            className="bg-zinc-950 border-zinc-800"
                        />
                        <p className="text-xs text-zinc-500">We will combine every city in the cluster with these niches.</p>
                    </div>

                </>
            )}

            {formData.type === 'spintax' && (
                <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Spintax Formula</label>
                    <textarea
                        value={formData.config.spintax_raw || ''}
                        onChange={e => setFormData({ ...formData, config: { ...formData.config, spintax_raw: e.target.value } })}
                        className="w-full min-h-[150px] bg-zinc-950 border border-zinc-800 rounded p-3 text-sm text-white font-mono"
                        placeholder="{Great|Awesome|Best} {service|solution} for {your business|your company}."
                    />
                    <p className="text-xs text-zinc-500">Enter raw Spintax. We will generate unique variations until we hit the target.</p>
                </div>
            )}
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-6">
            <div className="space-y-2">
                <label className="text-sm font-medium text-white">Frequency</label>
                <div className="grid grid-cols-3 gap-2">
                    {['once', 'daily', 'weekly'].map(freq => (
                        <Button
                            key={freq}
                            variant={formData.frequency === freq ? 'default' : 'outline'}
                            className={formData.frequency === freq ? 'bg-blue-600' : 'border-zinc-800'}
                            onClick={() => setFormData({ ...formData, frequency: freq })}
                        >
                            {freq.charAt(0).toUpperCase() + freq.slice(1)}
                        </Button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Batch Size</label>
                    <Input
                        type="number"
                        value={formData.batch_size}
                        onChange={e => setFormData({ ...formData, batch_size: parseInt(e.target.value) })}
                        className="bg-zinc-950 border-zinc-800"
                    />
                    <p className="text-xs text-zinc-500">Articles per run</p>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Max Total</label>
                    <Input
                        type="number"
                        value={formData.max_articles}
                        onChange={e => setFormData({ ...formData, max_articles: parseInt(e.target.value) })}
                        className="bg-zinc-950 border-zinc-800"
                    />
                    <p className="text-xs text-zinc-500">Stop after this many</p>
                </div>
            </div>
        </div>
    );

    const renderSummary = () => (
        <div className="space-y-6 bg-zinc-900/50 p-6 rounded-lg border border-zinc-800">
            <h3 className="text-lg font-bold text-white flex items-center mb-4"><Sparkles className="mr-2 h-5 w-5 text-yellow-500" /> Ready to Launch</h3>
            <div className="space-y-2 text-sm text-zinc-300">
                <div className="flex justify-between"><span className="text-zinc-500">Name:</span> <span>{formData.name}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">Site:</span> <span>{sites.find(s => s.id == formData.site)?.name || formData.site}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">Strategy:</span> <span className="capitalize">{formData.type}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">Schedule:</span> <span className="capitalize">{formData.frequency} ({formData.batch_size}/run)</span></div>
                <div className="flex justify-between border-t border-zinc-800 pt-2 font-bold text-white"><span className="text-zinc-500">Total Goal:</span> <span>{formData.max_articles} Articles</span></div>
            </div>
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto">
            <Card className="bg-zinc-900 border-zinc-800 shadow-xl">
                <CardHeader>
                    <CardTitle>Create New Campaign</CardTitle>
                    <CardDescription>Step {step} of 4</CardDescription>
                </CardHeader>
                <CardContent>

                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}
                    {step === 4 && renderSummary()}

                    <div className="flex justify-between mt-8 pt-4 border-t border-zinc-800">
                        {step === 1 ? (
                            <Button variant="ghost" onClick={onCancel} className="text-zinc-400">Cancel</Button>
                        ) : (
                            <Button variant="ghost" onClick={() => setStep(step - 1)}>
                                <ArrowLeft className="mr-2 h-4 w-4" /> Back
                            </Button>
                        )}

                        {step < 4 ? (
                            <Button onClick={() => setStep(step + 1)} className="bg-blue-600 hover:bg-blue-500">
                                Next <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        ) : (
                            <Button onClick={() => createMutation.mutate()} className="bg-green-600 hover:bg-green-500">
                                Launch Campaign <Sparkles className="ml-2 h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
