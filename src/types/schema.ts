import { z } from 'zod';

export const UISchemaSchema = z.object({
  pages: z.array(z.object({
    name: z.string(),
    path: z.string(),
    components: z.array(z.object({
      type: z.string(), // accept any component type LLM returns
      name: z.string(),
      fields: z.array(z.string()).optional(),
    })),
    roles: z.array(z.string()),
  })),
});
export type UISchema = z.infer<typeof UISchemaSchema>;

export const APISchemaSchema = z.object({
  endpoints: z.array(z.object({
    path: z.string(),
    method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
    roles: z.array(z.string()),
    payloadFields: z.array(z.string()).optional(),
    responseFields: z.array(z.string()).optional(),
  })),
});
export type APISchema = z.infer<typeof APISchemaSchema>;

export const DBSchemaSchema = z.object({
  tables: z.array(z.object({
    name: z.string(),
    columns: z.array(z.object({
      name: z.string(),
      type: z.string(), // accept any type (int, varchar, text, timestamp, float, uuid, etc.)
      isPrimary: z.boolean().optional(),
      required: z.boolean().optional(),
      references: z.object({ table: z.string(), column: z.string() }).optional(),
    })),
    relations: z.array(z.any()).optional(),
  })),
});
export type DBSchema = z.infer<typeof DBSchemaSchema>;

export const AuthSchemaSchema = z.object({
  strategy: z.string().optional(), // jwt | session | oauth
  roles: z.array(z.string()),
  permissions: z.record(z.string(), z.array(z.string())),
});
export type AuthSchema = z.infer<typeof AuthSchemaSchema>;

export const AppConfigSchema = z.object({
  intent: z.any().optional(),
  architecture: z.any().optional(),
  ui: UISchemaSchema,
  api: APISchemaSchema,
  db: DBSchemaSchema,
  auth: AuthSchemaSchema,
});
export type AppConfig = z.infer<typeof AppConfigSchema>;
