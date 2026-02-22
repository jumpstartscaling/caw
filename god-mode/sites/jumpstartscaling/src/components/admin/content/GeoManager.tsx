// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { getDirectusClient } from '@/lib/directus/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Props {
    initialClusters?: any[];
}

export default function GeoManager({ initialClusters = [] }: Props) {
    const [clusters, setClusters] = useState(initialClusters);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clusters.map((cluster) => (
                    <Card key={cluster.id} className="bg-slate-800 border-slate-700">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-white flex justify-between items-start">
                                <span>{cluster.data?.cluster_name || cluster.cluster_key}</span>
                            </CardTitle>
                            <code className="text-xs text-green-400 bg-slate-900 px-2 py-1 rounded inline-block">
                                {cluster.cluster_key}
                            </code>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <div className="text-xs text-slate-500 mb-2">Target Cities</div>
                                    <div className="space-y-2">
                                        {(cluster.data?.cities || []).map((city, i) => (
                                            <div key={i} className="flex items-center justify-between text-sm bg-slate-900 p-2 rounded border border-slate-800">
                                                <span className="text-slate-200">
                                                    {city.city}, {city.state}
                                                </span>
                                                {city.neighborhood && (
                                                    <Badge variant="outline" className="text-xs text-blue-400 border-blue-900 bg-blue-900/20">
                                                        {city.neighborhood}
                                                    </Badge>
                                                )}
                                                {city.zip_focus && (
                                                    <Badge variant="outline" className="text-xs text-purple-400 border-purple-900 bg-purple-900/20">
                                                        {city.zip_focus}
                                                    </Badge>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
