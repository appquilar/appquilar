import { useRef } from "react";
import { Plus } from "lucide-react";

interface Props {
    disabled?: boolean;
    isDragging: boolean;
    count: number;
    max: number;
    onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
    onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
    onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ProductImageDropZone = ({
                                  disabled,
                                  isDragging,
                                  count,
                                  max,
                                  onDragOver,
                                  onDragLeave,
                                  onDrop,
                                  onFileChange,
                              }: Props) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onFileChange(e);

        // ✅ Permite seleccionar el mismo archivo otra vez (el browser si no, no dispara onChange)
        e.currentTarget.value = "";
    };

    return (
        <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                disabled
                    ? "opacity-50 pointer-events-none"
                    : isDragging
                        ? "border-primary bg-primary/5"
                        : "border-gray-300 hover:border-primary"
            }`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
        >
            <div className="flex flex-col items-center space-y-2">
                <Plus className="h-8 w-8 text-muted-foreground" />
                <div className="text-sm text-muted-foreground">
                    <span className="font-medium">Haz clic para subir</span> o arrastra y suelta
                </div>
                <p className="text-xs text-muted-foreground">
                    JPEG o PNG, máximo 2MB · {count}/{max}
                </p>
            </div>

            <input
                type="file"
                ref={inputRef}
                onChange={handleChange}
                accept="image/jpeg,image/png"
                className="hidden"
                multiple
            />
        </div>
    );
};

export default ProductImageDropZone;
