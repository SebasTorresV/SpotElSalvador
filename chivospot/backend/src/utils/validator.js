import { z } from 'zod';

export function validate(schema, data) {
  try {
    return schema.parse(data);
  } catch (error) {
    const message = error.issues?.map((issue) => issue.message).join(', ') || 'Datos inválidos';
    const err = new Error(message);
    err.status = 400;
    throw err;
  }
}

export const schemas = {
  register: z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
    nombre: z.string().min(1, 'Nombre requerido'),
  }),
  login: z.object({
    email: z.string().email(),
    password: z.string().min(8),
  }),
  eventQuery: z.object({
    q: z.string().optional(),
    department_id: z.string().optional(),
    municipality_id: z.string().optional(),
    category_id: z.array(z.string()).optional(),
    free_only: z.union([z.string(), z.boolean()]).optional(),
    price_max: z.string().optional(),
    date_from: z.string().optional(),
    date_to: z.string().optional(),
    bbox: z.string().optional(),
    lat: z.string().optional(),
    lng: z.string().optional(),
    order: z.string().optional(),
    limit: z.string().optional(),
    offset: z.string().optional(),
  }),
};
