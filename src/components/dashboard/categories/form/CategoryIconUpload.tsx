import { useEffect, useState } from "react";
import ProfilePictureUpload from "@/components/dashboard/users/ProfilePictureUpload";
import type { ImageFile } from "@/components/dashboard/forms/image-upload/types";
import { useProfilePicture } from "@/components/dashboard/hooks/useProfilePicture";

interface Props {
    iconId: string | null;
    isUploading: boolean;
    onSelectFile: (file: File) => Promise<void>;
    onRemove: () => Promise<void>;
}

const CategoryIconUpload = ({ iconId, isUploading, onSelectFile, onRemove }: Props) => {
    const { profilePicture } = useProfilePicture(iconId);
    const [value, setValue] = useState<ImageFile[]>([]);

    useEffect(() => {
        if (profilePicture) {
            setValue([{ id: "icon", url: profilePicture, file: null, isPrimary: true }]);
        } else {
            setValue([]);
        }
    }, [profilePicture]);

    const onChange = async (images: ImageFile[]) => {
        const first = images[0] ?? null;

        if (!first) {
            setValue([]);
            await onRemove();
            return;
        }

        // preview local inmediato
        setValue([first]);

        if (first.file) {
            await onSelectFile(first.file);
        }
    };

    return (
        <div className="space-y-2">
            <p className="text-sm font-medium">Icono</p>
            <div className={isUploading ? "opacity-60 pointer-events-none" : ""}>
                <ProfilePictureUpload value={value} onChange={onChange} />
            </div>
            <p className="text-xs text-muted-foreground">
                {isUploading ? "Subiendo..." : "Se guarda como ID (icon_id)."}
            </p>
        </div>
    );
};

export default CategoryIconUpload;
