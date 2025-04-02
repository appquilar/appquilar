
import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { SiteFormData } from '@/domain/models/Site';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SiteLogoUploadProps {
  form: UseFormReturn<SiteFormData>;
}

const SiteLogoUpload = ({ form }: SiteLogoUploadProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(form.getValues().logo);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.includes('image/')) {
      form.setError('logo', { message: 'El archivo debe ser una imagen' });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      form.setError('logo', { message: 'La imagen no debe superar los 2MB' });
      return;
    }

    // Create a preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // In a real app, we would upload the file to a server and get a URL
    // For now, we'll just store the data URL as a placeholder
    const reader = new FileReader();
    reader.onloadend = () => {
      form.setValue('logo', reader.result as string, { shouldValidate: true });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    form.setValue('logo', null, { shouldValidate: true });
    setPreviewUrl(null);
  };

  return (
    <FormField
      control={form.control}
      name="logo"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Logo del sitio</FormLabel>
          <FormControl>
            <div className="space-y-2">
              {previewUrl ? (
                <div className="relative w-40 h-40 flex items-center justify-center border rounded-md overflow-hidden group">
                  <img 
                    src={previewUrl} 
                    alt="Logo preview" 
                    className="max-w-full max-h-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="absolute top-1 right-1 bg-white/80 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center border border-dashed rounded-md p-4 w-40 h-40">
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <label
                    htmlFor="logo-upload"
                    className="cursor-pointer text-sm text-center text-muted-foreground"
                  >
                    <span className="font-medium text-primary">Subir logo</span> o arrastra y suelta
                  </label>
                </div>
              )}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default SiteLogoUpload;
