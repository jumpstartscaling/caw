import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDirectusClient, readItems } from '@/lib/directus/client';
import { ExternalLink, CheckSquare, Square } from 'lucide-react';

interface ContentTableProps {
    collection: string;
    searchResults?: any[];
    onSelectionChange?: (ids: string[]) => void;
}

export function ContentTable({ collection, searchResults, onSelectionChange }: ContentTableProps) {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    // Fetch data if no search results provided
    const { data, isLoading, refetch } = useQuery({
        queryKey: [collection],
        queryFn: async () => {
            const directus = getDirectusClient();
            return await directus.request(readItems(collection, {
                limit: 100,
                sort: ['-date_created'],
                fields: ['*']
            }));
        },
        enabled: !searchResults
    });

    const items = searchResults?.filter(r => r._collection === collection) || (data as any[]) || [];

    useEffect(() => {
        onSelectionChange?.(selectedIds);
    }, [selectedIds, onSelectionChange]);

    const toggleSelection = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id)
                ? prev.filter(i => i !== id)
                : [...prev, id]
        );
    };

    const toggleAll = () => {
        if (selectedIds.length === items.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(items.map((i: any) => i.id));
        }
    };

    const getPreviewUrl = (item: any) => {
        if (collection === 'sites') return item.url;
        if (collection === 'pages') return `/preview/page/${item.id}`;
        if (collection === 'posts') return `/preview/post/${item.id}`;
        if (collection === 'generated_articles') return `/preview/article/${item.id}`;
        return null;
    };

    const getTitle = (item: any) => {
        return item.title || item.name || item.headline || item.slug || item.id;
    };

    const getStatus = (item: any) => {
        return item.status || item.is_published ? 'published' : 'draft';
    };

    if (isLoading) {
        return (
            <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 animate-pulse">
                        <div className="h-4 bg-zinc-800 rounded w-3/4"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center text-zinc-500">
                No {collection} found
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {/* Header with select all */}
            <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-400">
                <button
                    onClick={toggleAll}
                    className="hover:text-white transition-colors"
                >
                    {selectedIds.length === items.length ? (
                        <CheckSquare className="w-5 h-5 text-green-400" />
                    ) : (
                        <Square className="w-5 h-5" />
                    )}
                </button>
                <span className="flex-1">
                    {items.length} item(s) | {selectedIds.length} selected
                </span>
            </div>

            {/* Items */}
            {items.map((item: any) => {
                const isSelected = selectedIds.includes(item.id);
                const previewUrl = getPreviewUrl(item);
                const title = getTitle(item);
                const status = getStatus(item);

                return (
                    <div
                        key={item.id}
                        className={`flex items-center gap-3 p-4 bg-zinc-900 border rounded-lg transition-all ${isSelected
                            ? 'border-green-500 bg-green-500/10'
                            : 'border-zinc-800 hover:border-zinc-700'
                            }`}
                    >
                        <button
                            onClick={() => toggleSelection(item.id)}
                            className="flex-shrink-0"
                        >
                            {isSelected ? (
                                <CheckSquare className="w-5 h-5 text-green-400" />
                            ) : (
                                <Square className="w-5 h-5 text-zinc-600 hover:text-zinc-400" />
                            )}
                        </button>

                        <div className="flex-1 min-w-0">
                            <div className="font-medium text-white truncate">
                                {title}
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500">
                                <span className={`px-2 py-0.5 rounded ${status === 'published'
                                    ? 'bg-green-500/20 text-green-400'
                                    : status === 'draft'
                                        ? 'bg-blue-500/20 text-blue-400'
                                        : 'bg-zinc-700 text-zinc-400'
                                    }`}>
                                    {status}
                                </span>
                                {item.word_count && (
                                    <span>{item.word_count} words</span>
                                )}
                                {item.location_city && (
                                    <span>📍 {item.location_city}</span>
                                )}
                            </div>
                        </div>

                        {previewUrl && (
                            <a
                                href={previewUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-shrink-0 p-2 text-zinc-400 hover:text-white transition-colors"
                            >
                                <ExternalLink className="w-5 h-5" />
                            </a>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
