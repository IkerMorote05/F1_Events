import { z } from 'zod';

const requiredInteger = (label, minimum) => z
  .string()
  .trim()
  .min(1, `${label} es obligatorio`)
  .regex(/^\d+$/, `${label} debe ser un número entero`)
  .transform(Number)
  .pipe(z.number().int().min(minimum, `${label} no puede ser menor que ${minimum}`));

export const pilotoSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es obligatorio'),
  apellidos: z.string().trim().optional(),
  numero: requiredInteger('El número', 0),
  nacionalidad: z.string().trim().min(1, 'La nacionalidad es obligatoria'),
  puntos: requiredInteger('Los puntos', 0),
  escuderia: z.string().min(1, 'Selecciona una escudería'),
  fecha_nacimiento: z.string().optional()
});
