import { useState, useEffect } from 'react';

interface SystemStatus {
    coreApi: 'online' | 'offline' | 'checking';
    database: 'connected' | 'disconnected' | 'checking';
    wpConnection: 'ready' | 'error' | 'checking';
}

interface LogEntry {
    time: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
}

export default function SystemStatusBar() {
    const [status, setStatus] = useState<SystemStatus>({
        coreApi: 'checking',
        database: 'checking',
        wpConnection: 'checking'
    });

    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [showLogs, setShowLogs] = useState(false);

    useEffect(() => {
        checkStatus();
        const interval = setInterval(checkStatus, 30000);
        return () => clearInterval(interval);
    }, []);

    const addLog = (message: string, type: LogEntry['type']) => {
        const newLog: LogEntry = {
            time: new Date().toLocaleTimeString(),
            message,
            type
        };
        setLogs(prev => [newLog, ...prev].slice(0, 50));
    };

    const checkStatus = async () => {
        try {
            // We check OUR OWN backend API route which can then proxy/check other services or just confirm this server is up.
            // This avoids CORS issues and ensures the frontend server is actually serving API routes correctly.
            const response = await fetch('/api/system/health');

            if (response.ok) {
                setStatus({
                    coreApi: 'online',
                    database: 'connected',
                    wpConnection: 'ready'
                });
                addLog('System check passed', 'success');
            } else {
                throw new Error(`Health check failed: ${response.status}`);
            }
        } catch (error) {
            console.error('Status check failed:', error);
            setStatus({
                coreApi: 'offline',
                database: 'disconnected',
                wpConnection: 'error'
            });
            addLog(`System check failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
        }
    };

    const getStatusColor = (state: string) => {
        switch (state) {
            case 'online':
            case 'connected':
            case 'ready':
                return 'text-green-400';
            case 'offline':
            case 'disconnected':
            case 'error':
                return 'text-red-400';
            case 'checking':
                return 'text-yellow-400';
            default:
                return 'text-slate-400';
        }
    };

    const getLogColor = (type: LogEntry['type']) => {
        switch (type) {
            case 'success':
                return 'text-green-400';
            case 'error':
                return 'text-red-400';
            case 'warning':
                return 'text-yellow-400';
            default:
                return 'text-slate-400';
        }
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-titanium border-t border-edge-normal shadow-xl">
            <div className="container mx-auto px-4 py-3">
                <div className="flex items-center justify-between gap-4">
                    <h3 className="spark-label text-white">API & Logistics</h3>

                    <div className="flex items-center gap-6 flex-1">
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-silver">Core API</span>
                            <span className={getStatusColor(status.coreApi)}>
                                {status.coreApi.charAt(0).toUpperCase() + status.coreApi.slice(1)}
                            </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-silver">Database (Directus)</span>
                            <span className={getStatusColor(status.database)}>
                                {status.database.charAt(0).toUpperCase() + status.database.slice(1)}
                            </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-silver">WP Connection</span>
                            <span className={getStatusColor(status.wpConnection)}>
                                {status.wpConnection.charAt(0).toUpperCase() + status.wpConnection.slice(1)}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowLogs(!showLogs)}
                        className="spark-btn-ghost text-sm"
                    >
                        {showLogs ? 'Hide' : 'Show'} Processing Log
                    </button>
                </div>
            </div>

            {showLogs && (
                <div className="border-t border-edge-subtle bg-void">
                    <div className="container mx-auto px-4 py-3 max-h-48 overflow-y-auto">
                        <div className="space-y-1">
                            {logs.length === 0 ? (
                                <div className="text-sm text-silver/50 italic">No recent activity</div>
                            ) : (
                                logs.map((log, index) => (
                                    <div key={index} className="flex items-start gap-2 text-sm font-mono">
                                        <span className="text-silver/50 shrink-0">[{log.time}]</span>
                                        <span className={getLogColor(log.type)}>{log.message}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
