import { useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";

import { useMediaUrl } from "@/application/hooks/useMediaUrl";
import { Button } from "@/components/ui/button";
import ImageDropZone from "@/components/dashboard/forms/image-upload/ImageDropZone";
import type { ImageSize } from "@/domain/repositories/MediaRepository";

type CompanyImageVariant = "avatar" | "banner";

interface CompanyImageFieldProps {
    title: string;
    description: string;
    mediaId: string | null;
    companyName: string;
    imageSize: ImageSize;
    variant: CompanyImageVariant;
    isUploading: boolean;
    error?: string;
    onSelectFile: (file: File) => Promise<void>;
    onRemove: () => Promise<void>;
}

const CompanyImageField = ({
    title,
    description,
    mediaId,
    companyName,
    imageSize,
    variant,
    isUploading,
    error,
    onSelectFile,
    onRemove,
}: CompanyImageFieldProps) => {
    const [isDragging, setIsDragging] = useState(false);
    const { url } = useMediaUrl(mediaId, imageSize, { enabled: Boolean(mediaId) });
    const hasImage = Boolean(url);

    const handleFiles = async (files: File[]): Promise<void> => {
        const nextFile = files[0];

        if (!nextFile) {
            return;
        }

        await onSelectFile(nextFile);
    };

    return (
        <div className="space-y-3 rounded-xl border border-border/70 bg-muted/15 p-5">
            <div className="space-y-1">
                <h4 className="text-sm font-semibold text-foreground">{title}</h4>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>

            <div
                className={
                    variant === "banner"
                        ? "relative aspect-[16/6] overflow-hidden rounded-2xl border border-border/70 bg-card"
                        : "relative flex aspect-square max-w-[220px] items-center justify-center overflow-hidden rounded-3xl border border-border/70 bg-card"
                }
            >
                {hasImage ? (
                    <>
                        <img
                            src={url ?? undefined}
                            alt={companyName || title}
                            className="h-full w-full object-cover"
                        />
                        {variant === "banner" && (
                            <>
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/15 to-transparent" />
                                <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                                    <p className="text-lg font-semibold sm:text-2xl">{companyName || "Tu empresa"}</p>
                                    <p className="text-sm text-white/80">Cabecera pública del perfil</p>
                                </div>
                            </>
                        )}
                    </>
                ) : variant === "banner" ? (
                    <div className="flex h-full w-full items-end bg-[linear-gradient(120deg,rgba(246,158,101,0.22),rgba(250,242,236,0.95),rgba(32,41,57,0.08))] p-4">
                        <div>
                            <p className="text-lg font-semibold text-slate-900 sm:text-2xl">{companyName || "Tu empresa"}</p>
                            <p className="text-sm text-slate-600">Cabecera pública del perfil</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-primary/5 text-4xl font-semibold text-primary">
                        {(companyName || title).charAt(0).toUpperCase()}
                    </div>
                )}
            </div>

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

            <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <ImagePlus className="h-4 w-4" />
                    <span>{isUploading ? "Subiendo imagen..." : "JPEG o PNG, máximo 2MB."}</span>
                </div>

                {mediaId && (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        disabled={isUploading}
                        onClick={() => {
                            void onRemove();
                        }}
                    >
                        <Trash2 className="h-4 w-4" />
                        Quitar imagen
                    </Button>
                )}
            </div>

            {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
        </div>
    );
};

export default CompanyImageField;
