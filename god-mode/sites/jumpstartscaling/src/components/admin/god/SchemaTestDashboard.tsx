/**
 * Schema Test Dashboard Component
 * 
 * UI for running the God Mode build test and displaying results
 */

import React, { useState } from 'react';

interface TestResults {
    success: boolean;
    steps: {
        schemaValidation: boolean;
        dataSeeding: boolean;
        articleGeneration: boolean;
        outputValidation: boolean;
    };
    metrics: {
        siteId?: string;
        campaignId?: string;
        templateId?: string;
        articleId?: string;
        wordCount?: number;
        fragmentsCreated?: number;
        previewUrl?: string;
    };
    errors: string[];
    warnings: string[];
}

export function SchemaTestDashboard() {
    const [running, setRunning] = useState(false);
    const [results, setResults] = useState<TestResults | null>(null);
    const [logs, setLogs] = useState<string[]>([]);

    const runTest = async () => {
        setRunning(true);
        setLogs([]);
        setResults(null);

        try {
            setLogs(prev => [...prev, '🔷 Starting God Mode Build Test...']);

            const response = await fetch('/api/god/run-build-test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                throw new Error(`Test API failed: ${response.statusText}`);
            }

            const data = await response.json();
            setResults(data);

            if (data.success) {
                setLogs(prev => [...prev, '✅ BUILD TEST PASSED']);
            } else {
                setLogs(prev => [...prev, '❌ BUILD TEST FAILED']);
            }
        } catch (error: any) {
            setLogs(prev => [...prev, `❌ Error: ${error.message}`]);
        } finally {
            setRunning(false);
        }
    };

    return (
        <div className="schema-test-dashboard">
            <div className="test-header">
                <h2>🔷 God Mode Schema Test</h2>
                <p>Validates database schema and tests complete 2000+ word article generation workflow</p>
            </div>

            <div className="test-controls">
                <button
                    onClick={runTest}
                    disabled={running}
                    className={`btn btn-primary ${running ? 'loading' : ''}`}
                >
                    {running ? '⏳ Running Test...' : '🚀 Run Build Test'}
                </button>
            </div>

            {logs.length > 0 && (
                <div className="test-logs">
                    <h3>📋 Test Logs</h3>
                    <div className="log-output">
                        {logs.map((log, i) => (
                            <div key={i} className="log-line">{log}</div>
                        ))}
                    </div>
                </div>
            )}

            {results && (
                <div className={`test-results ${results.success ? 'success' : 'failed'}`}>
                    <h3>{results.success ? '✅ Test Passed' : '❌ Test Failed'}</h3>

                    {/* Steps Progress */}
                    <div className="steps-grid">
                        <div className={`step ${results.steps.schemaValidation ? 'pass' : 'fail'}`}>
                            <span className="step-icon">{results.steps.schemaValidation ? '✅' : '❌'}</span>
                            <span className="step-label">Schema Validation</span>
                        </div>
                        <div className={`step ${results.steps.dataSeeding ? 'pass' : 'fail'}`}>
                            <span className="step-icon">{results.steps.dataSeeding ? '✅' : '❌'}</span>
                            <span className="step-label">Data Seeding</span>
                        </div>
                        <div className={`step ${results.steps.articleGeneration ? 'pass' : 'fail'}`}>
                            <span className="step-icon">{results.steps.articleGeneration ? '✅' : '❌'}</span>
                            <span className="step-label">Article Generation</span>
                        </div>
                        <div className={`step ${results.steps.outputValidation ? 'pass' : 'fail'}`}>
                            <span className="step-icon">{results.steps.outputValidation ? '✅' : '❌'}</span>
                            <span className="step-label">Output Validation</span>
                        </div>
                    </div>

                    {/* Metrics */}
                    {results.metrics && Object.keys(results.metrics).length > 0 && (
                        <div className="metrics-panel">
                            <h4>📊 Test Metrics</h4>
                            <div className="metrics-grid">
                                {results.metrics.siteId && (
                                    <div className="metric">
                                        <span className="label">Site ID:</span>
                                        <code>{results.metrics.siteId}</code>
                                    </div>
                                )}
                                {results.metrics.campaignId && (
                                    <div className="metric">
                                        <span className="label">Campaign ID:</span>
                                        <code>{results.metrics.campaignId}</code>
                                    </div>
                                )}
                                {results.metrics.articleId && (
                                    <div className="metric">
                                        <span className="label">Article ID:</span>
                                        <code>{results.metrics.articleId}</code>
                                    </div>
                                )}
                                {results.metrics.wordCount && (
                                    <div className="metric">
                                        <span className="label">Word Count:</span>
                                        <span className={results.metrics.wordCount >= 2000 ? 'success' : 'warning'}>
                                            {results.metrics.wordCount} words
                                        </span>
                                    </div>
                                )}
                                {results.metrics.fragmentsCreated && (
                                    <div className="metric">
                                        <span className="label">Fragments Created:</span>
                                        <span>{results.metrics.fragmentsCreated}</span>
                                    </div>
                                )}
                            </div>

                            {results.metrics.previewUrl && (
                                <div className="preview-link">
                                    <a
                                        href={results.metrics.previewUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-secondary"
                                    >
                                        🔗 View Preview
                                    </a>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Errors */}
                    {results.errors.length > 0 && (
                        <div className="errors-panel">
                            <h4>❌ Errors</h4>
                            <ul>
                                {results.errors.map((error, i) => (
                                    <li key={i} className="error">{error}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Warnings */}
                    {results.warnings.length > 0 && (
                        <div className="warnings-panel">
                            <h4>⚠️ Warnings</h4>
                            <ul>
                                {results.warnings.map((warning, i) => (
                                    <li key={i} className="warning">{warning}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            <style jsx>{`
                .schema-test-dashboard {
                    padding: 2rem;
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .test-header {
                    margin-bottom: 2rem;
                }

                .test-header h2 {
                    font-size: 2rem;
                    margin-bottom: 0.5rem;
                    color: #667eea;
                }

                .test-header p {
                    color: #666;
                }

                .test-controls {
                    margin-bottom: 2rem;
                }

                .btn {
                    padding: 1rem 2rem;
                    font-size: 1.1rem;
                    font-weight: 600;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .btn-primary {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                }

                .btn-primary:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
                }

                .btn-primary:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .btn-primary.loading::after {
                    content: '';
                    display: inline-block;
                    width: 16px;
                    height: 16px;
                    margin-left: 8px;
                    border: 2px solid white;
                    border-top-color: transparent;
                    border-radius: 50%;
                    animation: spin 0.6s linear infinite;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                .test-logs {
                    margin-bottom: 2rem;
                    background: #1e1e1e;
                    border-radius: 8px;
                    padding: 1rem;
                }

                .test-logs h3 {
                    color: white;
                    margin-bottom: 1rem;
                }

                .log-output {
                    font-family: 'Courier New', monospace;
                    color: #0f0;
                    max-height: 300px;
                    overflow-y: auto;
                }

                .log-line {
                    padding: 0.25rem 0;
                }

                .test-results {
                    background: white;
                    border-radius: 8px;
                    padding: 2rem;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                }

                .test-results.success {
                    border-left: 4px solid #10b981;
                }

                .test-results.failed {
                   border-left: 4px solid #ef4444;
                }

                .steps-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1rem;
                    margin: 1.5rem 0;
                }

                .step {
                    padding: 1rem;
                    border-radius: 6px;
                    background: #f9fafb;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .step.pass {
                    background: #d1fae5;
                    border: 1px solid #10b981;
                }

                .step.fail {
                    background: #fee2e2;
                    border: 1px solid #ef4444;
                }

                .step-icon {
                    font-size: 1.5rem;
                }

                .step-label {
                    font-weight: 500;
                }

                .metrics-panel,
                .errors-panel,
                .warnings-panel {
                    margin-top: 2rem;
                    padding: 1.5rem;
                    border-radius: 6px;
                    background: #f9fafb;
                }

                .metrics-panel h4,
                .errors-panel h4,
                .warnings-panel h4 {
                    margin-bottom: 1rem;
                }

                .metrics-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 1rem;
                }

                .metric {
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                }

                .metric .label {
                    font-size: 0.9rem;
                    color: #666;
                    font-weight: 500;
                }

                .metric code {
                    background: white;
                    padding: 0.5rem;
                    border-radius: 4px;
                    font-family: 'Courier New', monospace;
                    font-size: 0.9rem;
                }

                .metric .success {
                    color: #10b981;
                    font-weight: 600;
                }

                .metric .warning {
                    color: #f59e0b;
                    font-weight: 600;
                }

                .preview-link {
                    margin-top: 1.5rem;
                }

                .btn-secondary {
                    background: white;
                    color: #667eea;
                    border: 2px solid #667eea;
                    text-decoration: none;
                    display: inline-block;
                }

                .btn-secondary:hover {
                    background: #667eea;
                    color: white;
                }

                .errors-panel {
                    background: #fee2e2;
                    border: 1px solid #ef4444;
                }

                .warnings-panel {
                    background: #fef3c7;
                    border: 1px solid #f59e0b;
                }

                ul {
                    margin: 0;
                    padding-left: 1.5rem;
                }

                li.error {
                    color: #dc2626;
                    margin-bottom: 0.5rem;
                }

                li.warning {
                    color: #d97706;
                    margin-bottom: 0.5rem;
                }
            `}</style>
        </div>
    );
}
