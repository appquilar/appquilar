
import { X, Star } from "lucide-react";
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
        image.isPrimary ? "border-primary border-2" : "border-gray-200"
      } cursor-pointer transition-all hover:opacity-95`}
      onClick={() => !image.isPrimary && onSetPrimary(image.id)}
    >
      <div className="aspect-square">
        <img
          src={image.url}
          alt="Preview"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          size="sm"
          variant="destructive"
          className="h-8 w-8 p-0 absolute top-2 right-2"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(image.id);
          }}
        >
          <X className="h-4 w-4" />
        </Button>
        
        {!image.isPrimary && (
          <span className="text-white text-xs bg-black/60 px-2 py-1 rounded">
            Click to set as primary
          </span>
        )}
      </div>
      {image.isPrimary && (
        <div className="absolute top-2 left-2 bg-primary text-white rounded-full px-2 py-1 flex items-center gap-1 text-xs">
          <Star className="h-3 w-3" />
          Principal
        </div>
      )}
    </div>
  );
};

export default ImagePreview;
