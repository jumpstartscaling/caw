import { useQuery } from '@tanstack/react-query';

interface StatsData {
    sites: number;
    pages: number;
    posts: number;
    articles: number;
}

export function StatsPanel() {
    const { data, isLoading } = useQuery({
        queryKey: ['god-mode-stats'],
        queryFn: async () => {
            const response = await fetch('/api/god/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    collections: ['sites', 'pages', 'posts', 'generated_articles'],
                    limit: 1
                })
            });
            const result = await response.json();

            // Count by collection
            const stats: StatsData = {
                sites: 0,
                pages: 0,
                posts: 0,
                articles: 0
            };

            if (result.results) {
                result.results.forEach((item: any) => {
                    if (item._collection === 'sites') stats.sites++;
                    else if (item._collection === 'pages') stats.pages++;
                    else if (item._collection === 'posts') stats.posts++;
                    else if (item._collection === 'generated_articles') stats.articles++;
                });
            }

            return stats;
        },
        refetchInterval: 30000 // Refresh every 30 seconds
    });

    if (isLoading) {
        return (
            <div className="grid grid-cols-4 gap-4 mb-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 animate-pulse">
                        <div className="h-4 bg-zinc-800 rounded w-20 mb-2"></div>
                        <div className="h-8 bg-zinc-800 rounded w-12"></div>
                    </div>
                ))}
            </div>
        );
    }

    const stats = [
        { label: 'Sites', value: data?.sites || 0, color: 'text-blue-400' },
        { label: 'Pages', value: data?.pages || 0, color: 'text-green-400' },
        { label: 'Posts', value: data?.posts || 0, color: 'text-purple-400' },
        { label: 'Articles', value: data?.articles || 0, color: 'text-yellow-400' }
    ];

    return (
        <div className="grid grid-cols-4 gap-4 mb-6">
            {stats.map((stat) => (
                <div key={stat.label} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                    <div className="text-sm text-zinc-400 mb-1">{stat.label}</div>
                    <div className={`text-3xl font-bold ${stat.color}`}>
                        {stat.value.toLocaleString()}
                    </div>
                </div>
            ))}
        </div>
    );
}
