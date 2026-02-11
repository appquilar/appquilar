import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import ImageDropZone from '@/components/dashboard/forms/image-upload/ImageDropZone';
import BlogMediaImage from '@/components/blog/BlogMediaImage';
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from '@/components/dashboard/forms/image-upload/imageUtils';

interface BlogSingleImageUploaderProps {
    label: string;
    mediaId: string | null;
    alt: string;
    isUploading?: boolean;
    onSelectFile: (file: File) => Promise<void>;
    onRemove: () => void;
}

const BlogSingleImageUploader = ({
    label,
    mediaId,
    alt,
    isUploading = false,
    onSelectFile,
    onRemove,
}: BlogSingleImageUploaderProps) => {
    const [isDragging, setIsDragging] = useState(false);

    const validateFile = (file: File): boolean => {
        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
            toast.error('Formato no permitido. Usa JPEG o PNG.');
            return false;
        }

        if (file.size > MAX_FILE_SIZE) {
            toast.error('La imagen excede el tamaño máximo de 2MB.');
            return false;
        }

        return true;
    };

    const handleFiles = async (files: File[]): Promise<void> => {
        if (files.length === 0) {
            return;
        }

        if (files.length > 1) {
            toast.info('Solo se puede subir una imagen por campo. Se usará la primera.');
        }

        const file = files[0];
        if (!validateFile(file)) {
            return;
        }

        await onSelectFile(file);
    };

    return (
        <div className="space-y-3">
            <Label>{label}</Label>

            <BlogMediaImage
                mediaId={mediaId}
                alt={alt}
                className="h-44 rounded-md border"
                size="MEDIUM"
                fallbackText="Sin imagen"
            />

            <ImageDropZone
                disabled={isUploading}
                isDragging={isDragging}
                onDragOver={(event) => {
                    event.preventDefault();
                    setIsDragging(true);
                }}
                onDragLeave={(event) => {
                    event.preventDefault();
                    setIsDragging(false);
                }}
                onDrop={(event) => {
                    event.preventDefault();
                    setIsDragging(false);
                    void handleFiles(Array.from(event.dataTransfer.files));
                }}
                onFileChange={(event) => {
                    const files = event.target.files ? Array.from(event.target.files) : [];
                    void handleFiles(files);
                }}
            />

            {mediaId && (
                <Button
                    type="button"
                    variant="outline"
                    onClick={onRemove}
                    disabled={isUploading}
                >
                    Quitar imagen
                </Button>
            )}
        </div>
    );
};

export default BlogSingleImageUploader;
