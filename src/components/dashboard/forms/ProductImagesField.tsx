
import { useState } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { ImageFile, ProductImagesFieldProps } from "./image-upload/types";
import ImageDropZone from "./image-upload/ImageDropZone";
import ImageGallery from "./image-upload/ImageGallery";
import { validateAndProcessFiles, MAX_IMAGES } from "./image-upload/imageUtils";

const ProductImagesField = ({ control }: ProductImagesFieldProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [images, setImages] = useState<ImageFile[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      handleFiles(Array.from(files));
    }
  };

  const handleFiles = (files: File[]) => {
    const newImages = validateAndProcessFiles(files, images);
    if (newImages.length > 0) {
      setImages((prevImages) => [...prevImages, ...newImages]);
    }
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
              <ImageDropZone
                isDragging={isDragging}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onFileChange={handleFileChange}
              />
              <ImageGallery 
                images={images} 
                onRemoveImage={removeImage}
                onSetPrimaryImage={setPrimaryImage}
              />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default ProductImagesField;
