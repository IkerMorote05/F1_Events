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
  jefe: z.string().trim().optional(),
  año: optionalInteger('El año', 1900)
});
