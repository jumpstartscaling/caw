
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'; // Check path/existence later, creating placeholder if needed
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'; // Placeholder
import JobLaunchpad from './JobLaunchpad';
import LiveAssembler from './LiveAssembler';
import ProductionFloor from './ProductionFloor';
import SystemOverview from './SystemOverview';

export default function ContentFactoryDashboard() {
    const [activeTab, setActiveTab] = useState('launchpad');

    return (
        <div className="space-y-6">
            <Tabs defaultValue="launchpad" className="w-full" onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4 max-w-2xl mb-4">
                    <TabsTrigger value="launchpad">🚀 Job Launchpad</TabsTrigger>
                    <TabsTrigger value="assembler">🛠️ Live Assembler</TabsTrigger>
                    <TabsTrigger value="floor">🏭 Production Floor</TabsTrigger>
                    <TabsTrigger value="docs">📚 System Overview</TabsTrigger>
                </TabsList>

                <TabsContent value="launchpad" className="space-y-4">
                    <JobLaunchpad />
                </TabsContent>

                <TabsContent value="assembler" className="space-y-4">
                    <LiveAssembler />
                </TabsContent>

                <TabsContent value="floor" className="space-y-4">
                    <ProductionFloor />
                </TabsContent>

                <TabsContent value="docs" className="space-y-4">
                    <SystemOverview />
                </TabsContent>
            </Tabs>
        </div>
    );
}

