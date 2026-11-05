import { z } from 'zod';

const optionalInteger = (label, minimum = 0) => z
  .string()
  .trim()
  .regex(/^\d*$/, `${label} debe ser un número entero`)
  .transform((value) => (value === '' ? undefined : Number(value)))
  .pipe(z.number().int().min(minimum, `${label} no puede ser menor que ${minimum}`).optional());

export const escuderiaSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es obligatorio'),
  pais: z.string().trim().min(1, 'El país es obligatorio'),
  motor: z.string().trim().min(1, 'El motor es obligatorio'),
  categoria: z.string().min(1, 'Selecciona una categoría'),
  siglas: z.string().trim().optional(),
  jefe: z.string().trim().optional(),
  año: optionalInteger('El año', 1900)
});

export const escuderiaImageSchema = z.object({
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
