import { useState } from 'react';
import { Upload } from 'lucide-react';
import { ImageFile } from '@/components/dashboard/forms/image-upload/types';
import { validateAndProcessFiles } from '@/components/dashboard/forms/image-upload/imageUtils';
import ImagePreview from '@/components/dashboard/forms/image-upload/ImagePreview';
import { useIsMobile } from '@/hooks/use-mobile';

interface ProfileImageUploadProps {
  value: ImageFile[] | undefined;
  onChange: (value: ImageFile[]) => void;
}

const ProfileImageUpload = ({ value, onChange }: ProfileImageUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const isMobile = useIsMobile();
  
  const currentImage = value?.[0];
  const size = isMobile ? 'w-32 h-32' : 'w-40 h-40';

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      handleFiles(Array.from(files));
    }
  };

  const handleFiles = (files: File[]) => {
    const newImages = validateAndProcessFiles(files, []);
    if (newImages.length > 0) {
      onChange([newImages[0]]); // Only keep one image
    }
  };

  const handleRemove = () => {
    onChange([]);
  };

  return (
    <div className={size}>
      {currentImage ? (
        <ImagePreview
          image={currentImage}
          onRemove={handleRemove}
          onSetPrimary={() => {}}
        />
      ) : (
        <div
          className={`w-full h-full rounded-full border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors ${
            isDragging ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('profile-image-input')?.click()}
        >
          <Upload className={`${isMobile ? 'h-6 w-6' : 'h-8 w-8'} text-muted-foreground mb-2`} />
          <span className="text-sm text-muted-foreground text-center px-2">
            Subir foto
          </span>
          <input
            id="profile-image-input"
            type="file"
            onChange={handleFileChange}
            accept="image/jpeg, image/png"
            className="hidden"
            value=""
          />
        </div>
      )}
    </div>
  );
};

export default ProfileImageUpload;
