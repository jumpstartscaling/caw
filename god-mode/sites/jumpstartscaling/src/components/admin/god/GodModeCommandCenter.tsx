import { useState } from 'react';
import { StatsPanel } from './StatsPanel';
import { UnifiedSearchBar } from './UnifiedSearchBar';
import { BulkActionsToolbar } from './BulkActionsToolbar';
import { ContentTable } from './ContentTable';
import { Database, FileText, File, Sparkles } from 'lucide-react';

type TabValue = 'sites' | 'pages' | 'posts' | 'articles';

const TABS = [
    { value: 'sites' as const, label: 'Sites', icon: Database, collection: 'sites' },
    { value: 'pages' as const, label: 'Pages', icon: FileText, collection: 'pages' },
    { value: 'posts' as const, label: 'Posts', icon: File, collection: 'posts' },
    { value: 'articles' as const, label: 'Articles', icon: Sparkles, collection: 'generated_articles' }
];

export function GodModeCommandCenter() {
    const [activeTab, setActiveTab] = useState<TabValue>('sites');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [searchResults, setSearchResults] = useState<any[] | undefined>(undefined);
    const [refreshKey, setRefreshKey] = useState(0);

    const activeCollection = TABS.find(t => t.value === activeTab)?.collection || 'sites';

    const handleActionComplete = () => {
        // Trigger refresh
        setRefreshKey(prev => prev + 1);
        setSelectedIds([]);
        setSearchResults(undefined);
    };

    const handleSearch = (results: any[]) => {
        setSearchResults(results.length > 0 ? results : undefined);
        setSelectedIds([]);
    };

    return (
        <div className="max-w-7xl mx-auto p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">
                    🔱 God Mode Command Center
                </h1>
                <p className="text-zinc-400">
                    Unified control center for managing all sites, pages, posts, and generated articles
                </p>
            </div>

            {/* Stats Panel */}
            <StatsPanel />

            {/* Search Bar */}
            <UnifiedSearchBar onSearch={handleSearch} />

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-zinc-800">
                {TABS.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.value;

                    return (
                        <button
                            key={tab.value}
                            onClick={() => {
                                setActiveTab(tab.value);
                                setSelectedIds([]);
                            }}
                            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all ${isActive
                                    ? 'border-white text-white'
                                    : 'border-transparent text-zinc-500 hover:text-zinc-300'
                                }`}
                        >
                            <Icon className="w-5 h-5" />
                            <span className="font-medium">{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Bulk Actions Toolbar */}
            <BulkActionsToolbar
                selectedIds={selectedIds}
                collection={activeCollection}
                onActionComplete={handleActionComplete}
            />

            {/* Content Table */}
            <ContentTable
                key={`${activeCollection}-${refreshKey}`}
                collection={activeCollection}
                searchResults={searchResults}
                onSelectionChange={setSelectedIds}
            />

            {/* Footer Info */}
            <div className="mt-6 p-4 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-500">
                <div className="font-medium text-zinc-400 mb-2">God Mode Features:</div>
                <ul className="space-y-1 ml-4">
                    <li>• Search across all collections (sites, pages, posts, articles)</li>
                    <li>• Bulk publish, draft, archive, or delete items</li>
                    <li>• Direct database access via God Mode API</li>
                    <li>• Real-time stats and live preview links</li>
                </ul>
            </div>
        </div>
    );
}
