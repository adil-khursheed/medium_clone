import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUserOrThrow } from "./users";

export const deleteFile = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    await ctx.storage.delete(args.storageId);
    return true;
  },
});

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const getImageUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

export const createPost = mutation({
  args: {
    title: v.string(),
    slug: v.string(),
    excerpt: v.string(),
    content: v.string(),
    coverImageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    const data = {
      ...args,
      authorId: user._id,
      likes: 0,
    };

    await ctx.db.insert("posts", data);

    return data.slug;
  },
});

export const getPostBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const post = await ctx.db
      .query("posts")
      .withIndex("bySlug", (q) => q.eq("slug", slug))
      .unique();

    if (!post) {
      return null;
    }

    const author = await ctx.db.get(post.authorId);

    return {
      ...post,
      author,
      ...(post.coverImageId
        ? { coverImageUrl: (await ctx.storage.getUrl(post.coverImageId)) ?? "" }
        : {}),
    };
  },
});

export const likePost = mutation({
  args: { _id: v.id("posts") },
  handler: async (ctx, { _id }) => {
    await getCurrentUserOrThrow(ctx);

    const post = await ctx.db
      .query("posts")
      .withIndex("by_id", (q) => q.eq("_id", _id))
      .unique();

    if (!post) {
      return null;
    }

    await ctx.db.patch(post._id, { likes: post.likes + 1 });
  },
});
