import { z } from 'zod';

export const variantSchema = z.object({
  sku: z.string().trim().min(1, 'El SKU es obligatorio')
});
