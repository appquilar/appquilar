import React, { useMemo } from "react";

interface Props {
    name: string;
    description?: string;
}

const CategoryHeader = ({ name, description }: Props) => {
    // Si tu WYSIWYG mete wrappers raros, esto al menos evita undefined/null
    const html = useMemo(() => (description ?? "").trim(), [description]);

    return (
        <header className="w-full">
            <h1 className="text-3xl md:text-4xl font-display font-semibold tracking-tight">
                {name}
            </h1>

            {html ? (
                <div
                    className="mt-3 w-full text-muted-foreground leading-relaxed prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: html }}
                />
            ) : null}
        </header>
    );
};

export default CategoryHeader;
