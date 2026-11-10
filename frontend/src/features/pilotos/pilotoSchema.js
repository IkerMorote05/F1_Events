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
  victorias: requiredInteger('Las victorias', 0),
  podios: requiredInteger('Los podios', 0),
  escuderia: z.string(),
  estado: z.enum(['compitiendo', 'agente libre', 'lesion', 'retirado', 'piloto reserva']),
  categoria: z.string().min(1, 'Selecciona una categoría'),
  fecha_nacimiento: z.string().optional()
}).superRefine(({ estado, escuderia }, context) => {
  if (['compitiendo', 'lesion', 'piloto reserva'].includes(estado) && !escuderia) {
    context.addIssue({
      code: 'custom',
      path: ['escuderia'],
      message: `Selecciona una escudería para un piloto ${estado}`
    });
  }
});

export const pilotoImageSchema = z.object({
  _id: z.string().optional(),
  image_url: z.string()
    .trim()
    .min(1, 'La URL de la imagen es obligatoria')
    .refine((value) => {
      try {
        return ['http:', 'https:'].includes(new URL(value).protocol);
      } catch {
        return false;
      }
    }, 'Introduce una URL válida con protocolo HTTP o HTTPS'),
  alt_text: z.string().trim().optional()
});
