import { z } from "zod";

export const wishSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Name is required" })
    .max(15, { message: "Title is too long. Maximum length is 15 characters." }),

  description: z
    .string()
    .max(100, { message: "Description is too long. Maximum length is 100 characters." })
    .optional(),

  price: z.preprocess(
    (val) => (typeof val === "number" ? val.toString() : val),
    z.string()
      .max(12, { message: "Price is too big. Maximum length is 12 characters." })
      .optional()
  ),

  image_url: z.preprocess(
    (val) => {
      if (typeof val === "string" && val.trim() === "") return undefined;
      return val;
    },
    z.string().url({ message: "Invalid URL" }).optional()
  ),
  
  image_public_id: z.preprocess(
    (val) => {
      if (typeof val === "string" && val.trim() === "") return undefined;
      return val;
    },
    z.string().optional()
  ),
  

  product_url: z.preprocess(
    (val) => {
      if (typeof val === "string" && val.trim() === "") return undefined;
      return val;
    },
    z.string().url({ message: "Invalid URL" }).optional()
  ),
});


export const wishListSchema = z.object({
    title: z
      .string()
      .min(1, { message: "Title is required" })
      .max(15, { message: "Title is too long. Maximum length is 15 characters." }),
  });