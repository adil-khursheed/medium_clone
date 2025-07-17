"use client";

import ContentInput from "@/components/ui/content-input";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import { notFound } from "next/navigation";
import React from "react";

const Post = ({ slug }: { slug: string }) => {
  const post = useQuery(api.posts.getPostBySlug, { slug });
  //   const likePost = useMutation(api.posts.likePost);

  if (post === null) {
    notFound();
  }

  if (!post) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <Loader2 size={24} className="animate-spin" />
      </div>
    );
  }

  return (
    <section className="max-w-3xl w-full mx-auto px-5">
      <div>
        <h1>{post.title}</h1>
        <p>{post.excerpt}</p>
      </div>

      <div>
        <ContentInput post={post} editable={false} />
      </div>
    </section>
  );
};

export default Post;
