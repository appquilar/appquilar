
import { useState, useRef } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Control } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ProductFormValues } from "./productFormSchema";
import { Plus, X, Check, ImageIcon } from "lucide-react";

interface ProductImagesFieldProps {
  control: Control<ProductFormValues>;
}

export type ImageFile = {
  id: string;
  file: File;
  url: string;
  isPrimary: boolean;
};

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png"];
const MAX_IMAGES = 5;

const ProductImagesField = ({ control }: ProductImagesFieldProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [images, setImages] = useState<ImageFile[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      handleFiles(Array.from(files));
    }
    // Reset the input value to allow re-uploading the same file
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFiles = (files: File[]) => {
    if (images.length + files.length > MAX_IMAGES) {
      toast.error(`Solo puedes subir un máximo de ${MAX_IMAGES} imágenes`);
      return;
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

    const newImages = validFiles.map((file) => ({
      id: crypto.randomUUID(),
      file,
      url: URL.createObjectURL(file),
      isPrimary: images.length === 0 && validFiles.length === 1, // If this is the first image, mark it as primary
    }));

    setImages((prevImages) => [...prevImages, ...newImages]);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const removeImage = (id: string) => {
    const imageToRemove = images.find(img => img.id === id);
    
    setImages((prevImages) => {
      // Filter out the image to remove
      const filteredImages = prevImages.filter((image) => image.id !== id);
      
      // If we're removing the primary image, set a new primary if there are remaining images
      if (imageToRemove?.isPrimary && filteredImages.length > 0) {
        return filteredImages.map((image, index) => ({
          ...image,
          isPrimary: index === 0 // Make the first remaining image primary
        }));
      }
      
      return filteredImages;
    });
    
    // Revoke the object URL to avoid memory leaks
    if (imageToRemove) {
      URL.revokeObjectURL(imageToRemove.url);
    }
  };

  const setPrimaryImage = (id: string) => {
    setImages((prevImages) =>
      prevImages.map((image) => ({
        ...image,
        isPrimary: image.id === id,
      }))
    );
  };

  return (
    <FormField
      control={control}
      name="images"
      render={({ field }) => (
        <FormItem className="space-y-3">
          <FormLabel>Imágenes del Producto</FormLabel>
          <FormControl>
            <div className="space-y-4">
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-gray-300 hover:border-primary"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex flex-col items-center space-y-2 cursor-pointer">
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
                  onChange={handleFileChange}
                  accept="image/jpeg, image/png"
                  multiple
                  className="hidden"
                  {...field}
                  value=""
                />
              </div>

              {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {images.map((image) => (
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
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-8 w-8 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeImage(image.id);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          {!image.isPrimary && (
                            <Button
                              size="sm"
                              variant="default"
                              className="h-8 w-8 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPrimaryImage(image.id);
                              }}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      {image.isPrimary && (
                        <div className="absolute top-1 right-1 bg-primary text-white rounded-full p-1">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default ProductImagesField;
