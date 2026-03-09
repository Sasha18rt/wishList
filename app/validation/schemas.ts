import { z } from "zod";

export const wishSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required"),

    description: z.string().optional(),

    product_url: z.union([
      z.string().url("Invalid URL"),
      z.literal(""),
      z.undefined(),
    ]),

    price: z.string().optional().default(""),

    currency: z
      .string()
      .length(3, "Currency must be a 3-letter code")
      .transform((s) => s.toUpperCase())
      .optional()
      .nullable(),

    image_url: z.union([
      z.string().url("Invalid image URL"),
      z.literal(""),
      z.null(),
      z.undefined(),
    ]),

    image_public_id: z.union([z.string(), z.null(), z.undefined()]),
  })
  .refine(
    (v) => {
      const hasPrice = typeof v.price === "string" && v.price.trim() !== "";
      return hasPrice ? !!v.currency : true;
    },
    {
      path: ["currency"],
      message: "Currency is required when price is set",
    },
  );

export const wishListSchema = z.object({
  title: z
    .string()
    .min(1, { message: "Title is required" })
    .max(100, {
      message: "Title is too long. Maximum length is 100 characters.",
    }),
});
