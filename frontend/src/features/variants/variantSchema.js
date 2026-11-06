import { z } from 'zod';

export const variantSchema = z.object({
  sku: z.string().trim().min(1, 'El SKU es obligatorio'),
  price: z.string().trim().min(1, 'El precio es obligatorio')
    .refine((value) => Number.isFinite(Number(value)), 'El precio debe ser un número válido')
    .refine((value) => Number(value) >= 0, 'El precio no puede ser negativo')
    .transform(Number),
  descripcion: z.string().trim().optional(),
  percentage: z.string().trim().min(1, 'El porcentaje de disponibilidad es obligatorio')
    .refine((value) => Number.isFinite(Number(value)), 'El porcentaje debe ser un número válido')
    .refine((value) => Number(value) >= 0 && Number(value) <= 100, 'El porcentaje debe estar entre 0 y 100')
    .refine((value) => Math.round(Number(value) * 100) === Number(value) * 100, 'Usa como máximo dos decimales')
    .transform(Number),
  categoriaEntrada: z.string().min(1, 'Selecciona una categoría de entrada'),
  categoriaGrada: z.string().min(1, 'Selecciona una categoría de grada')
});
