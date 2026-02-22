import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDirectusClient, readItems, deleteItem } from '@/lib/directus/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Map } from 'lucide-react';
import { toast } from 'sonner';

import GeoStats from './GeoStats';
import ClusterCard from './ClusterCard';
import GeoMap from './GeoMap';

export default function GeoIntelligenceManager() {
    const queryClient = useQueryClient();
    const client = getDirectusClient();
    const [search, setSearch] = useState('');
    const [showMap, setShowMap] = useState(true);

    // 1. Fetch Data
    const { data: clusters = [], isLoading: isLoadingClusters } = useQuery({
        queryKey: ['geo_clusters'],
        queryFn: async () => {
            // @ts-ignore
            return await client.request(readItems('geo_clusters', { limit: -1 }));
        }
    });

    const { data: locations = [], isLoading: isLoadingLocations } = useQuery({
        queryKey: ['geo_locations'],
        queryFn: async () => {
            // @ts-ignore
            return await client.request(readItems('geo_locations', { limit: -1 }));
        }
    });

    // 2. Mutations
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            // @ts-ignore
            await client.request(deleteItem('geo_clusters', id));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['geo_clusters'] });
            toast.success('Cluster deleted');
        },
        onError: (err: any) => toast.error(err.message)
    });

    const handleDelete = (id: string) => {
        if (confirm('Delete this cluster and all its locations?')) {
            deleteMutation.mutate(id);
        }
    };

    // 3. Filter
    const filteredClusters = clusters.filter((c: any) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.state?.toLowerCase().includes(search.toLowerCase())
    );

    const filteredLocations = locations.filter((l: any) =>
        l.city?.toLowerCase().includes(search.toLowerCase()) ||
        l.zip?.includes(search)
    );

    // Combine locations for map (either all if no search, or filtered)
    const mapLocations = search ? filteredLocations : locations;

    if (isLoadingClusters || isLoadingLocations) {
        return <div className="p-8 text-zinc-500">Loading Geospatial Data...</div>;
    }

    return (
        <div className="space-y-6">
            <GeoStats clusters={clusters} locations={locations} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: List */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                            <Input
                                placeholder="Search clusters..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 bg-zinc-950 border-zinc-800"
                            />
                        </div>
                        <Button size="icon" variant={showMap ? "secondary" : "ghost"} onClick={() => setShowMap(!showMap)}>
                            <Map className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                        <Button className="w-full bg-blue-600 hover:bg-blue-500 mb-2">
                            <Plus className="mr-2 h-4 w-4" /> New Cluster
                        </Button>

                        {filteredClusters.map((cluster: any) => (
                            <ClusterCard
                                key={cluster.id}
                                cluster={cluster}
                                locations={locations}
                                onEdit={(id) => console.log('Edit', id)}
                                onDelete={handleDelete}
                                onTarget={(id) => toast.info(`Targeting ${cluster.name} for content`)}
                            />
                        ))}
                    </div>
                </div>

                {/* Right Column: Map */}
                <div className="lg:col-span-2 space-y-4">
                    {showMap && (
                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-1 shadow-2xl">
                            {/* Client-side only rendering for map is handled inside GeoMap/Astro usually, 
                   but since this is React component loaded via client:load, it mounts in browser. */}
                            <GeoMap locations={mapLocations} clusters={clusters} />
                        </div>
                    )}

                    {!showMap && (
                        <div className="h-[400px] flex items-center justify-center border border-dashed border-zinc-800 rounded-xl text-zinc-500">
                            Map view hidden
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
