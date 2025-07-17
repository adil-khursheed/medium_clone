"use client";

import { AlertCircleIcon, ImageIcon, UploadIcon, XIcon } from "lucide-react";

import { useFileUpload, type FileWithPreview } from "@/hooks/use-file-upload";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCallback, useEffect, useRef, useState } from "react";

import { Id } from "@/convex/_generated/dataModel";

interface ImageUploaderProps {
  onImageSelected?: (storageId: Id<"_storage"> | undefined) => void;
  value?: Id<"_storage">;
}

export default function ImageUploader({
  onImageSelected,
  value,
}: ImageUploaderProps) {
  const maxSizeMB = 10;
  const maxSize = maxSizeMB * 1024 * 1024; // 2MB default
  const [storageId, setStorageId] = useState<Id<"_storage"> | undefined>(value);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const generateUploadUrl = useMutation(api.posts.generateUploadUrl);
  const deleteFile = useMutation(api.posts.deleteFile);

  // Track if component is mounted to prevent setState on unmounted component
  const isMounted = useRef(true);
  // Track any ongoing upload for cleanup
  const uploadAbortController = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      isMounted.current = false;
      // Abort any ongoing uploads when component unmounts
      if (uploadAbortController.current) {
        uploadAbortController.current.abort();
      }
    };
  }, []);

  // Get the image URL from Convex storage if we have a storageId
  const getUrl = useQuery(
    api.posts.getImageUrl,
    storageId ? { storageId: storageId } : "skip"
  );

  // Track the last uploaded file name to prevent duplicates
  const lastUploadedFileName = useRef<string | null>(null);

  const handleFileUpload = async (fileWithPreview: FileWithPreview) => {
    // Check if component is still mounted before starting
    if (!isMounted.current || !onImageSelected || !fileWithPreview.file) return;

    // Get the file name for duplicate detection
    const fileName =
      fileWithPreview.file instanceof File ? fileWithPreview.file.name : "";

    // Prevent duplicate uploads if we already have a storageId for this file
    // or if this is the same file we just uploaded
    if (
      (storageId && files[0]?.preview === previewUrl) ||
      (fileName && fileName === lastUploadedFileName.current)
    ) {
      return;
    }

    // Store a local reference to avoid closure issues
    const localOnImageSelected = onImageSelected;

    // Update the last uploaded file name
    lastUploadedFileName.current = fileName;

    try {
      // Check if component is still mounted before generating URL
      if (!isMounted.current) return;

      const postUrl = await generateUploadUrl();

      // Check if component is still mounted after URL generation
      if (!isMounted.current) return;

      // Check if file is a File object (not FileMetadata)
      if (!(fileWithPreview.file instanceof File)) {
        console.error("Expected a File object");
        return;
      }

      // Create a new AbortController for this upload
      if (uploadAbortController.current) {
        uploadAbortController.current.abort(); // Abort any existing upload
      }
      uploadAbortController.current = new AbortController();

      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": fileWithPreview.file.type },
        body: fileWithPreview.file,
        signal: uploadAbortController.current.signal,
      });

      // Check if component is still mounted after fetch
      if (!isMounted.current) {
        // If component unmounted during fetch, try to delete the uploaded file
        try {
          const { storageId: newStorageId } = await result.json();
          await deleteFile({ storageId: newStorageId });
        } catch (cleanupError) {
          // Log cleanup errors in development but don't disrupt the user experience
          if (process.env.NODE_ENV === "development") {
            console.warn("Cleanup error (non-critical):", cleanupError);
          }
        }
        return;
      }

      const { storageId: newStorageId } = await result.json();

      // Only update state if component is still mounted
      if (isMounted.current) {
        // Update local state
        setStorageId(newStorageId);

        // Call the callback with the storageId
        localOnImageSelected(newStorageId);
      } else {
        // If component unmounted after fetch but before state update,
        // try to delete the uploaded file
        try {
          await deleteFile({ storageId: newStorageId });
        } catch (cleanupError) {
          // Log cleanup errors in development but don't disrupt the user experience
          if (process.env.NODE_ENV === "development") {
            console.warn("Cleanup error (non-critical):", cleanupError);
          }
        }
      }

      // Clear the AbortController after successful upload
      uploadAbortController.current = null;
    } catch (error) {
      // Don't log abort errors as they're expected when component unmounts
      if (
        isMounted.current &&
        error instanceof Error &&
        error.name !== "AbortError"
      ) {
        console.error("Error uploading file:", error);
      }

      // Clean up the AbortController
      uploadAbortController.current = null;
    }
  };

  const [
    { files, isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile,
      getInputProps,
    },
  ] = useFileUpload({
    accept: "image/svg+xml,image/png,image/jpeg,image/jpg,image/gif",
    maxSize,
    onFilesChange: (files) => {
      // Only proceed if component is mounted and callback exists
      if (isMounted.current && onImageSelected) {
        if (files.length > 0) {
          // Handle file upload outside of render cycle
          // Use setTimeout to ensure this runs after the current execution context
          // This helps prevent setState errors during rapid component mounting/unmounting
          setTimeout(() => {
            if (isMounted.current) {
              handleFileUpload(files[0]);
            }
          }, 0);
        } else {
          // Store a local reference to avoid closure issues
          const localOnImageSelected = onImageSelected;
          // Use setTimeout to ensure this runs after the current execution context
          setTimeout(() => {
            if (isMounted.current) {
              localOnImageSelected(undefined);
            }
          }, 0);
        }
      }
    },
  });
  // For newly uploaded files, use the preview URL
  // For existing files (from value prop), use the URL from Convex storage
  const previewUrl = files[0]?.preview || imageUrl;

  // Update the storageId when the value prop changes
  useEffect(() => {
    // Only update if component is mounted
    if (!isMounted.current) return;

    // Use a local variable to avoid closure issues
    const newValue = value;

    // Use setTimeout to ensure this runs after the current execution context
    const timeoutId = setTimeout(() => {
      if (isMounted.current) {
        setStorageId(newValue);
      }
    }, 0);

    // Clean up timeout if component unmounts or value changes
    return () => clearTimeout(timeoutId);
  }, [value]);

  // Update the imageUrl when we get a URL from Convex
  useEffect(() => {
    // Only update if we have a URL and component is mounted
    if (!getUrl || !isMounted.current) return;

    // Use a local variable to avoid closure issues
    const newUrl = getUrl;

    // Use setTimeout to ensure this runs after the current execution context
    const timeoutId = setTimeout(() => {
      if (isMounted.current) {
        setImageUrl(newUrl);
      }
    }, 0);

    // Clean up timeout if component unmounts or URL changes
    return () => clearTimeout(timeoutId);
  }, [getUrl]);

  // Handle file removal and deletion from Convex storage
  const handleRemoveFile = useCallback(async () => {
    // Store values locally to avoid closure issues
    const currentStorageId = storageId;
    const currentFileId = files[0]?.id;

    try {
      // Check if component is mounted before proceeding
      if (!isMounted.current) return;

      // First remove the file from the UI if it exists
      if (currentFileId) {
        removeFile(currentFileId);
      }

      // Then delete from Convex storage if we have a storageId
      if (currentStorageId) {
        try {
          // Use the locally stored ID to avoid closure issues
          await deleteFile({ storageId: currentStorageId });
        } catch (error) {
          // Handle case where file might not exist in storage
          console.error("Error deleting file from storage:", error);
          // Continue with UI cleanup even if storage deletion fails
        }
      }

      // Only update state if component is still mounted
      if (isMounted.current) {
        // Clear the local state
        setStorageId(undefined);
        setImageUrl(null);
        lastUploadedFileName.current = null;

        // Call the callback
        if (onImageSelected) {
          onImageSelected(undefined);
        }
      }
    } catch (error) {
      console.error("Error removing file:", error);
    }
  }, [
    files,
    removeFile,
    storageId,
    deleteFile,
    onImageSelected,
    lastUploadedFileName,
  ]);
  // const fileName = files[0]?.file.name || null;

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        {/* Drop area */}
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          data-dragging={isDragging || undefined}
          className="border-input data-[dragging=true]:bg-accent/50 has-[input:focus]:border-ring has-[input:focus]:ring-ring/50 relative flex min-h-52 flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed p-4 transition-colors has-[input:focus]:ring-[3px]">
          <input
            {...getInputProps()}
            className="sr-only"
            aria-label="Upload image file"
          />
          {previewUrl ? (
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <img
                src={previewUrl}
                alt={files[0]?.file?.name || "Uploaded image"}
                className="mx-auto max-h-full rounded object-contain"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center px-4 py-3 text-center">
              <div
                className="bg-background mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border"
                aria-hidden="true">
                <ImageIcon className="size-4 opacity-60" />
              </div>
              <p className="mb-1.5 text-sm font-medium">Drop your image here</p>
              <p className="text-muted-foreground text-xs">
                SVG, PNG, JPG or GIF (max. {maxSizeMB}MB)
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={(e) => {
                  e.preventDefault();
                  openFileDialog();
                }}>
                <UploadIcon
                  className="-ms-1 size-4 opacity-60"
                  aria-hidden="true"
                />
                Select image
              </Button>
            </div>
          )}
        </div>

        {previewUrl && (
          <div className="absolute top-4 right-4">
            <button
              type="button"
              className="focus-visible:border-ring focus-visible:ring-ring/50 z-50 flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white transition-[color,box-shadow] outline-none hover:bg-black/80 focus-visible:ring-[3px]"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Only proceed if component is mounted
                if (isMounted.current) {
                  handleRemoveFile();
                }
              }}
              aria-label="Remove image">
              <XIcon className="size-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      {errors.length > 0 && (
        <div
          className="text-destructive flex items-center gap-1 text-xs"
          role="alert">
          <AlertCircleIcon className="size-3 shrink-0" />
          <span>{errors[0]}</span>
        </div>
      )}
    </div>
  );
}
