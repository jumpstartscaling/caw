import { useState } from 'react';
import { Search } from 'lucide-react';

interface UnifiedSearchBarProps {
    onSearch: (results: any[]) => void;
    onLoading?: (loading: boolean) => void;
}

export function UnifiedSearchBar({ onSearch, onLoading }: UnifiedSearchBarProps) {
    const [query, setQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!query.trim()) {
            // Empty search = show all
            onSearch([]);
            return;
        }

        setIsSearching(true);
        onLoading?.(true);

        try {
            const response = await fetch('/api/god/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: query.trim(),
                    collections: ['sites', 'pages', 'posts', 'generated_articles'],
                    limit: 100
                })
            });

            const result = await response.json();

            if (result.success) {
                onSearch(result.results || []);
            } else {
                console.error('Search failed:', result.error);
                onSearch([]);
            }
        } catch (error) {
            console.error('Search error:', error);
            onSearch([]);
        } finally {
            setIsSearching(false);
            onLoading?.(false);
        }
    };

    return (
        <form onSubmit={handleSearch} className="mb-6">
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search across all collections... (title, name, content, slug)"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 pl-12 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                {isSearching && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <div className="w-5 h-5 border-2 border-zinc-600 border-t-white rounded-full animate-spin"></div>
                    </div>
                )}
            </div>
            <div className="mt-2 text-xs text-zinc-500">
                Searches: Sites, Pages, Posts, Generated Articles
            </div>
        </form>
    );
}
