import { z } from 'zod';
import { insertChallengeSchema, challenges, leaderboard } from './schema';

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
  challenges: {
    list: {
      method: 'GET' as const,
      path: '/api/challenges',
      responses: {
        200: z.array(z.custom<typeof challenges.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/challenges',
      input: insertChallengeSchema,
      responses: {
        201: z.custom<typeof challenges.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/challenges/:id',
      responses: {
        200: z.custom<typeof challenges.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  leaderboard: {
    list: {
      method: 'GET' as const,
      path: '/api/leaderboard',
      responses: {
        200: z.array(z.custom<typeof leaderboard.$inferSelect>()),
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

export type ChallengeInput = z.infer<typeof api.challenges.create.input>;
export type ChallengeResponse = z.infer<typeof api.challenges.create.responses[201]>;
