// src/components/dashboard/forms/image-upload/ImagePreview.tsx
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ImageFile } from "./types";
import { useMediaUrl } from "@/application/hooks/useMediaUrl";

interface ImagePreviewProps {
    image: ImageFile;
    onRemove: (id: string) => void;
    onSetPrimary: (id: string) => void; // no-op para no romper
}

const ImagePreview = ({ image, onRemove }: ImagePreviewProps) => {
    const { url: remoteUrl } = useMediaUrl(image.id, "THUMBNAIL", { enabled: !image.previewUrl });

    const src = image.previewUrl ?? remoteUrl ?? "";

    return (
        <div className="relative w-full aspect-square overflow-hidden rounded-md border bg-muted">
            {src ? (
                <img src={src} alt="Preview" className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                    Cargando...
                </div>
            )}

            <Button
                type="button"
                variant="secondary"
                size="icon"
                onClick={() => onRemove(image.id)}
                className="absolute top-2 right-2 h-8 w-8 rounded-full bg-background/80 hover:bg-background shadow"
                aria-label="Eliminar imagen"
                disabled={!!image.isUploading}
            >
                <X className="h-4 w-4" />
            </Button>

            {image.isUploading ? (
                <div className="absolute inset-0 bg-background/50 flex items-center justify-center text-xs">
                    Subiendo...
                </div>
            ) : null}

            {image.error ? (
                <div className="absolute bottom-0 left-0 right-0 bg-destructive/80 text-white text-xs p-1">
                    {image.error}
                </div>
            ) : null}
        </div>
    );
};

export default ImagePreview;
