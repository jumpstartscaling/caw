import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ArticleCard, Article } from './ArticleCard';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface KanbanColumnProps {
    id: string;
    title: string;
    articles: Article[];
    color: string;
    onPreview: (id: string) => void;
}

export const KanbanColumn = ({ id, title, articles, color, onPreview }: KanbanColumnProps) => {
    const { setNodeRef, isOver } = useDroppable({
        id: id,
        data: { type: 'column' }
    });

    return (
        <div className="flex flex-col h-full bg-zinc-950/30 rounded-lg p-2 border border-zinc-900/50">
            {/* Header */}
            <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", color)} />
                    <h3 className="font-semibold text-sm text-zinc-300 uppercase tracking-wider">{title}</h3>
                </div>
                <Badge variant="secondary" className="bg-zinc-900 text-zinc-500 rounded-sm px-1.5 h-5 text-xs font-mono">
                    {articles.length}
                </Badge>
            </div>

            {/* List */}
            <div
                ref={setNodeRef}
                className={cn(
                    "flex-1 space-y-3 overflow-y-auto pr-1 min-h-[150px] transition-colors rounded-md",
                    isOver && "bg-zinc-900/50 ring-2 ring-zinc-800"
                )}
            >
                <SortableContext
                    items={articles.map(a => a.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {articles.map((article) => (
                        <ArticleCard
                            key={article.id}
                            article={article}
                            onPreview={onPreview}
                        />
                    ))}
                </SortableContext>

                {articles.length === 0 && (
                    <div className="h-24 flex items-center justify-center border-2 border-dashed border-zinc-800/50 rounded-lg">
                        <span className="text-xs text-zinc-600">Drop here</span>
                    </div>
                )}
            </div>
        </div>
    );
};
