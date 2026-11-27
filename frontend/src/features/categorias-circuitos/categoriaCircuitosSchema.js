import { z } from 'zod';

export const categoriaCircuitosSchema = z.object({
  field: z.enum(['tipo', 'desgaste', 'categoriaEntrada', 'categoriaGrada']),
  value: z.string().trim().min(1, 'El nombre de la categoría es obligatorio'),
  isActive: z.boolean()
}).transform(({ field, value, isActive }) => ({ [field]: value, isActive }));
