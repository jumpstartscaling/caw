import { useState } from 'react';
import { CheckSquare, Square, Trash2, Archive, Eye, EyeOff } from 'lucide-react';

interface BulkActionsToolbarProps {
    selectedIds: string[];
    collection: string;
    onActionComplete?: () => void;
}

export function BulkActionsToolbar({ selectedIds, collection, onActionComplete }: BulkActionsToolbarProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [lastAction, setLastAction] = useState('');

    const handleBulkAction = async (action: string) => {
        if (selectedIds.length === 0) {
            alert('No items selected');
            return;
        }

        const confirmMessage = `${action.toUpperCase()} ${selectedIds.length} item(s)?`;
        if (action === 'delete' && !confirm(`⚠️ ${confirmMessage}\nThis cannot be undone!`)) {
            return;
        } else if (!confirm(confirmMessage)) {
            return;
        }

        setIsProcessing(true);
        setLastAction(action);

        try {
            const response = await fetch('/api/god/bulk-actions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action,
                    collection,
                    ids: selectedIds
                })
            });

            const result = await response.json();

            if (result.success) {
                alert(`✅ ${action.toUpperCase()} completed\n✓ Success: ${result.results.success}\n✗ Failed: ${result.results.failed}`);
                onActionComplete?.();
            } else {
                alert(`❌ Action failed: ${result.error}`);
            }
        } catch (error) {
            console.error('Bulk action error:', error);
            alert('❌ Action failed. Check console for details.');
        } finally {
            setIsProcessing(false);
            setLastAction('');
        }
    };

    if (selectedIds.length === 0) {
        return (
            <div className="mb-4 p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-500 text-sm flex items-center gap-2">
                <Square className="w-4 h-4" />
                <span>Select items to perform bulk actions</span>
            </div>
        );
    }

    return (
        <div className="mb-4 p-3 bg-zinc-900 border border-zinc-800 rounded-lg">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                    <CheckSquare className="w-4 h-4 text-green-400" />
                    <span>{selectedIds.length} item(s) selected</span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleBulkAction('publish')}
                        disabled={isProcessing}
                        className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Eye className="w-4 h-4" />
                        Publish
                    </button>

                    <button
                        onClick={() => handleBulkAction('draft')}
                        disabled={isProcessing}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <EyeOff className="w-4 h-4" />
                        Draft
                    </button>

                    <button
                        onClick={() => handleBulkAction('archive')}
                        disabled={isProcessing}
                        className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Archive className="w-4 h-4" />
                        Archive
                    </button>

                    <button
                        onClick={() => handleBulkAction('delete')}
                        disabled={isProcessing}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete
                    </button>
                </div>
            </div>

            {isProcessing && (
                <div className="mt-2 text-xs text-zinc-400 flex items-center gap-2">
                    <div className="w-3 h-3 border-2 border-zinc-600 border-t-white rounded-full animate-spin"></div>
                    Processing {lastAction}...
                </div>
            )}
        </div>
    );
}
