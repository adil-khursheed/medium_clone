import { Id } from "@/convex/_generated/dataModel";

type Post = {
  _id: Id<"posts">;
  _creationTime: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageId?: string;
  coverImageUrl?: string | null;
  authorId: Id<"users">;
  likes: number;
  author: {
    _id: Id<"users">;
    _creationTime: number;
    firstName?: string | undefined;
    lastName?: string | undefined;
    imageUrl?: string | undefined;
    posts?: Id<"posts">[] | undefined;
    email: string;
    clerkUserId: string;
  } | null;
};
