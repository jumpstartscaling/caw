// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { getDirectusClient } from '@/lib/directus/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function LogViewer() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadLogs();
    }, []);

    const loadLogs = async () => {
        try {
            const directus = await getDirectusClient();
            const response = await directus.request({
                method: 'GET',
                path: '/activity',
                params: {
                    limit: 50,
                    sort: '-timestamp'
                }
            });
            setLogs(response.data || []);
            setLoading(false);
        } catch (error) {
            console.error('Error loading logs:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-white">Loading System Logs...</div>;
    }

    return (
        <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
                <CardTitle className="text-white flex justify-between items-center">
                    <span>Recent Activity</span>
                    <Badge variant="outline" className="text-slate-400">
                        Last 50 Events
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border border-slate-700">
                    <Table>
                        <TableHeader className="bg-slate-900">
                            <TableRow className="border-slate-700 hover:bg-slate-900">
                                <TableHead className="text-slate-400">Action</TableHead>
                                <TableHead className="text-slate-400">Collection</TableHead>
                                <TableHead className="text-slate-400">Timestamp</TableHead>
                                <TableHead className="text-slate-400">User/IP</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs.map((log) => (
                                <TableRow key={log.id} className="border-slate-700 hover:bg-slate-700/50">
                                    <TableCell>
                                        <Badge
                                            className={
                                                log.action === 'create' ? 'bg-green-600' :
                                                    log.action === 'update' ? 'bg-blue-600' :
                                                        log.action === 'delete' ? 'bg-red-600' :
                                                            'bg-slate-600'
                                            }
                                        >
                                            {log.action}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-mono text-xs text-slate-300">
                                        {log.collection}
                                    </TableCell>
                                    <TableCell className="text-slate-400 text-xs">
                                        {new Date(log.timestamp).toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-slate-500 text-xs font-mono">
                                        <div>{log.ip}</div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
