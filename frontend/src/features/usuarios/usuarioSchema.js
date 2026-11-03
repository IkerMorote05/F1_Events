import { z } from 'zod';

const userFields = {
  nombre: z.string().trim().min(1, 'El nombre es obligatorio'),
  apellidos: z.string().trim().min(1, 'Los apellidos son obligatorios'),
  email: z.string().trim().email('Introduce un correo electrónico válido'),
  roles: z.string().min(1, 'Selecciona un rol'),
  avatar: z.string().optional(),
  isActive: z.boolean()
};

export const usuarioCreateSchema = z.object({
  ...userFields,
  password: z.string().min(1, 'La contraseña es obligatoria')
});

export const usuarioUpdateSchema = z.object({
  ...userFields,
  password: z.string().optional()
});
