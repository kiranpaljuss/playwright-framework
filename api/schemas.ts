import { z } from 'zod';

/**
 * Response contracts for the DummyJSON API. Parsing a response with these schemas
 * fails the test if a field is missing, has the wrong type, or breaks a rule,
 * so contract changes are caught even when a test doesn't assert on that field.
 */

export const ProductSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1),
  description: z.string(),
  category: z.string().min(1),
  price: z.number().nonnegative(),
  discountPercentage: z.number().min(0).max(100),
  rating: z.number().min(0).max(5),
  stock: z.number().int().nonnegative(),
  tags: z.array(z.string()),
  brand: z.string().optional(),
  sku: z.string(),
  images: z.array(z.url()),
  thumbnail: z.url()
});

/** The update endpoint returns a product without its tags and SKU. */
export const UpdatedProductSchema = ProductSchema.omit({ tags: true, sku: true });

export const ProductListSchema = z.object({
  products: z.array(ProductSchema),
  total: z.number().int().nonnegative(),
  skip: z.number().int().nonnegative(),
  limit: z.number().int().nonnegative()
});

export const LoginResponseSchema = z.object({
  id: z.number().int().positive(),
  username: z.string(),
  email: z.email(),
  firstName: z.string(),
  lastName: z.string(),
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1)
});

export const UserSchema = z.object({
  id: z.number().int().positive(),
  username: z.string(),
  email: z.email(),
  firstName: z.string(),
  lastName: z.string()
});

const CartItemSchema = z.object({
  id: z.number().int().positive(),
  title: z.string(),
  price: z.number().nonnegative(),
  quantity: z.number().int().positive(),
  total: z.number().nonnegative(),
  discountPercentage: z.number(),
  // The API names this field differently depending on the endpoint.
  discountedTotal: z.number().optional(),
  discountedPrice: z.number().optional()
});

export const CartSchema = z.object({
  id: z.number().int().positive(),
  userId: z.number().int().positive(),
  products: z.array(CartItemSchema),
  total: z.number().nonnegative(),
  discountedTotal: z.number().nonnegative(),
  totalProducts: z.number().int().nonnegative(),
  totalQuantity: z.number().int().nonnegative()
});

export const ErrorSchema = z.object({ message: z.string() });

export type Product = z.infer<typeof ProductSchema>;
export type Cart = z.infer<typeof CartSchema>;
