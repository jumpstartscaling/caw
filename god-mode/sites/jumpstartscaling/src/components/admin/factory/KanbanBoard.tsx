import React, { useState, useEffect } from 'react';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDirectusClient, readItems, updateItem } from '@/lib/directus/client';
import { KanbanColumn } from './KanbanColumn';
import { ArticleCard, Article } from './ArticleCard';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const client = getDirectusClient();

const COLUMNS = [
    { id: 'queued', title: 'Queued', color: 'bg-indigo-500' },
    { id: 'processing', title: 'Processing', color: 'bg-yellow-500' },
    { id: 'qc', title: 'QC Review', color: 'bg-purple-500' },
    { id: 'approved', title: 'Approved', color: 'bg-green-500' },
    { id: 'published', title: 'Published', color: 'bg-emerald-500' }
];

export default function KanbanBoard() {
    const queryClient = useQueryClient();
    const [items, setItems] = useState<Article[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);

    // 1. Fetch Data
    const { data: fetchedArticles, isLoading } = useQuery({
        queryKey: ['generated_articles_kanban'],
        queryFn: async () => {
            // @ts-ignore
            const res = await client.request(readItems('generated_articles', {
                limit: 100,
                sort: ['-date_created'],
                fields: ['*', 'status', 'priority', 'due_date', 'assignee']
            }));
            return res as unknown as Article[];
        }
    });

    // Sync Query -> Local State
    useEffect(() => {
        if (fetchedArticles) {
            setItems(fetchedArticles);
        }
    }, [fetchedArticles]);

    // 2. Mutation
    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string, status: string }) => {
            // @ts-ignore
            await client.request(updateItem('generated_articles', id, { status }));
        },
        onError: () => {
            toast.error('Failed to move item');
            queryClient.invalidateQueries({ queryKey: ['generated_articles_kanban'] });
        }
    });

    // 3. DnD Sensors
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    // 4. Handlers
    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const isActiveArticle = active.data.current?.sortable?.index !== undefined;
        const isOverArticle = over.data.current?.sortable?.index !== undefined;
        const isOverColumn = over.data.current?.type === 'column';

        if (!isActiveArticle) return;

        // Implements drag over changing column status
        const activeItem = items.find(i => i.id === activeId);
        const overItem = items.find(i => i.id === overId);

        if (!activeItem) return;

        // Moving between different columns
        if (activeItem && isOverColumn) {
            const overColumnId = over.id as string;
            if (activeItem.status !== overColumnId) {
                setItems((items) => {
                    const activeIndex = items.findIndex((i) => i.id === activeId);
                    const newItems = [...items];
                    newItems[activeIndex] = { ...newItems[activeIndex], status: overColumnId };
                    return newItems;
                });
            }
        }
        else if (isActiveArticle && isOverArticle && activeItem.status !== overItem?.status) {
            const overColumnId = overItem?.status as string;
            setItems((items) => {
                const activeIndex = items.findIndex((i) => i.id === activeId);
                const newItems = [...items];
                newItems[activeIndex] = { ...newItems[activeIndex], status: overColumnId };
                // Also could reorder here if we had sorting field
                return arrayMove(newItems, activeIndex, activeIndex);
            });
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const activeItem = items.find(i => i.id === active.id);
        const overColumnId = (over.data.current?.type === 'column' ? over.id : items.find(i => i.id === over.id)?.status) as string;

        if (activeItem && activeItem.status !== overColumnId && COLUMNS.some(c => c.id === overColumnId)) {
            // Persist change
            updateStatusMutation.mutate({ id: activeItem.id, status: overColumnId });
            toast.success(`Moved to ${COLUMNS.find(c => c.id === overColumnId)?.title}`);
        }
    };

    const handlePreview = (id: string) => {
        window.open(`/preview/article/${id}`, '_blank');
    };

    const activeItem = activeId ? items.find((i) => i.id === activeId) : null;

    if (isLoading) return <div className="flex h-96 items-center justify-center text-zinc-500"><Loader2 className="animate-spin mr-2" /> Loading Board...</div>;

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className="flex h-[calc(100vh-200px)] gap-4 overflow-x-auto pb-4">
                {COLUMNS.map((col) => (
                    <div key={col.id} className="w-80 flex-shrink-0">
                        <KanbanColumn
                            id={col.id}
                            title={col.title}
                            color={col.color}
                            articles={items.filter(i => i.status === col.id || (col.id === 'queued' && !['processing', 'qc', 'approved', 'published'].includes(i.status)))}
                            onPreview={handlePreview}
                        />
                    </div>
                ))}
            </div>

            <DragOverlay>
                {activeItem ? (
                    <ArticleCard article={activeItem} onPreview={() => { }} />
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
