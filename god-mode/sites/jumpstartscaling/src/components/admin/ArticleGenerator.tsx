import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';

interface Article {
    id: string;
    headline: string;
    meta_title: string;
    word_count: number;
    is_published: boolean;
    location_city?: string;
    location_state?: string;
    date_created: string;
}

interface Campaign {
    id: string;
    name: string;
}

export default function ArticleGenerator() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState('');
    const [batchSize, setBatchSize] = useState(1);

    useEffect(() => {
        Promise.all([fetchArticles(), fetchCampaigns()]).finally(() => setLoading(false));
    }, []);

    async function fetchArticles() {
        try {
            const res = await fetch('/api/seo/articles');
            const data = await res.json();
            setArticles(data.articles || []);
        } catch (err) {
            console.error('Error fetching articles:', err);
        }
    }

    async function fetchCampaigns() {
        try {
            const res = await fetch('/api/campaigns');
            const data = await res.json();
            setCampaigns(data.campaigns || []);
        } catch (err) {
            console.error('Error fetching campaigns:', err);
        }
    }

    async function generateArticle() {
        if (!selectedCampaign) {
            alert('Please select a campaign first');
            return;
        }

        setGenerating(true);
        try {
            const res = await fetch('/api/seo/generate-article', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    campaign_id: selectedCampaign,
                    batch_size: batchSize
                })
            });

            if (res.ok) {
                alert(`${batchSize} article(s) generation started!`);
                fetchArticles();
            }
        } catch (err) {
            console.error('Error generating article:', err);
        } finally {
            setGenerating(false);
        }
    }

    async function publishArticle(articleId: string) {
        try {
            await fetch(`/api/seo/articles/${articleId}/publish`, { method: 'POST' });
            fetchArticles();
        } catch (err) {
            console.error('Error publishing article:', err);
        }
    }

    if (loading) {
        return <Spinner className="py-12" />;
    }

    return (
        <div className="space-y-6">
            {/* Generator Controls */}
            <Card>
                <CardHeader>
                    <CardTitle>Generate New Articles</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-4 items-end">
                        <div className="flex-1 min-w-48">
                            <label className="block text-sm font-medium mb-2 text-gray-400">Campaign</label>
                            <select
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                                value={selectedCampaign}
                                onChange={(e) => setSelectedCampaign(e.target.value)}
                            >
                                <option value="">Select a campaign...</option>
                                {campaigns.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="w-32">
                            <label className="block text-sm font-medium mb-2 text-gray-400">Batch Size</label>
                            <select
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                                value={batchSize}
                                onChange={(e) => setBatchSize(Number(e.target.value))}
                            >
                                <option value="1">1 Article</option>
                                <option value="5">5 Articles</option>
                                <option value="10">10 Articles</option>
                                <option value="25">25 Articles</option>
                                <option value="50">50 Articles</option>
                            </select>
                        </div>

                        <Button
                            onClick={generateArticle}
                            disabled={generating || !selectedCampaign}
                            className="min-w-32"
                        >
                            {generating ? 'Generating...' : 'Generate'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Articles List */}
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-white">Generated Articles ({articles.length})</h2>
                <Button variant="outline" onClick={fetchArticles}>Refresh</Button>
            </div>

            <div className="grid gap-4">
                {articles.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center text-gray-400">
                            No articles generated yet. Select a campaign and click Generate.
                        </CardContent>
                    </Card>
                ) : (
                    articles.map((article) => (
                        <Card key={article.id}>
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold text-white line-clamp-1">
                                                {article.headline}
                                            </h3>
                                            <Badge variant={article.is_published ? 'success' : 'secondary'}>
                                                {article.is_published ? 'Published' : 'Draft'}
                                            </Badge>
                                        </div>

                                        <p className="text-gray-400 text-sm mb-2">{article.meta_title}</p>

                                        <div className="flex gap-4 text-sm text-gray-500">
                                            <span>{article.word_count} words</span>
                                            {article.location_city && (
                                                <span>{article.location_city}, {article.location_state}</span>
                                            )}
                                            <span>{new Date(article.date_created).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm">Preview</Button>
                                        {!article.is_published && (
                                            <Button
                                                size="sm"
                                                onClick={() => publishArticle(article.id)}
                                            >
                                                Publish
                                            </Button>
                                        )}
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
