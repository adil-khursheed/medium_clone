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

const NewPostForm = () => {
  const form = useForm<z.infer<typeof NewPostSchema>>({
    resolver: zodResolver(NewPostSchema),
    defaultValues: {
      title: "",
      slug: "",
      excerpt: "",
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
  }, [form.watch, slugTransform, form.setValue]);

  const handlePostSubmit = async (data: z.infer<typeof NewPostSchema>) => {
    console.log(data);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handlePostSubmit)}
        className="max-w-2xl w-full mx-auto space-y-5 py-4 px-5">
        <FormField
          name="coverImageUrl"
          control={form.control}
          render={({}) => (
            <FormItem>
              <FormLabel>Cover Image</FormLabel>
              <FormControl>
                <ImageUploader />
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
                  initialContent={field.value}
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
