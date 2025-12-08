import { ImageFile } from "./types";

interface ImagePreviewProps {
    image: ImageFile;
    onRemove: (id: string) => void;
    onSetPrimary: (id: string) => void;
}

const ImagePreview = ({ image }: ImagePreviewProps) => {
    return (
        <div
            key={image.id}
            className="relative h-full w-full"
        >
            <img
                src={image.url}
                alt="Preview"
                className="w-full h-full object-cover"
            />
        </div>
    );
};

export default ImagePreview;
