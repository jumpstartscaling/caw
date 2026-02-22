import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';

interface Campaign {
    id: string;
    name: string;
    headline_spintax_root: string;
    location_mode: string;
    status: string;
    date_created: string;
}

interface GenerationResult {
    metadata: {
        slotCount: number;
        spintaxCombinations: number;
        locationCount: number;
        totalPossible: number;
        wasTruncated: boolean;
    };
    results: {
        processed: number;
        inserted: number;
        skipped: number;
        alreadyExisted: number;
    };
}

export default function CampaignManager() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState<string | null>(null);
    const [lastResult, setLastResult] = useState<GenerationResult | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        headline_spintax_root: '',
        location_mode: 'none',
        niche_variables: '{}'
    });

    useEffect(() => {
        fetchCampaigns();
    }, []);

    async function fetchCampaigns() {
        try {
            const res = await fetch('/api/campaigns');
            const data = await res.json();
            setCampaigns(data.campaigns || []);
        } catch (err) {
            console.error('Error fetching campaigns:', err);
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        try {
            await fetch('/api/campaigns', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            setShowForm(false);
            setFormData({
                name: '',
                headline_spintax_root: '',
                location_mode: 'none',
                niche_variables: '{}'
            });
            fetchCampaigns();
        } catch (err) {
            console.error('Error creating campaign:', err);
        }
    }

    async function generateHeadlines(campaignId: string) {
        setGenerating(campaignId);
        setLastResult(null);

        try {
            const res = await fetch('/api/seo/generate-headlines', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    campaign_id: campaignId,
                    max_headlines: 10000
                })
            });

            const data = await res.json();

            if (data.success) {
                setLastResult(data as GenerationResult);
            } else {
                alert('Error: ' + (data.error || 'Unknown error'));
            }
        } catch (err) {
            console.error('Error generating headlines:', err);
            alert('Failed to generate headlines');
        } finally {
            setGenerating(null);
        }
    }

    if (loading) {
        return <Spinner className="py-12" />;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <p className="text-gray-400">
                    Manage your SEO campaigns with Cartesian Permutation headline generation.
                </p>
                <Button onClick={() => setShowForm(true)}>
                    + New Campaign
                </Button>
            </div>

            {/* Generation Result Modal */}
            {lastResult && (
                <Card className="border-green-500/50 bg-green-500/10">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-lg font-semibold text-green-400 mb-4">
                                    ✓ Headlines Generated Successfully
                                </h3>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-400">Spintax Slots:</span>
                                        <p className="text-white font-mono">{lastResult.metadata.slotCount}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-400">Spintax Combinations:</span>
                                        <p className="text-white font-mono">{lastResult.metadata.spintaxCombinations.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-400">Locations:</span>
                                        <p className="text-white font-mono">{lastResult.metadata.locationCount.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-400">Total Possible (n×k):</span>
                                        <p className="text-white font-mono">{lastResult.metadata.totalPossible.toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className="mt-4 flex gap-6 text-sm">
                                    <span className="text-green-400">
                                        Inserted: {lastResult.results.inserted.toLocaleString()}
                                    </span>
                                    <span className="text-yellow-400">
                                        Skipped (duplicates): {lastResult.results.skipped.toLocaleString()}
                                    </span>
                                    <span className="text-gray-400">
                                        Already existed: {lastResult.results.alreadyExisted.toLocaleString()}
                                    </span>
                                </div>

                                {lastResult.metadata.wasTruncated && (
                                    <p className="mt-3 text-yellow-400 text-sm">
                                        ⚠ Results truncated to 10,000 headlines (safety limit)
                                    </p>
                                )}
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setLastResult(null)}
                            >
                                Dismiss
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {showForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>Create New Campaign</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input
                                label="Campaign Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., Local Dental SEO"
                                required
                            />

                            <div>
                                <Textarea
                                    label="Headline Spintax"
                                    value={formData.headline_spintax_root}
                                    onChange={(e) => setFormData({ ...formData, headline_spintax_root: e.target.value })}
                                    placeholder="{Best|Top|Leading} {Dentist|Dental Clinic} in {city}"
                                    rows={4}
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Use {'{option1|option2}'} for variations. Formula: n₁ × n₂ × ... × nₖ × locations
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Location Mode</label>
                                <select
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                                    value={formData.location_mode}
                                    onChange={(e) => setFormData({ ...formData, location_mode: e.target.value })}
                                >
                                    <option value="none">No Location</option>
                                    <option value="state">By State (51 variations)</option>
                                    <option value="county">By County (3,143 variations)</option>
                                    <option value="city">By City (top 1,000 variations)</option>
                                </select>
                            </div>

                            <Textarea
                                label="Niche Variables (JSON)"
                                value={formData.niche_variables}
                                onChange={(e) => setFormData({ ...formData, niche_variables: e.target.value })}
                                placeholder='{"target": "homeowners", "service": "dental"}'
                                rows={3}
                            />

                            <div className="flex gap-3">
                                <Button type="submit">Create Campaign</Button>
                                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-4">
                {campaigns.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center text-gray-400">
                            No campaigns yet. Create your first SEO campaign to get started.
                        </CardContent>
                    </Card>
                ) : (
                    campaigns.map((campaign) => (
                        <Card key={campaign.id}>
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold text-white">{campaign.name}</h3>
                                            <Badge variant={campaign.status === 'active' ? 'success' : 'secondary'}>
                                                {campaign.status}
                                            </Badge>
                                            {campaign.location_mode !== 'none' && (
                                                <Badge variant="outline">{campaign.location_mode}</Badge>
                                            )}
                                        </div>

                                        <p className="text-gray-400 text-sm font-mono bg-gray-700/50 p-2 rounded mt-2">
                                            {campaign.headline_spintax_root.substring(0, 100)}
                                            {campaign.headline_spintax_root.length > 100 ? '...' : ''}
                                        </p>

                                        <p className="text-gray-500 text-sm mt-2">
                                            Created: {new Date(campaign.date_created).toLocaleDateString()}
                                        </p>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => generateHeadlines(campaign.id)}
                                            disabled={generating === campaign.id}
                                        >
                                            {generating === campaign.id ? (
                                                <>
                                                    <Spinner size="sm" className="mr-2" />
                                                    Generating...
                                                </>
                                            ) : (
                                                'Generate Headlines'
                                            )}
                                        </Button>
                                        <Button variant="secondary" size="sm">
                                            Edit
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
