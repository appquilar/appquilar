
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
      {/* Image container */}
      <div className="aspect-square">
        <img
          src={image.url}
          alt="Preview"
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Remove button - positioned completely outside the image container */}
      <Button
        size="sm"
        variant="destructive"
        className="absolute -top-3 -right-3 translate-x-1/2 translate-y-[-50%] h-7 w-7 p-0 rounded-full shadow-md z-30"
        onClick={(e) => {
          e.stopPropagation();
          onRemove(image.id);
        }}
      >
        <X className="h-3 w-3" />
      </Button>
      
      {/* Principal badge */}
      {image.isPrimary && (
        <div 
          className="absolute top-2 left-2 bg-primary text-white rounded-full px-2 py-1 flex items-center gap-1 text-xs"
          style={{ zIndex: 20 }}
        >
          <Star className="h-3 w-3" />
          Principal
        </div>
      )}
    </div>
  );
};

export default ImagePreview;
