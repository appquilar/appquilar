import { X } from "lucide-react";
import { ImageFile, ImagePreviewProps } from "./types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const ImagePreview = ({ image, onRemove, index }: ImagePreviewProps) => {
    const isPrimary = index === 0;

    return (
        <div className="relative group aspect-square rounded-lg overflow-hidden border border-border bg-muted">
            <img
                src={image.url}
                alt="Preview"
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />

            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />

            {/* Primary Badge */}
            {isPrimary && (
                <div className="absolute top-2 left-2 z-10">
                    <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm text-xs">
                        Principal
                    </Badge>
                </div>
            )}

            {/* Remove Button */}
            <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onRemove(image.id)}
            >
                <X className="h-3 w-3" />
            </Button>
        </div>
    );
};

export default ImagePreview;