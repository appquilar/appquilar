
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageFile } from "./types";

interface ImagePreviewProps {
  image: ImageFile;
  onRemove: (id: string) => void;
  onSetPrimary: (id: string) => void;
}

const ImagePreview = ({ image, onRemove, onSetPrimary }: ImagePreviewProps) => {
  return (
    <div
      key={image.id}
      className={`relative group rounded-lg overflow-hidden border ${
        image.isPrimary ? "border-primary" : "border-gray-200"
      }`}
    >
      <div className="aspect-square">
        <img
          src={image.url}
          alt="Preview"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex flex-col gap-2">
          <Button
            size="sm"
            variant="destructive"
            className="h-8 w-8 p-0"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(image.id);
            }}
          >
            <X className="h-4 w-4" />
          </Button>
          {!image.isPrimary && (
            <Button
              size="sm"
              variant="default"
              className="h-auto py-1 px-2 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                onSetPrimary(image.id);
              }}
            >
              Hacer principal
            </Button>
          )}
        </div>
      </div>
      {image.isPrimary && (
        <div className="absolute top-1 right-1 bg-primary text-white text-xs rounded-full px-2 py-1">
          Principal
        </div>
      )}
    </div>
  );
};

export default ImagePreview;
