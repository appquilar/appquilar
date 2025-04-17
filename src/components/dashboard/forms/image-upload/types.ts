
import { Control } from "react-hook-form";
import { ProductFormValues } from "../productFormSchema";

export interface ImageFile {
  id: string;
  file: File;
  url: string;
  isPrimary: boolean;
}

export interface ProductImagesFieldProps {
  control: Control<ProductFormValues>;
}

export interface ImageDropZoneProps {
  isDragging: boolean;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface ImageGalleryProps {
  images: ImageFile[];
  onRemoveImage: (id: string) => void;
  onSetPrimaryImage: (id: string) => void;
}

export interface ImagePreviewProps {
  image: ImageFile;
  onRemove: (id: string) => void;
  onSetPrimary: (id: string) => void;
}
