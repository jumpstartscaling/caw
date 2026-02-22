import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SitePagesManager from './SitePagesManager';
import NavigationManager from './NavigationManager';
import ThemeSettings from './ThemeSettings';
import { Card } from '@/components/ui/card';

interface SiteDashboardProps {
    siteId: string;
}

export default function SiteDashboard({ siteId }: SiteDashboardProps) {
    return (
        <Tabs defaultValue="pages" className="space-y-6">
            <TabsList className="bg-zinc-900 border border-zinc-800">
                <TabsTrigger value="pages" className="data-[state=active]:bg-zinc-800">Pages</TabsTrigger>
                <TabsTrigger value="navigation" className="data-[state=active]:bg-zinc-800">Navigation</TabsTrigger>
                <TabsTrigger value="appearance" className="data-[state=active]:bg-zinc-800">Appearance</TabsTrigger>
                <TabsTrigger value="settings" className="data-[state=active]:bg-zinc-800">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="pages" className="space-y-4">
                <SitePagesManager siteId={siteId} siteDomain="example.com" />
            </TabsContent>

            <TabsContent value="navigation">
                <NavigationManager siteId={siteId} />
            </TabsContent>

            <TabsContent value="appearance">
                <ThemeSettings siteId={siteId} />
            </TabsContent>

            <TabsContent value="settings">
                <div className="text-zinc-500 p-8 border border-dashed border-zinc-800 rounded-lg text-center">
                    Advanced site settings coming soon in Milestone 5.
                </div>
            </TabsContent>
        </Tabs>
    );
}
