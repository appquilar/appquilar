import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import { SiteFormData } from '@/domain/models/Site';

interface SiteHeroTextsFieldProps {
  form: UseFormReturn<SiteFormData>;
}

const SiteHeroTextsField = ({ form }: SiteHeroTextsFieldProps) => {
  const [newText, setNewText] = useState('');
  const currentTexts = form.watch('heroAnimatedTexts') || [];

  const handleAddText = () => {
    if (newText.trim()) {
      const updatedTexts = [...currentTexts, newText.trim()];
      form.setValue('heroAnimatedTexts', updatedTexts);
      setNewText('');
    }
  };

  const handleRemoveText = (index: number) => {
    const updatedTexts = currentTexts.filter((_, i) => i !== index);
    form.setValue('heroAnimatedTexts', updatedTexts);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddText();
    }
  };

  return (
    <FormField
      control={form.control}
      name="heroAnimatedTexts"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Textos animados del Hero</FormLabel>
          <FormDescription>
            Estos textos aparecerán en la animación del título principal de la página de inicio
          </FormDescription>
          <FormControl>
            <div className="space-y-3">
              {/* Lista de textos actuales */}
              {currentTexts.length > 0 && (
                <div className="space-y-2">
                  {currentTexts.map((text, index) => (
                    <div 
                      key={index} 
                      className="flex items-center gap-2 p-2 bg-muted rounded-md"
                    >
                      <span className="flex-1 text-sm">{text}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive hover:text-destructive"
                        onClick={() => handleRemoveText(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Input para añadir nuevo texto */}
              <div className="flex gap-2">
                <Input
                  placeholder="Ej: Herramientas Eléctricas"
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleAddText}
                  disabled={!newText.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default SiteHeroTextsField;
