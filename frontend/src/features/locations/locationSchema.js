import { z } from 'zod';

export const locationSchema = z.object({
  pais: z.string().trim().min(1, 'El país es obligatorio'),
  ciudad: z.string().trim().min(1, 'La ciudad es obligatoria'),
  capital: z.string().trim().min(1, 'La capital es obligatoria')
});
