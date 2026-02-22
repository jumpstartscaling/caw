
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getDirectusClient, readItems, createItem } from '@/lib/directus/client';

export default function JobLaunchpad() {
    const [sites, setSites] = useState<any[]>([]);
    const [avatars, setAvatars] = useState<any[]>([]);
    const [patterns, setPatterns] = useState<any[]>([]);

    const [selectedSite, setSelectedSite] = useState('');
    const [selectedAvatars, setSelectedAvatars] = useState<string[]>([]);
    const [targetQuantity, setTargetQuantity] = useState(10);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [jobStatus, setJobStatus] = useState<string | null>(null);

    useEffect(() => {
        async function loadData() {
            const client = getDirectusClient();
            try {
                const s = await client.request(readItems('sites'));
                const a = await client.request(readItems('avatar_intelligence'));
                const p = await client.request(readItems('cartesian_patterns'));

                setSites(s);
                setAvatars(a);
                setPatterns(p);
            } catch (e) {
                console.error("Failed to load data", e);
            }
        }
        loadData();
    }, []);

    const toggleAvatar = (id: string) => {
        if (selectedAvatars.includes(id)) {
            setSelectedAvatars(selectedAvatars.filter(x => x !== id));
        } else {
            setSelectedAvatars([...selectedAvatars, id]);
        }
    };

    const calculatePermutations = () => {
        // Simple mock calculation
        // Real one would query preview-permutations API
        return selectedAvatars.length * 50 * 50 * (patterns.length || 1);
    };

    const handleLaunch = async () => {
        if (!selectedSite || selectedAvatars.length === 0) return;
        setIsSubmitting(true);
        setJobStatus('Queuing...');

        try {
            const client = getDirectusClient();
            // Create Job Record
            const job = await client.request(createItem('generation_jobs', {
                site_id: selectedSite,
                target_quantity: targetQuantity,
                status: 'pending',
                filters: {
                    avatars: selectedAvatars,
                    patterns: patterns.map(p => p.id) // Use all patterns for now
                },
                current_offset: 0
            })); // Error: createItem not imported? client.request(createItem...)

            // Trigger API (Fire and Forget or Wait)
            // We'll call the API to start processing immediately
            await fetch('/api/generate-content', {
                method: 'POST',
                body: JSON.stringify({ jobId: job.id, batchSize: 5 })
            });

            setJobStatus(`Job ${job.id} Started!`);
        } catch (e) {
            setJobStatus('Error launching job');
            console.error(e);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Need to import createItem helper for client usage above? 
    // No, I can use SDK function imported. 
    // Client is already authenticated.

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>1. Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Target Site</label>
                        <select
                            className="w-full p-2 border rounded"
                            value={selectedSite}
                            onChange={e => setSelectedSite(e.target.value)}
                        >
                            <option value="">Select Site...</option>
                            {sites.map(s => <option key={s.id} value={s.id}>{s.name || s.url}</option>)}
                        </select>
                    </div>

                    <div>
                        <div className="bg-slate-50 p-4 rounded border border-slate-200">
                            <label className="block text-sm font-bold mb-2">Launch Mode</label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="mode"
                                        className="accent-blue-600"
                                        checked={targetQuantity === 10 && selectedAvatars.length === avatars.length}
                                        onChange={() => {
                                            setTargetQuantity(10);
                                            setSelectedAvatars(avatars.map(a => a.id));
                                        }}
                                    />
                                    <span>Full Site Setup (Home + Blog + 10 Posts)</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="mode"
                                        className="accent-blue-600"
                                        checked={targetQuantity !== 10 || selectedAvatars.length !== avatars.length}
                                        onChange={() => {
                                            setTargetQuantity(1);
                                            setSelectedAvatars([]);
                                        }}
                                    />
                                    <span>Custom Batch</span>
                                </label>
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium">Select Avatars</label>
                                <button
                                    className="text-xs text-blue-600 hover:underline"
                                    onClick={() => setSelectedAvatars(avatars.map(a => a.id))}
                                >
                                    Select All
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {avatars.map(a => (
                                    <Badge
                                        key={a.id}
                                        variant={selectedAvatars.includes(a.id) ? 'default' : 'outline'}
                                        className="cursor-pointer"
                                        onClick={() => toggleAvatar(a.id)}
                                    >
                                        {a.base_name}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <label className="block text-sm font-medium mb-1">Total Posts</label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="range"
                                    min="1"
                                    max="100"
                                    className="w-full"
                                    value={targetQuantity}
                                    onChange={e => setTargetQuantity(parseInt(e.target.value))}
                                />
                                <input
                                    type="number"
                                    className="w-20 p-2 border rounded text-center"
                                    value={targetQuantity}
                                    onChange={e => setTargetQuantity(parseInt(e.target.value))}
                                />
                            </div>
                        </div>

                        <div className="bg-slate-100 p-4 rounded text-center">
                            <p className="text-sm text-slate-500">Estimated Permutations Available</p>
                            <p className="text-3xl font-bold text-slate-800">{calculatePermutations().toLocaleString()}</p>
                        </div>

                        <Button
                            onClick={handleLaunch}
                            disabled={isSubmitting || !selectedSite || selectedAvatars.length === 0}
                            className="w-full py-6 text-lg"
                        >
                            {isSubmitting ? 'Launching...' : '🚀 Launch Generation Job'}
                        </Button>

                        {jobStatus && (
                            <div className="p-2 text-center bg-blue-50 text-blue-700 rounded border border-blue-100">
                                {jobStatus}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

// Need to import createItem locally if passing to client.request? 
// getDirectusClient return type allows chaining? 
// Using `client.request(createItem(...))` requires importing `createItem` from SDK.

