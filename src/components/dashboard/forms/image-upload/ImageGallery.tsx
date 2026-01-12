import { ImageFile, ImageGalleryProps } from "./types";
import ImagePreview from "./ImagePreview";

const ImageGallery = ({ images, onRemoveImage }: ImageGalleryProps) => {
    if (images.length === 0) return null;

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {images.map((image, index) => (
                <ImagePreview
                    key={image.id}
                    image={image}
                    index={index}
                    onRemove={onRemoveImage}
                />
            ))}
        </div>
    );
};

export default ImageGallery;