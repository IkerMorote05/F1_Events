import { z } from 'zod';

export const categoriaCircuitosSchema = z.object({
  field: z.enum(['tipo', 'desgaste']),
  value: z.string().trim().min(1, 'El nombre de la categoría es obligatorio')
}).transform(({ field, value }) => ({ [field]: value }));
