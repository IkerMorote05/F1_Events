import { z } from 'zod';

export const carreraSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es obligatorio'),
  fecha: z.string().min(1, 'La fecha es obligatoria')
    .refine((value) => !Number.isNaN(Date.parse(value)), 'La fecha no es válida'),
  capacidad: z.string()
    .trim()
    .regex(/^\d+$/, 'La capacidad debe ser un número entero')
    .transform(Number)
    .pipe(z.number().int().min(0, 'La capacidad no puede ser negativa')),
  circuito: z.string().min(1, 'Selecciona un circuito'),
  estado: z.enum(['En vigor', 'Cancelada', 'Aplazada', 'Finalizada'])
});

export const carreraImageSchema = z.object({
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
