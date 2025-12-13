import { useEffect, useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { useProfilePicture } from "@/components/dashboard/hooks/useProfilePicture";

interface Props {
    featuredId: string | null;
    isUploading: boolean;
    onSelectFile: (file: File) => Promise<void>;
    onRemove: () => Promise<void>;
}

const CategoryFeaturedUpload = ({
                                    featuredId,
                                    isUploading,
                                    onSelectFile,
                                    onRemove,
                                }: Props) => {
    const { profilePicture } = useProfilePicture(featuredId);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        setPreviewUrl(profilePicture ?? null);
    }, [profilePicture]);

    const pick = () => inputRef.current?.click();

    const handleFile = async (f: File | null) => {
        if (!f) return;

        // preview local
        const url = URL.createObjectURL(f);
        setPreviewUrl(url);

        await onSelectFile(f);
    };

    const clear = async () => {
        setPreviewUrl(null);
        await onRemove();
    };

    return (
        <div className="space-y-2">
            <p className="text-sm font-medium">Featured image</p>

            <div
                className={`relative w-full max-w-[520px] aspect-[4/3] rounded-xl overflow-hidden border bg-muted cursor-pointer ${
                    isUploading ? "opacity-60 pointer-events-none" : ""
                }`}
                onClick={pick}
            >
                {previewUrl ? (
                    <>
                        <img src={previewUrl} alt="featured" className="w-full h-full object-cover" />

                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                void clear();
                            }}
                            className="absolute top-3 right-3 h-9 w-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center"
                            title="Eliminar imagen"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </>
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                        <Upload className="h-8 w-8 mb-2" />
                        <span className="text-sm">{isUploading ? "Subiendo..." : "Subir imagen"}</span>
                    </div>
                )}
            </div>

            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png"
                className="hidden"
                onChange={(e) => {
                    const f = e.target.files?.[0] ?? null;
                    void handleFile(f);
                    e.target.value = "";
                }}
            />

            <p className="text-xs text-muted-foreground">
                {isUploading ? "Subiendo..." : "Se guarda como ID (featured_image_id)."}
            </p>
        </div>
    );
};

export default CategoryFeaturedUpload;
