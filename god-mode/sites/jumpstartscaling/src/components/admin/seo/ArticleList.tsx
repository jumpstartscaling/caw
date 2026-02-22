import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Article {
    id: number;
    headline: string;
    slug: string;
    status: string;
    is_published: boolean;
    seo_score: number;
    target_keyword: string;
    campaign: { name: string } | null;
    date_created: string;
}

interface Props {
    initialArticles?: Article[];
}

export default function ArticleList({ initialArticles = [] }: Props) {
    const [articles, setArticles] = useState(initialArticles);

    const getStatusColor = (status: string, isPublished: boolean) => {
        if (isPublished) return 'bg-green-600';
        if (status === 'draft') return 'bg-slate-500';
        if (status === 'review') return 'bg-yellow-500';
        return 'bg-blue-500';
    };

    return (
        <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white">Generated Articles</CardTitle>
                <Button className="bg-blue-600 hover:bg-blue-700">
                    + New Article
                </Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow className="border-slate-800 hover:bg-slate-900/50">
                            <TableHead className="text-slate-400">Headline</TableHead>
                            <TableHead className="text-slate-400">Keyword</TableHead>
                            <TableHead className="text-slate-400">Campaign</TableHead>
                            <TableHead className="text-slate-400">Status</TableHead>
                            <TableHead className="text-slate-400">Score</TableHead>
                            <TableHead className="text-right text-slate-400">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {articles.length > 0 ? articles.map((article) => (
                            <TableRow key={article.id} className="border-slate-800 hover:bg-slate-800/50">
                                <TableCell className="font-medium text-white">
                                    {article.headline}
                                    <div className="text-xs text-slate-500">{article.slug}</div>
                                </TableCell>
                                <TableCell className="text-slate-400">{article.target_keyword}</TableCell>
                                <TableCell className="text-slate-400">{article.campaign?.name || '-'}</TableCell>
                                <TableCell>
                                    <Badge className={`${getStatusColor(article.status, article.is_published)} text-white border-0`}>
                                        {article.is_published ? 'Published' : article.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className={`text-sm font-bold ${article.seo_score > 80 ? 'text-green-400' : 'text-yellow-400'}`}>
                                        {article.seo_score || 0}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                                        Edit
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-slate-500 py-8">
                                    No articles found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
