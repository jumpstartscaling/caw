import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { FileText, Calendar, User, Eye, ArrowRight, MoreHorizontal } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';

export interface Article {
    id: string;
    title: string;
    slug: string;
    status: string;
    priority: 'high' | 'medium' | 'low';
    due_date?: string;
    assignee?: string;
    date_created: string;
}

interface ArticleCardProps {
    article: Article;
    onPreview: (id: string) => void;
}

export const ArticleCard = ({ article, onPreview }: ArticleCardProps) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: article.id, data: { status: article.status } });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const getPriorityColor = (p: string) => {
        switch (p) {
            case 'high': return 'bg-red-500/10 text-red-500 border-red-500/20';
            case 'medium': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            case 'low': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            default: return 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20';
        }
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="touch-none group">
            <Card className={cn(
                "bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors shadow-sm",
                isDragging && "opacity-50 ring-2 ring-blue-500"
            )}>
                <CardContent className="p-3 space-y-2">
                    {/* Priority & Date */}
                    <div className="flex justify-between items-start">
                        <Badge variant="outline" className={cn("text-[10px] uppercase px-1.5 py-0 h-5", getPriorityColor(article.priority))}>
                            {article.priority || 'medium'}
                        </Badge>
                        {article.due_date && (
                            <div className="flex items-center text-[10px] text-zinc-500">
                                <Calendar className="h-3 w-3 mr-1" />
                                {new Date(article.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </div>
                        )}
                    </div>

                    {/* Title */}
                    <h4 className="text-sm font-medium text-zinc-200 line-clamp-2 leading-tight">
                        {article.title}
                    </h4>

                    {/* Footer Infos */}
                    <div className="flex items-center justify-between pt-2 border-t border-zinc-800/50 mt-2">
                        <div className="flex items-center gap-2">
                            {article.assignee && (
                                <div className="h-5 w-5 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-400" title={article.assignee}>
                                    <User className="h-3 w-3" />
                                </div>
                            )}
                            <span className="text-[10px] text-zinc-600">
                                {formatDistanceToNow(new Date(article.date_created), { addSuffix: true })}
                            </span>
                        </div>

                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-zinc-400 hover:text-white"
                                onClick={(e) => {
                                    e.stopPropagation(); // prevent drag
                                    onPreview(article.id);
                                }}
                            >
                                <Eye className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
