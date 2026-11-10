import { z } from 'zod';

const numericField = (label) => z.string()
  .trim()
  .min(1, `${label} es obligatorio`)
  .refine((value) => Number.isFinite(Number(value)), `${label} debe ser un número válido`)
  .transform(Number);

export const ticketTypeSchema = z.object({
  sku: z.string().trim().min(1, 'El SKU es obligatorio'),
  circuit: z.string().min(1, 'Selecciona un circuito'),
  race: z.string().min(1, 'Selecciona una carrera'),
  price: numericField('El precio')
    .pipe(z.number().min(0, 'El precio no puede ser negativo')),
  duration: z.string()
    .trim()
    .regex(/^[1-3]$/, 'La duración debe ser de 1, 2 o 3 días')
    .transform(Number),
  category: z.string().min(1, 'Selecciona una variante'),
  estado: z.enum(['Vendida', 'Disponible', 'Reservada', 'Cancelada', 'Reembolsada'])
});
