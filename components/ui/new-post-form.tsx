"use client";

import React, { useCallback, useEffect } from "react";
import { NewPostSchema } from "@/lib/schema";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./form";
import ImageUploader from "./ImageUploader";
import { Input } from "./input";
import ContentInput from "./content-input";
import { Button } from "./button";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";

const NewPostForm = () => {
  const createPost = useMutation(api.posts.createPost);

  const router = useRouter();

  const form = useForm<z.infer<typeof NewPostSchema>>({
    resolver: zodResolver(NewPostSchema),
    defaultValues: {
      title: "",
      slug: "",
      excerpt: "",
      coverImageId: undefined,
      content: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [],
          },
        ],
      },
    },
  });

  const slugTransform = useCallback((value?: string) => {
    if (value && typeof value === "string") {
      return value
        .trim()
        .toLowerCase()
        .replace(/[^a-zA-Z\d\s]+/g, "-")
        .replace(/\s/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "-");
    }

    return "";
  }, []);

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "title") {
        form.setValue("slug", slugTransform(value.title), {
          shouldValidate: true,
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [form, form.watch, slugTransform, form.setValue]);

  const handlePostSubmit = async (data: z.infer<typeof NewPostSchema>) => {
    try {
      console.log(data);

      const postSlug = await createPost({
        ...data,
        content: JSON.stringify(data.content),
      });

      if (!postSlug) throw new Error("Failed to create post!");

      router.push(`/posts/${postSlug}`);
      toast.success("Post created!");
    } catch (error) {
      toast.error(`Error creating post: ${error}`);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handlePostSubmit)}
        className="max-w-2xl w-full mx-auto space-y-5 py-4 px-5">
        <FormField
          name="coverImageId"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cover Image</FormLabel>
              <FormControl>
                <ImageUploader
                  onImageSelected={(storageId) => {
                    field.onChange(storageId);
                  }}
                  value={field.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onInput={(e) => {
                    form.setValue(
                      "slug",
                      slugTransform(e.currentTarget.value),
                      { shouldValidate: true }
                    );
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="excerpt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Excerpt</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <ContentInput
                  defaultContent={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" className="cursor-pointer">
          Create
        </Button>
      </form>
    </Form>
  );
};

export default NewPostForm;
