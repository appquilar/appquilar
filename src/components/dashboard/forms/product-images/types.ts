export type ImageFile = {
    id: string;          // UUID que usas como image_id
    file: File;
    previewUrl: string;  // URL.createObjectURL(file)
};
