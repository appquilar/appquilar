import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface GoogleSnippetPreviewProps {
    title: string;
    slug: string;
    description: string;
    keywords?: string;
}

const GoogleSnippetPreview = ({ title, slug, description, keywords }: GoogleSnippetPreviewProps) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Vista previa en Google</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
                <p className="truncate text-xs text-green-700">https://appquilar.com{slug}</p>
                <p className="line-clamp-2 text-base text-blue-700">{title || 'Título del artículo'}</p>
                <p className="line-clamp-3 text-muted-foreground">
                    {description || 'Añade contenido para generar una descripción visible en resultados de búsqueda.'}
                </p>
                {keywords && keywords.trim().length > 0 && (
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                        Keywords: {keywords}
                    </p>
                )}
            </CardContent>
        </Card>
    );
};

export default GoogleSnippetPreview;
