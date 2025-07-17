import { JSONContent } from "novel";
import { z } from "zod";

export const NewPostSchema = z.object({
  title: z.string().min(1, "Please enter a title"),
  slug: z.string().min(1, "Slug is required"),
  excerpt: z.string().min(1, "Please enter an excerpt"),
  // This will store the Convex storage ID
  coverImageId: z.any().optional(), // Using any to accommodate Id<"_storage"> type
  content: z.custom<JSONContent>(),
});
