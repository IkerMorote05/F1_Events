import { z } from 'zod';

const isHttpUrl = (value) => {
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol);
  } catch {
    return false;
  }
};

export const profileSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es obligatorio'),
  apellidos: z.string().trim().min(1, 'Los apellidos son obligatorios'),
  avatar: z.string().nullable().optional(),
  avatarUrl: z.string()
    .url('Introduce una URL válida para el avatar')
    .refine(isHttpUrl, 'La URL debe usar HTTP o HTTPS')
    .optional(),
  settings: z.record(z.string(), z.unknown()).optional()
});
