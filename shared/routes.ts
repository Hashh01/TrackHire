import { z } from 'zod';
import { insertApplicationSchema, insertInterviewSchema, applications, interviews } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  applications: {
    list: {
      method: 'GET' as const,
      path: '/api/applications',
      input: z.object({
        search: z.string().optional(),
        status: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof applications.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/applications/:id',
      responses: {
        200: z.custom<typeof applications.$inferSelect & { interviews: typeof interviews.$inferSelect[] }>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/applications',
      input: insertApplicationSchema,
      responses: {
        201: z.custom<typeof applications.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/applications/:id',
      input: insertApplicationSchema.partial(),
      responses: {
        200: z.custom<typeof applications.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/applications/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  interviews: {
    create: {
      method: 'POST' as const,
      path: '/api/interviews',
      input: insertInterviewSchema,
      responses: {
        201: z.custom<typeof interviews.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/interviews/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  stats: {
    get: {
      method: 'GET' as const,
      path: '/api/stats',
      responses: {
        200: z.object({
          total: z.number(),
          applied: z.number(),
          interviewing: z.number(),
          offered: z.number(),
          rejected: z.number(),
        }),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type ApplicationInput = z.infer<typeof api.applications.create.input>;
export type InterviewInput = z.infer<typeof api.interviews.create.input>;
