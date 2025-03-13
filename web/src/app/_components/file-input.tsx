"use client";

import { Button } from "@/components/ui/button";
import { uploadFileToS3 } from "@/lib/s3-client";
import { api } from "@/trpc/react";
import { Trash2 } from "lucide-react";
import { useRef, useState } from "react";

export function FileInput({
  onError = (error: string) => {},
  maxSize = 2 * 1024 * 1024, // 2MB
  allowedFileExtension,
  previewUrl,
  ...props
}: {
  text: string;
  subtext: string;
  icon: any;
  onImageUpload?: ({ id }: { id: string; file: File }) => void;
  maxSize?: number;
  onError?: (error: string) => void;
  previewUrl?: string | null;
  allowedFileExtension?: ("png" | "jpeg" | "svg")[];
}) {
  const [showPreview, setShowPreview] = useState(!!previewUrl);
  const [image, setImage] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = api.images.getPresignedPost.useMutation({
    onSuccess: async (data) => {
      if (!image) return;
      // Use non-null assertion to guarantee file exists
      const { imageId: id } = await uploadFileToS3(
        image,
        data.presignedPost,
        data.imageId,
      );
      props.onImageUpload?.({ id, file: image });
    },
  });

  const handleFile = (file: File) => {
    // Check allowed file extensions if provided
    if (allowedFileExtension) {
      const fileExtension = file.name.split(".").pop()?.toLowerCase();
      if (
        !fileExtension ||
        !allowedFileExtension.includes(fileExtension as any)
      ) {
        const errorMsg = `File type not allowed. Allowed file types: ${allowedFileExtension.join(", ")}`;
        setError(errorMsg);
        onError(errorMsg);
        return;
      }
    }

    if (file.size > maxSize) {
      const errorMsg = `File size exceeds limit. Maximum allowed is ${(maxSize / (1024 * 1024)).toFixed(2)}MB`;
      setError(errorMsg);
      onError(errorMsg);
      return;
    }
    setImage(file);
    uploadImage.mutate();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    if (!e.target.files[0]) return;
    handleFile(e.target.files[0]);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsHovering(false);
    if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) return;
    if (!e.dataTransfer.files[0]) return;
    handleFile(e.dataTransfer.files[0]);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDragEnter = () => {
    setIsHovering(true);
  };

  const handleDragLeave = () => {
    setIsHovering(false);
  };

  if (previewUrl && showPreview) {
    return (
      <div className="flex flex-col items-center space-y-2 rounded-md border border-border/60 p-10 text-center">
        <img
          src={previewUrl}
          alt={"previewUrl"}
          className="mb-2 max-h-48 object-contain"
        />
        <Button
          type="button"
          variant="destructive"
          onClick={() => {
            setImage(null);
            setShowPreview(false);
          }}
          className="flex items-center gap-2"
        >
          <Trash2 className="size-4" />
          Remove file
        </Button>
      </div>
    );
  }

  // If a file is selected, show the file details with a remove option.
  if (image) {
    const url = URL.createObjectURL(image);
    return (
      <div className="flex flex-col items-center space-y-2 rounded-md border border-border/60 p-10 text-center">
        <span className="block font-semibold">{image.name}</span>
        <img
          src={url}
          alt={image.name}
          className="mb-2 max-h-48 object-contain"
          onLoad={() => URL.revokeObjectURL(url)}
        />
        <span className="block text-sm text-muted-foreground">
          {(image.size / (1024 * 1024)).toFixed(2)} MB
        </span>
        <Button
          type="button"
          variant="destructive"
          onClick={() => {
            setImage(null);
            setError(null);
          }}
          className="flex items-center gap-2"
        >
          <Trash2 className="size-4" />
          Remove file
        </Button>
      </div>
    );
  }

  // Otherwise, display the drop zone with a Browse Files button.
  return (
    <div
      className={`flex w-full flex-col items-center justify-center space-y-6 rounded-md border border-border/60 p-10 ${
        isHovering ? "bg-primary/10" : ""
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
    >
      <input
        type="file"
        ref={inputRef}
        className="hidden"
        onChange={handleInputChange}
      />
      <div className="flex size-20 items-center justify-center space-y-2 rounded-full bg-primary/10 text-primary/50">
        {props.icon}
      </div>
      <div className="flex flex-col items-center justify-center gap-2 text-center">
        <span>{props.text}</span>
        <span
          className={`text-sm ${error ? "text-destructive" : "text-muted-foreground"}`}
        >
          {error || props.subtext}
        </span>
      </div>
      <Button
        type="button"
        variant={"secondary"}
        onClick={() => inputRef.current?.click()}
      >
        Browse Files
      </Button>
    </div>
  );
}
