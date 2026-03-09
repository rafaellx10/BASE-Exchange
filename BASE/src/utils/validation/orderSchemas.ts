import { z } from 'zod';

export const orderCreateSchema = z.object({
  instrument: z
    .string()
    .min(1, 'Instrumento é obrigatório')
    .max(50, 'Máximo 50 caracteres'),
  side: z.enum(['BUY', 'SELL']),
  price: z
    .number()
    .positive('Preço deve ser maior que zero')
    .refine(value => !Number.isNaN(value), {
      message: 'Preço deve ser um número válido',
    }),
  quantity: z
    .number()
    .int('Quantidade deve ser inteira')
    .positive('Quantidade deve ser maior que zero')
    .refine(value => !Number.isNaN(value), {
      message: 'Quantidade deve ser um número válido',
    }),
});

export type OrderCreateFormValues = z.infer<typeof orderCreateSchema>;
