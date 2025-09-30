import { z } from "zod";

export const wishSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    product_url: z
      .string()
      .url("Invalid URL")
      .optional()
      .or(z.literal("")),
    price: z.string().optional().default(""), // рядок або ""
    currency: z
      .string()
      .length(3, "Currency must be a 3-letter code")
      .transform((s) => s.toUpperCase())
      .optional()
      .nullable(), // дозволяємо null/undefined, але див. refine нижче
    image_url: z.string().url().optional().or(z.literal("")),
    image_public_id: z.string().optional(),
  })
  .refine((v) => (v.price ? !!v.currency : true), {
    path: ["currency"],
    message: "Currency is required when price is set",
  });



export const wishListSchema = z.object({
    title: z
      .string()
      .min(1, { message: "Title is required" })
      .max(100, { message: "Title is too long. Maximum length is 100 characters." }),
  });