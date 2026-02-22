import { defineCollection, z } from 'astro:content';
const services = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        description: z.string(),
        palette: z.enum(['gold', 'emerald', 'sapphire']).default('gold'),
        publishedAt: z.string().optional(),
        author: z.string().default('Jumpstart Scaling'),
        keyMetrics: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
        order: z.number().optional()
    })
});
const intel = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        description: z.string(),
        palette: z.enum(['gold', 'emerald', 'sapphire']).default('emerald'),
        publishedAt: z.string(),
        author: z.string().default('Jumpstart Scaling'),
        category: z.string().optional(),
        tags: z.array(z.string()).optional()
    })
});
export const collections = { services, intel };
