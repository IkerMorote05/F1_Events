import { z } from 'zod';

const optionalYear = z
  .string()
  .trim()
  .regex(/^\d{0,4}$/, 'El año debe tener cuatro cifras')
  .refine((value) => value === '' || Number(value) >= 1900, 'El año no puede ser anterior a 1900')
  .transform((value) => (value === '' ? undefined : `${value}-01-01`))
  .pipe(z.string().optional());

export const circuitoSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es obligatorio'),
  tipo: z.string().trim().min(1, 'El tipo de circuito es obligatorio'),
  longitud: z.string()
    .trim()
    .regex(/^\d+(\.\d+)?$/, 'La longitud debe ser un número válido')
    .transform(Number)
    .pipe(z.number().finite().min(0, 'La longitud no puede ser negativa')),
  pais: z.string().trim().min(1, 'El país es obligatorio'),
  ultimoGanador: z.string().trim().optional(),
  desgaste: z.string().trim().optional(),
  tiempoVueltaRapida: z.string().trim().optional(),
  pilotoVueltaRapida: z.string().trim().optional(),
  anioVueltaRapida: optionalYear
}).transform(({ tiempoVueltaRapida, pilotoVueltaRapida, anioVueltaRapida, ...circuito }) => {
  const vueltaRapidaFields = [tiempoVueltaRapida, pilotoVueltaRapida, anioVueltaRapida];
  const hasVueltaRapida = vueltaRapidaFields.some(Boolean);

  return {
    ...circuito,
    ...(hasVueltaRapida
      ? {
          vueltaRapida: {
            tiempo: tiempoVueltaRapida,
            piloto: pilotoVueltaRapida,
            anio: anioVueltaRapida
          }
        }
      : {})
  };
}).superRefine((circuito, context) => {
  const vueltaRapida = circuito.vueltaRapida;
  if (!vueltaRapida) return;

  for (const [key, value, label] of [
    ['tiempoVueltaRapida', vueltaRapida.tiempo, 'El tiempo de vuelta rápida'],
    ['pilotoVueltaRapida', vueltaRapida.piloto, 'El piloto de vuelta rápida'],
    ['anioVueltaRapida', vueltaRapida.anio, 'El año de vuelta rápida']
  ]) {
    if (!value) {
      context.addIssue({
        code: 'custom',
        path: [key],
        message: `${label} es obligatorio`
      });
    }
  }
});
