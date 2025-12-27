import { X, Loader2 } from "lucide-react";
import type { ProductImageItem } from "./types";

interface Props {
    image: ProductImageItem;
    onRemove: (id: string) => Promise<void>;
}

const ProductImagePreview = ({ image, onRemove }: Props) => {
    return (
        <div className="relative overflow-hidden rounded-lg border bg-muted aspect-square">
            {image.url ? (
                <img src={image.url} alt="Preview" className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                    Sin preview
                </div>
            )}

            {/* botón X arriba derecha */}
            <button
                type="button"
                onClick={() => void onRemove(image.id)}
                className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center"
                title="Eliminar"
                disabled={image.isUploading}
            >
                <X className="h-4 w-4" />
            </button>

            {image.isUploading && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="flex items-center gap-2 text-white text-sm">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Subiendo...
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductImagePreview;
