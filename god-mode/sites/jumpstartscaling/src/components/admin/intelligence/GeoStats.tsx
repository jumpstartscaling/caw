import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Globe, MapPin, Navigation, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface GeoStatsProps {
    clusters: any[];
    locations: any[];
}

export default function GeoStats({ clusters, locations }: GeoStatsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-zinc-400 text-sm">Total Clusters</p>
                            <h3 className="text-2xl font-bold text-white">{clusters.length}</h3>
                        </div>
                        <Globe className="h-8 w-8 text-blue-500 opacity-50" />
                    </CardContent>
                </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.3 }}>
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-zinc-400 text-sm">Target Cities</p>
                            <h3 className="text-2xl font-bold text-white">{locations.length}</h3>
                        </div>
                        <MapPin className="h-8 w-8 text-red-500 opacity-50" />
                    </CardContent>
                </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.3 }}>
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-zinc-400 text-sm">Coverage Area</p>
                            <h3 className="text-2xl font-bold text-white">
                                {locations.length > 0 ? (locations.length * 25).toLocaleString() : 0} sq mi
                            </h3>
                        </div>
                        <Navigation className="h-8 w-8 text-green-500 opacity-50" />
                    </CardContent>
                </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.3 }}>
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-zinc-400 text-sm">Market Penetration</p>
                            <h3 className="text-2xl font-bold text-white">
                                {clusters.length > 0 ? 'High' : 'None'}
                            </h3>
                        </div>
                        <TrendingUp className="h-8 w-8 text-purple-500 opacity-50" />
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}