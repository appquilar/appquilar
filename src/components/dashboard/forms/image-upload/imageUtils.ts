
import { toast } from "sonner";
import { ImageFile } from "./types";

export const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
export const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png"];
export const MAX_IMAGES = 1; // Changed from 5 to 1

export const validateAndProcessFiles = (
  files: File[], 
  currentImages: ImageFile[]
): ImageFile[] => {
  if (currentImages.length + files.length > MAX_IMAGES) {
    toast.error(`Solo puedes subir una imagen`);
    return [];
  }

  const validFiles = files.filter((file) => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast.error(`El archivo ${file.name} no es una imagen válida (JPEG/PNG)`);
      return false;
    }
    
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`El archivo ${file.name} excede el tamaño máximo de 2MB`);
      return false;
    }
    
    return true;
  });

  return validFiles.map((file) => ({
    id: crypto.randomUUID(),
    file,
    url: URL.createObjectURL(file),
    isPrimary: true,
  }));
};
