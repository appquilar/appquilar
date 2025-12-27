import type { ProductImageItem } from "./types";
import ProductImagePreview from "./ProductImagePreview";

interface Props {
    images: ProductImageItem[];
    onRemove: (id: string) => Promise<void>;
}

const ProductImageGallery = ({ images, onRemove }: Props) => {
    if (!images.length) return null;

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {images.map((img) => (
                <ProductImagePreview key={img.id} image={img} onRemove={onRemove} />
            ))}
        </div>
    );
};

export default ProductImageGallery;
