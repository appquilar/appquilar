
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
      className={`relative group h-full ${
        image.isPrimary ? "border-primary border-2" : "border-gray-200"
      }`}
    >
      {/* Image container with fixed aspect ratio */}
      <div className="h-full">
        <img
          src={image.url}
          alt="Preview"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Action buttons container */}
      <div className="absolute top-0 right-0 flex justify-between p-2 bg-gray-50/80">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0 hover:bg-gray-200"
          onClick={() => onRemove(image.id)}
          title="Eliminar imagen"
        >
          <X className="h-4 w-4 text-gray-600" />
        </Button>
      </div>
    </div>
  );
};

export default ImagePreview;
