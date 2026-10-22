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
  circuito: z.string().min(1, 'Selecciona un circuito')
});
