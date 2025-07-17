import React from "react";
import Post from "./_components/Post";

const Page = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;

  return <Post slug={slug} />;
};

export default Page;
