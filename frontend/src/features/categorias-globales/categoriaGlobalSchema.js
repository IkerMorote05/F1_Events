import { z } from 'zod';

export const categoriaGlobalSchema = z.object({
  competicion: z.string().trim().min(1, 'El nombre de la competición es obligatorio')
});
