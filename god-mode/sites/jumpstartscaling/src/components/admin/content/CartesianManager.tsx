// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { getDirectusClient } from '@/lib/directus/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Props {
    initialPatterns?: any[];
}

export default function CartesianManager({ initialPatterns = [] }: Props) {
    const [patterns, setPatterns] = useState(initialPatterns);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
                {patterns.map((group) => (
                    <Card key={group.id} className="bg-slate-800 border-slate-700">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-white flex justify-between items-center">
                                <span>{group.pattern_key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</span>
                                <Badge variant="outline" className="text-purple-400 border-purple-400">
                                    {group.pattern_type}
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {(group.data || []).map((pattern, i) => (
                                    <div key={i} className="bg-slate-900 p-4 rounded border border-slate-800">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs text-slate-500 uppercase tracking-wider font-mono">
                                                {pattern.id}
                                            </span>
                                        </div>
                                        <div className="space-y-2">
                                            <div>
                                                <div className="text-xs text-slate-500 mb-1">Formula</div>
                                                <code className="block bg-slate-950 p-2 rounded text-green-400 text-sm font-mono break-all">
                                                    {pattern.formula}
                                                </code>
                                            </div>
                                            <div>
                                                <div className="text-xs text-slate-500 mb-1">Example Output</div>
                                                <div className="text-slate-300 text-sm italic">
                                                    "{pattern.example_output}"
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
