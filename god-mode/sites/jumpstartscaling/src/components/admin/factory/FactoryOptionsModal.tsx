import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getDirectusClient, readItems } from '@/lib/directus/client';

interface FactoryOptionsModalProps {
    postTitle: string;
    onClose: () => void;
    onSubmit: (options: FactoryOptions) => void;
    isLoading: boolean;
}

interface FactoryOptions {
    template: string;
    location?: string;
    mode: string;
    autoPublish: boolean;
}

export default function FactoryOptionsModal({
    postTitle,
    onClose,
    onSubmit,
    isLoading
}: FactoryOptionsModalProps) {
    const [template, setTemplate] = useState('long_tail_seo');
    const [location, setLocation] = useState('');
    const [mode, setMode] = useState('refactor');
    const [autoPublish, setAutoPublish] = useState(false);
    const [geoClusters, setGeoClusters] = useState<any[]>([]);

    useEffect(() => {
        loadGeoClusters();
    }, []);

    const loadGeoClusters = async () => {
        try {
            const client = getDirectusClient();
            // @ts-ignore
            const clusters = await client.request(readItems('geo_clusters', {
                fields: ['id', 'cluster_name'],
                limit: -1
            }));
            setGeoClusters(clusters);
        } catch (error) {
            console.error('Error loading geo clusters:', error);
        }
    };

    const handleSubmit = () => {
        onSubmit({
            template,
            location,
            mode,
            autoPublish
        });
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-white">
                        🏭 Send to Factory
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Configure how you want to transform: <span className="text-purple-400 font-semibold">{postTitle}</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Template Selection */}
                    <div>
                        <Label htmlFor="template" className="text-white mb-2 block">
                            Content Template
                        </Label>
                        <Select value={template} onValueChange={setTemplate}>
                            <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700">
                                <SelectItem value="long_tail_seo">Long-Tail SEO</SelectItem>
                                <SelectItem value="local_authority">Local Authority</SelectItem>
                                <SelectItem value="thought_leadership">Thought Leadership</SelectItem>
                                <SelectItem value="problem_solution">Problem → Solution</SelectItem>
                                <SelectItem value="listicle">Listicle Format</SelectItem>
                                <SelectItem value="how_to_guide">How-To Guide</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-slate-500 mt-1">
                            Choose the content structure and SEO strategy
                        </p>
                    </div>

                    {/* Location Targeting */}
                    <div>
                        <Label htmlFor="location" className="text-white mb-2 block">
                            Location Targeting (Optional)
                        </Label>
                        <Select value={location} onValueChange={setLocation}>
                            <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                                <SelectValue placeholder="No location targeting" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700">
                                <SelectItem value="">No location targeting</SelectItem>
                                {geoClusters.map((cluster) => (
                                    <SelectItem key={cluster.id} value={cluster.cluster_name}>
                                        {cluster.cluster_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-slate-500 mt-1">
                            Apply geo-specific keywords and local SEO
                        </p>
                    </div>

                    {/* Processing Mode */}
                    <div>
                        <Label htmlFor="mode" className="text-white mb-2 block">
                            Processing Mode
                        </Label>
                        <Select value={mode} onValueChange={setMode}>
                            <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700">
                                <SelectItem value="refactor">Refactor (Improve existing)</SelectItem>
                                <SelectItem value="rewrite">Rewrite (Complete rewrite)</SelectItem>
                                <SelectItem value="enhance">Enhance (Add sections)</SelectItem>
                                <SelectItem value="localize">Localize (Geo-optimize)</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-slate-500 mt-1">
                            How aggressively to transform the content
                        </p>
                    </div>

                    {/* Auto-Publish Toggle */}
                    <div className="flex items-center justify-between p-4 bg-slate-900 rounded-lg border border-slate-700">
                        <div>
                            <Label htmlFor="autoPublish" className="text-white font-semibold">
                                Auto-Publish to WordPress
                            </Label>
                            <p className="text-xs text-slate-500 mt-1">
                                Automatically publish back to WordPress after generation
                            </p>
                        </div>
                        <button
                            onClick={() => setAutoPublish(!autoPublish)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${autoPublish ? 'bg-purple-600' : 'bg-slate-700'
                                }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoPublish ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                    </div>

                    {/* Preview Info */}
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <span className="text-2xl">ℹ️</span>
                            <div>
                                <h4 className="font-semibold text-blue-400 mb-1">What happens next?</h4>
                                <ul className="text-sm text-slate-300 space-y-1">
                                    <li>• Content will be sent to the Spark Factory</li>
                                    <li>• Intelligence Library will be applied (spintax, patterns, geo)</li>
                                    <li>• Article will be generated with your selected template</li>
                                    <li>• You'll get a preview link to review before publishing</li>
                                    {autoPublish && <li className="text-yellow-400">• Article will auto-publish to WordPress</li>}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        onClick={onClose}
                        disabled={isLoading}
                        variant="ghost"
                        className="text-slate-400 hover:text-white"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold"
                    >
                        {isLoading ? (
                            <>
                                <span className="animate-spin mr-2">⏳</span>
                                Processing...
                            </>
                        ) : (
                            <>
                                <span className="mr-2">🚀</span>
                                Send to Factory
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
