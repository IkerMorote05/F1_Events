import { z } from 'zod';

export const rolSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es obligatorio'),
  description: z.string().trim().min(1, 'La descripción es obligatoria')
});
