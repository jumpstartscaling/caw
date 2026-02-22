import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit2, Trash2, MapPin, Target } from 'lucide-react';
import { motion } from 'framer-motion';

interface ClusterCardProps {
    cluster: any;
    locations: any[];
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    onTarget: (id: string) => void;
}

export default function ClusterCard({ cluster, locations, onEdit, onDelete, onTarget }: ClusterCardProps) {
    const clusterLocations = locations.filter(l => l.cluster_id === cluster.id);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
        >
            <Card className="bg-zinc-900 border-zinc-800 hover:border-blue-500/50 transition-colors group">
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                    <div>
                        <CardTitle className="text-lg font-bold text-white">{cluster.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-zinc-400 border-zinc-700 bg-zinc-950">
                                {cluster.state || 'US'}
                            </Badge>
                            <span className="text-xs text-zinc-500">
                                {clusterLocations.length} locations
                            </span>
                        </div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white" onClick={() => onEdit(cluster.id)}>
                            <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-red-500" onClick={() => onDelete(cluster.id)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                            {clusterLocations.slice(0, 3).map((loc: any) => (
                                <Badge key={loc.id} variant="secondary" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    {loc.city}
                                </Badge>
                            ))}
                            {clusterLocations.length > 3 && (
                                <Badge variant="outline" className="text-zinc-500 border-zinc-800">
                                    +{clusterLocations.length - 3} more
                                </Badge>
                            )}
                        </div>

                        <Button
                            className="w-full mt-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white"
                            variant="outline"
                            onClick={() => onTarget(cluster.id)}
                        >
                            <Target className="h-4 w-4 mr-2" />
                            Quick Target
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
