"use client";

import {
  EditorBubble,
  EditorCommand,
  EditorCommandEmpty,
  EditorCommandItem,
  EditorCommandList,
  EditorContent,
  EditorRoot,
  handleCommandNavigation,
  handleImageDrop,
  handleImagePaste,
  ImageResizer,
  JSONContent,
} from "novel";
import React, { useState } from "react";
import { defaultExtensions } from "../editor/extensions";
import { slashCommand, suggestionItems } from "../editor/slash-command";
import { ColorSelector } from "../editor/selectors/color-selector";
import { NodeSelector } from "../editor/selectors/node-selectors";
import { LinkSelector } from "../editor/selectors/link-selector";
import { TextButtons } from "../editor/selectors/text-buttons";
import { uploadFn } from "../editor/image-upload";
import { MathSelector } from "../editor/selectors/math-selector";
import { Separator } from "./separator";
import { Post } from "@/lib/types";
import { cn } from "@/lib/utils";

const extensions = [...defaultExtensions, slashCommand];

const ContentInput = ({
  defaultContent,
  onChange,
  editable = true,
  post,
}: {
  defaultContent?: JSONContent;
  onChange?: (value: string) => void;
  post?: Post;
  editable?: boolean;
}) => {
  const [openNode, setOpenNode] = useState(false);
  const [openColor, setOpenColor] = useState(false);
  const [openLink, setOpenLink] = useState(false);

  const initialContent = post?.content
    ? JSON.parse(post.content)
    : defaultContent;

  if (!initialContent) return null;

  return (
    <EditorRoot>
      <EditorContent
        className={cn(
          "min-h-96 rounded-xl dark:bg-input/30 bg-transparent",
          editable ? "border border-input p-3" : ""
        )}
        {...(initialContent && { initialContent })}
        extensions={extensions}
        editorProps={{
          handleDOMEvents: {
            keydown: (_view, event) => handleCommandNavigation(event),
          },
          handlePaste: (view, event) => handleImagePaste(view, event, uploadFn),
          handleDrop: (view, event, _slice, moved) =>
            handleImageDrop(view, event, moved, uploadFn),
          attributes: {
            class:
              "prose prose-lg dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full",
          },
        }}
        onUpdate={({ editor }) => {
          if (onChange) {
            onChange(editor.getHTML());
          }
        }}
        onCreate={({ editor }) => {
          if (!editable) editor.setEditable(editable);
        }}
        slotAfter={<ImageResizer />}
        immediatelyRender={false}>
        <EditorCommand className="z-50 h-auto max-h-[330px] w-72 overflow-y-auto rounded-md border border-muted bg-background px-1 py-2 shadow-md transition-all">
          <EditorCommandEmpty className="px-2 text-muted-foreground">
            No results
          </EditorCommandEmpty>
          <EditorCommandList>
            {suggestionItems.map((item) => (
              <EditorCommandItem
                value={item.title}
                onCommand={(val) => item.command?.(val)}
                className={`flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-accent aria-selected:bg-accent `}
                key={item.title}>
                <div className="flex h-10 w-10 items-center justify-center rounded-md border border-muted bg-background">
                  {item.icon}
                </div>
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </EditorCommandItem>
            ))}
          </EditorCommandList>
        </EditorCommand>

        <EditorBubble className="flex w-fit max-w-[90vw] overflow-hidden rounded border border-muted bg-background shadow-xl">
          <NodeSelector open={openNode} onOpenChange={setOpenNode} />

          <Separator orientation="vertical" />

          <LinkSelector open={openLink} onOpenChange={setOpenLink} />

          <Separator orientation="vertical" />

          <MathSelector />

          <Separator orientation="vertical" />

          <TextButtons />

          <Separator orientation="vertical" />

          <ColorSelector open={openColor} onOpenChange={setOpenColor} />
        </EditorBubble>
      </EditorContent>
    </EditorRoot>
  );
};

export default ContentInput;
