
import { Control } from "react-hook-form";
import { ProductFormValues } from "../productFormSchema";

export interface ImageFile {
  id: string;
  file: File;
  url: string;
  isPrimary: boolean;
}

export interface ProductImagesFieldProps {
  control: Control<ProductFormValues>;
}
