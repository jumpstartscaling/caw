import React, { useState, useEffect } from 'react';
import { getDirectusClient, readItems } from '@/lib/directus/client';
import { Table } from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function LeadList() {
    const [leads, setLeads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const client = getDirectusClient();
                // @ts-ignore
                const data = await client.request(readItems('leads', { sort: ['-date_created'] }));
                setLeads(data);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        }
        load();
    }, []);

    if (loading) return <div>Loading...</div>;

    return (
        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
            <table className="w-full text-left text-sm text-slate-400">
                <thead className="bg-slate-900/50 text-slate-200 uppercase font-medium">
                    <tr>
                        <th className="px-6 py-3">Name</th>
                        <th className="px-6 py-3">Email</th>
                        <th className="px-6 py-3">Source</th>
                        <th className="px-6 py-3">Date</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                    {leads.map(lead => (
                        <tr key={lead.id} className="hover:bg-slate-700/50 transition-colors">
                            <td className="px-6 py-4 font-medium text-slate-200">
                                {lead.full_name || 'Anonymous'}
                            </td>
                            <td className="px-6 py-4">
                                {lead.email}
                            </td>
                            <td className="px-6 py-4">
                                <Badge variant="outline">{lead.source || 'Direct'}</Badge>
                            </td>
                            <td className="px-6 py-4">
                                {new Date(lead.date_created).toLocaleString()}
                            </td>
                        </tr>
                    ))}
                    {leads.length === 0 && (
                        <tr>
                            <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                No leads found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
