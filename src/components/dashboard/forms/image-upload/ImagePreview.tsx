
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
      }`}
    >
      {/* Image container */}
      <div className="aspect-square">
        <img
          src={image.url}
          alt="Preview"
          className="w-full h-full object-cover"
        />
      </div>
      
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
      
      {/* Action buttons container */}
      <div className="flex justify-between p-2 bg-gray-50">
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0 hover:bg-gray-200"
          onClick={() => onSetPrimary(image.id)}
          title="Establecer como imagen principal"
        >
          <Star className={`h-4 w-4 ${image.isPrimary ? "fill-primary text-primary" : "text-gray-600"}`} />
        </Button>
        
        <Button
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
