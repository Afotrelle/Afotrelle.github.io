import { defineCollection, z } from 'astro:content';

const projects = defineCollection({
  schema: z.object({
    title: z.string(),
    type: z.string(),
    subtype: z.string().optional(),
    summary: z.string(),
    publishedAt: z.union([z.string(), z.date()]).transform((value) => new Date(value)),
  }),
});

const sessions = defineCollection({
  schema: z.object({
    title: z.string(),
    type: z.string(),
    subtype: z.string().optional(),
    summary: z.string(),
    publishedAt: z.union([z.string(), z.date()]).transform((value) => new Date(value)),
  }),
});

export const collections = {
  projects,
  sessions,
};
