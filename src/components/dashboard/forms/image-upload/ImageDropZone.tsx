
import { Plus } from "lucide-react";
import { useRef } from "react";

interface ImageDropZoneProps {
  isDragging: boolean;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ImageDropZone = ({
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileChange,
}: ImageDropZoneProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
        isDragging
          ? "border-primary bg-primary/5"
          : "border-gray-300 hover:border-primary"
      }`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <div className="flex flex-col items-center space-y-2">
        <Plus className="h-8 w-8 text-muted-foreground" />
        <div className="text-sm text-muted-foreground">
          <span className="font-medium">Haz clic para subir</span> o arrastra y suelta
        </div>
        <p className="text-xs text-muted-foreground">
          JPEG o PNG, máximo 2MB (Máximo 5 imágenes)
        </p>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileChange}
        accept="image/jpeg, image/png"
        multiple
        className="hidden"
        value=""
      />
    </div>
  );
};

export default ImageDropZone;
