
import { ImageFile } from "./types";
import ImagePreview from "./ImagePreview";

interface ImageGalleryProps {
  images: ImageFile[];
  onRemoveImage: (id: string) => void;
  onSetPrimaryImage: (id: string) => void;
}

const ImageGallery = ({ images, onRemoveImage, onSetPrimaryImage }: ImageGalleryProps) => {
  if (images.length === 0) return null;
  
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {images.map((image) => (
        <ImagePreview 
          key={image.id}
          image={image} 
          onRemove={onRemoveImage}
          onSetPrimary={onSetPrimaryImage}
        />
      ))}
    </div>
  );
};

export default ImageGallery;
