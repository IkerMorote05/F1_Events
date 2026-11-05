import { z } from 'zod';

export const locationSchema = z.object({
  pais: z.string().trim().min(1, 'El país es obligatorio'),
  ciudad: z.string().trim().min(1, 'La ciudad es obligatoria'),
  capital: z.string().trim().min(1, 'La capital es obligatoria')
});

export const locationImageSchema = z.object({
  _id: z.string().optional(),
  image_url: z.string()
    .trim()
    .min(1, 'La URL de la imagen es obligatoria')
    .refine((value) => {
      try {
        return ['http:', 'https:'].includes(new URL(value).protocol);
      } catch {
        return false;
      }
    }, 'Introduce una URL válida con protocolo HTTP o HTTPS'),
  alt_text: z.string().trim().optional()
});
