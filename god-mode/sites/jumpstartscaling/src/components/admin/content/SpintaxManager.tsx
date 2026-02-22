// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { getDirectusClient } from '@/lib/directus/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Props {
    initialDictionaries?: any[];
}

export default function SpintaxManager({ initialDictionaries = [] }: Props) {
    const [dictionaries, setDictionaries] = useState(initialDictionaries);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dictionaries.map((dict) => (
                    <Card key={dict.id} className="bg-slate-800 border-slate-700">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-white flex justify-between items-center">
                                <span>{dict.category}</span>
                                <Badge className="bg-blue-600">
                                    {(dict.data || []).length} Terms
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                                {(dict.data || []).map((term, i) => (
                                    <Badge key={i} variant="outline" className="text-slate-300 border-slate-600 bg-slate-900/50">
                                        {term}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
