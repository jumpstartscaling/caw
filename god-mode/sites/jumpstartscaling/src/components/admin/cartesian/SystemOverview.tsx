
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export default function SystemOverview() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Cartesian System Architecture</CardTitle>
                    <CardDescription>
                        This system generates high-volume, localized content by permuting
                        [Avatars] x [Niches] x [Cities] x [Patterns].
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="schema" className="w-full">
                        <TabsList className="grid w-full grid-cols-5">
                            <TabsTrigger value="schema">1. Schema</TabsTrigger>
                            <TabsTrigger value="engine">2. Engine</TabsTrigger>
                            <TabsTrigger value="ui">3. UI</TabsTrigger>
                            <TabsTrigger value="verification">4. Verification</TabsTrigger>
                            <TabsTrigger value="publisher">5. Publisher</TabsTrigger>
                        </TabsList>

                        <TabsContent value="schema" className="p-4 border rounded-md mt-4 bg-slate-50">
                            <h3 className="font-bold text-lg mb-2">9-Segment Data Architecture</h3>
                            <p className="text-sm text-slate-600 mb-4">
                                Data is stored in Directus across 9 linked collections. The script <code>init_schema.ts</code>
                                handles the initial import.
                            </p>
                            <ul className="list-disc pl-5 space-y-1 text-sm">
                                <li><strong>Avatars:</strong> Define the "Who" (e.g., Scaling Founder).</li>
                                <li><strong>Niches:</strong> Define the "What" (e.g., Vertical SaaS).</li>
                                <li><strong>Locations:</strong> Define the "Where" (Clusters of cities).</li>
                                <li><strong>Patterns:</strong> Logic templates for generating titles/hooks.</li>
                            </ul>
                            <div className="mt-4 bg-slate-900 text-slate-50 p-3 rounded text-xs font-mono">
                                {`// Example Data Relation
Avatar: "Scaling Founder"
  -> Variant: { pronoun: "he", wealth: "high" }
  -> Niche: "SaaS"
City: "Austin, TX"
  -> Cluster: "Silicon Hills"
`}
                            </div>
                        </TabsContent>

                        <TabsContent value="engine" className="p-4 border rounded-md mt-4 bg-slate-50">
                            <h3 className="font-bold text-lg mb-2">The Cartesian Engine</h3>
                            <p className="text-sm text-slate-600 mb-4">
                                Located in <code>lib/cartesian</code>. It processes the combinations.
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="font-semibold text-sm">SpintaxParser</h4>
                                    <p className="text-xs text-slate-500">Recursive selection.</p>
                                    <code className="block bg-slate-200 p-2 rounded text-xs mt-1">
                                        {`{Hi|Hello {World|Friend}} => "Hello Friend"`}
                                    </code>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm">GrammarEngine</h4>
                                    <p className="text-xs text-slate-500">Token resolution.</p>
                                    <code className="block bg-slate-200 p-2 rounded text-xs mt-1">
                                        {`[[PRONOUN]] is [[A_AN:Apple]] => "He is an Apple"`}
                                    </code>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="ui" className="p-4 border rounded-md mt-4 bg-slate-50">
                            <h3 className="font-bold text-lg mb-2">Command Station (UI)</h3>
                            <p className="text-sm text-slate-600 mb-4">
                                Three core tools for managing production:
                            </p>
                            <ul className="money-list space-y-2 text-sm">
                                <li>🚀 <strong>Job Launchpad:</strong> Configure batches. Select Site + Avatars.</li>
                                <li>🛠️ <strong>Live Assembler:</strong> Preview generation logic in real-time.</li>
                                <li>🏭 <strong>Production Floor:</strong> Monitor active jobs and progress.</li>
                            </ul>
                        </TabsContent>

                        <TabsContent value="verification" className="p-4 border rounded-md mt-4 bg-slate-50">
                            <h3 className="font-bold text-lg mb-2">Verification Protocols</h3>
                            <p className="text-sm text-slate-600 mb-4">
                                We run automated scripts to ensure logic integrity before deployment.
                            </p>
                            <div className="bg-green-50 text-green-800 p-3 rounded border border-green-200 text-xs font-mono">
                                {`✅ Spintax Resolved
✅ Grammar Resolved
✅ Logic Verification Passed.`}
                            </div>
                        </TabsContent>

                        <TabsContent value="publisher" className="p-4 border rounded-md mt-4 bg-slate-50">
                            <h3 className="font-bold text-lg mb-2">Publisher Service</h3>
                            <p className="text-sm text-slate-600 mb-4">
                                Handles the "Last Mile" delivery. Pushes generated content from Directus to:
                            </p>
                            <div className="flex gap-4">
                                <Badge variant="outline">WordPress (REST API)</Badge>
                                <Badge variant="outline">Webflow</Badge>
                                <Badge variant="outline">Static HTML</Badge>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
