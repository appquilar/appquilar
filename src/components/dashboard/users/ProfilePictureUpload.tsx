import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { ImageFile } from "@/components/dashboard/forms/image-upload/types";
import { validateAndProcessFiles } from "@/components/dashboard/forms/image-upload/imageUtils";
import ImagePreview from "@/components/dashboard/forms/image-upload/ImagePreview";
import { useIsMobile } from "@/hooks/use-mobile";

interface ProfilePictureUploadProps {
    value: ImageFile[] | undefined;
    onChange: (value: ImageFile[]) => void;
}

const ProfilePictureUpload = ({ value, onChange }: ProfilePictureUploadProps) => {
    const [isDragging, setIsDragging] = useState(false);
    const isMobile = useIsMobile();
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const currentImage = value?.[0];
    const size = isMobile ? "w-32 h-32" : "w-40 h-40";

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

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(Array.from(e.dataTransfer.files));
        }
    };

    const handleClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFiles(Array.from(files));
        }
        // permitir volver a seleccionar el mismo archivo
        e.target.value = "";
    };

    const handleFiles = (files: File[]) => {
        const newImages = validateAndProcessFiles(files, []);
        if (newImages.length > 0) {
            onChange([newImages[0]]); // Solo una imagen
        }
    };

    const handleRemove = () => {
        onChange([]);
    };

    return (
        <div
            className={`${size} relative`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
        >
            {/* Círculo que recorta la imagen */}
            <div
                className={`w-full h-full rounded-full border-2 flex items-center justify-center overflow-hidden transition-colors ${
                    isDragging
                        ? "border-primary bg-primary/5"
                        : "border-gray-300 hover:border-primary"
                }`}
            >
                {currentImage ? (
                    <ImagePreview
                        image={currentImage}
                        onRemove={() => {}}
                        onSetPrimary={() => {}}
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                        <Upload
                            className={`${
                                isMobile ? "h-6 w-6" : "h-8 w-8"
                            } text-muted-foreground mb-2`}
                        />
                        <span className="text-sm text-muted-foreground text-center px-2">
                            Subir foto
                        </span>
                    </div>
                )}
            </div>

            {/* Botón X fuera del círculo */}
            {currentImage && (
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleRemove();
                    }}
                    className="
                        absolute -top-1 -right-1
                        h-7 w-7
                        flex items-center justify-center
                        rounded-full
                        bg-black/60 backdrop-blur-sm
                        hover:bg-black/80
                        transition
                        shadow-md
                        text-white
                    "
                    title="Eliminar imagen"
                >
                    <X className="h-4 w-4" />
                </button>
            )}

            <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                accept="image/jpeg, image/png"
                className="hidden"
            />
        </div>
    );
};

export default ProfilePictureUpload;
