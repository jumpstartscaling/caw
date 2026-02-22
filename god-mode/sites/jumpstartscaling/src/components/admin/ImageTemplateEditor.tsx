import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';

interface Template {
    id: string;
    name: string;
    svg_source: string;
    is_default: boolean;
    preview?: string;
}

const DEFAULT_SVG = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1e3a8a"/>
      <stop offset="100%" style="stop-color:#7c3aed"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <text x="60" y="280" font-family="Arial, sans-serif" font-size="64" font-weight="bold" fill="white">{title}</text>
  <text x="60" y="360" font-family="Arial, sans-serif" font-size="28" fill="rgba(255,255,255,0.8)">{subtitle}</text>
  <text x="60" y="580" font-family="Arial, sans-serif" font-size="20" fill="rgba(255,255,255,0.6)">{site_name} • {city}, {state}</text>
</svg>`;

export default function ImageTemplateEditor() {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
    const [editedSvg, setEditedSvg] = useState('');
    const [previewData, setPreviewData] = useState({
        title: 'Amazing Article Title Here',
        subtitle: 'Your compelling subtitle goes here',
        site_name: 'Spark Platform',
        city: 'Austin',
        state: 'TX'
    });
    const previewRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchTemplates();
    }, []);

    async function fetchTemplates() {
        try {
            const res = await fetch('/api/media/templates');
            const data = await res.json();
            setTemplates(data.templates || []);

            // Select first template or use default
            if (data.templates?.length > 0) {
                selectTemplate(data.templates[0]);
            } else {
                setEditedSvg(DEFAULT_SVG);
            }
        } catch (err) {
            console.error('Error fetching templates:', err);
            setEditedSvg(DEFAULT_SVG);
        } finally {
            setLoading(false);
        }
    }

    function selectTemplate(template: Template) {
        setSelectedTemplate(template);
        setEditedSvg(template.svg_source);
    }

    function renderPreview() {
        let svg = editedSvg;
        Object.entries(previewData).forEach(([key, value]) => {
            svg = svg.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
        });
        return svg;
    }

    async function saveTemplate() {
        if (!selectedTemplate) return;

        try {
            await fetch(`/api/media/templates/${selectedTemplate.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ svg_source: editedSvg })
            });
            alert('Template saved!');
            fetchTemplates();
        } catch (err) {
            console.error('Error saving template:', err);
        }
    }

    async function createTemplate() {
        const name = prompt('Enter template name:');
        if (!name) return;

        try {
            await fetch('/api/media/templates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, svg_source: DEFAULT_SVG })
            });
            fetchTemplates();
        } catch (err) {
            console.error('Error creating template:', err);
        }
    }

    if (loading) {
        return <Spinner className="py-12" />;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <p className="text-gray-400">
                    Create and manage SVG templates for article feature images.
                </p>
                <Button onClick={createTemplate}>+ New Template</Button>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Template List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Templates</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {templates.map((template) => (
                                <button
                                    key={template.id}
                                    className={`w-full px-4 py-3 rounded-lg text-left transition-colors ${selectedTemplate?.id === template.id
                                            ? 'bg-primary text-white'
                                            : 'bg-gray-700/50 hover:bg-gray-700 text-gray-300'
                                        }`}
                                    onClick={() => selectTemplate(template)}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium">{template.name}</span>
                                        {template.is_default && (
                                            <Badge variant="secondary" className="text-xs">Default</Badge>
                                        )}
                                    </div>
                                </button>
                            ))}
                            {templates.length === 0 && (
                                <p className="text-gray-500 text-center py-4">No templates yet</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* SVG Editor */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>Editor</span>
                            <Button size="sm" onClick={saveTemplate} disabled={!selectedTemplate}>
                                Save Template
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Preview */}
                        <div className="bg-gray-900 rounded-lg p-4">
                            <p className="text-gray-400 text-sm mb-2">Preview (1200x630)</p>
                            <div
                                ref={previewRef}
                                className="w-full aspect-[1200/630] rounded-lg overflow-hidden"
                                dangerouslySetInnerHTML={{ __html: renderPreview() }}
                            />
                        </div>

                        {/* Preview Variables */}
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Title"
                                value={previewData.title}
                                onChange={(e) => setPreviewData({ ...previewData, title: e.target.value })}
                            />
                            <Input
                                label="Subtitle"
                                value={previewData.subtitle}
                                onChange={(e) => setPreviewData({ ...previewData, subtitle: e.target.value })}
                            />
                            <Input
                                label="Site Name"
                                value={previewData.site_name}
                                onChange={(e) => setPreviewData({ ...previewData, site_name: e.target.value })}
                            />
                            <div className="flex gap-2">
                                <Input
                                    label="City"
                                    value={previewData.city}
                                    onChange={(e) => setPreviewData({ ...previewData, city: e.target.value })}
                                />
                                <Input
                                    label="State"
                                    value={previewData.state}
                                    onChange={(e) => setPreviewData({ ...previewData, state: e.target.value })}
                                    className="w-20"
                                />
                            </div>
                        </div>

                        {/* SVG Source */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                SVG Source (use {'{variable}'} for dynamic content)
                            </label>
                            <textarea
                                className="w-full h-64 px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg font-mono text-sm text-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                                value={editedSvg}
                                onChange={(e) => setEditedSvg(e.target.value)}
                            />
                        </div>

                        <div className="text-sm text-gray-500">
                            <strong>Available variables:</strong> {'{title}'}, {'{subtitle}'}, {'{site_name}'},
                            {'{city}'}, {'{state}'}, {'{county}'}, {'{author}'}, {'{date}'}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
