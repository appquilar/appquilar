
import { useState } from 'react';
import { ImageFile } from '../../forms/image-upload/types';
import ImageDropZone from '../../forms/image-upload/ImageDropZone';
import { validateAndProcessFiles } from '../../forms/image-upload/imageUtils';
import ImagePreview from '../../forms/image-upload/ImagePreview';
import { cn } from '@/lib/utils';

interface CategoryImageUploadProps {
  value: string | null;
  onChange: (value: string | null) => void;
  className?: string;
}

const CategoryImageUpload = ({ value, onChange, className }: CategoryImageUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ImageFile | null>(
    value ? {
      id: '1',
      file: null as any,
      url: value,
      isPrimary: true
    } : null
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const handleFiles = (files: File[]) => {
    const [newImage] = validateAndProcessFiles(files, selectedImage ? [selectedImage] : []);
    if (newImage) {
      setSelectedImage(newImage);
      onChange(newImage.url);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    onChange(null);
  };

  return (
    <div className={cn("w-full max-w-full", className)}>
      {selectedImage ? (
        <div className="relative w-full h-[225px] border rounded-md overflow-hidden">
          <ImagePreview
            image={selectedImage}
            onRemove={handleRemoveImage}
            onSetPrimary={() => {}}
          />
        </div>
      ) : (
        <div className="w-full">
          <ImageDropZone
            isDragging={isDragging}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onFileChange={handleFileChange}
          />
        </div>
      )}
    </div>
  );
};

export default CategoryImageUpload;
