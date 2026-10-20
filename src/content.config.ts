import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const projectSchema = z.object({
  slug: z.string().optional(),
  title: z.string(),
  type: z.string(),
  subtype: z.string().optional(),
  tags: z.array(z.string()).optional(),
  github: z.string().url().optional(),
  summary: z.string(),
  publishedAt: z.union([z.string(), z.date()]).transform((value) => new Date(value)),
});

const sessionSchema = z.object({
  slug: z.string().optional(),
  title: z.string(),
  type: z.string(),
  subtype: z.string().optional(),
  summary: z.string(),
  publishedAt: z.union([z.string(), z.date()]).transform((value) => new Date(value)),
});

const projects = defineCollection({ schema: projectSchema });
const sessions = defineCollection({ schema: sessionSchema });

const italianProjects = defineCollection({
  schema: projectSchema,
  loader: glob({
    pattern: '**/*.md',
    base: './src/content/projects-it',
    generateId: ({ entry }) => `it-${entry.replace(/\.md$/, '')}`,
  }),
});

const italianSessions = defineCollection({
  schema: sessionSchema,
  loader: glob({
    pattern: '**/*.md',
    base: './src/content/sessions-it',
    generateId: ({ entry }) => `it-${entry.replace(/\.md$/, '')}`,
  }),
});

export const collections = {
  projects,
  sessions,
  'projects-it': italianProjects,
  'sessions-it': italianSessions,
};
