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

export const usuarioImageSchema = z.object({
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
