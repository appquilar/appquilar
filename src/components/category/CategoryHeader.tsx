import React, { useMemo } from "react";

interface Props {
    name: string;
    description?: string;
    imageUrl?: string | null;
}

const CategoryHeader = ({ name, description, imageUrl }: Props) => {
    const html = useMemo(() => (description ?? "").trim(), [description]);

    return (
        <header className="w-full overflow-hidden rounded-[28px] border border-border/60 bg-card shadow-sm">
            <div className="relative min-h-[220px] md:min-h-[300px]">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={name}
                        className="absolute inset-0 h-full w-full object-cover"
                    />
                ) : (
                    <div className="absolute inset-0 bg-[linear-gradient(135deg,#111827_0%,#334155_55%,#ea580c_100%)]" />
                )}

                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/72 via-slate-950/42 to-slate-950/18" />

                <div className="relative flex min-h-[220px] items-end p-6 md:min-h-[300px] md:p-8">
                    <div className="max-w-3xl text-white">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-white/72">
                            Categoría
                        </p>
                        <h1 className="text-3xl font-display font-semibold tracking-tight md:text-5xl">
                            {name}
                        </h1>
                    </div>
                </div>
            </div>

            {html ? (
                <div className="border-t border-border/60 bg-card/95 px-6 py-5 md:px-8 md:py-6">
                    <div
                        className="prose prose-sm max-w-none text-sm leading-relaxed text-muted-foreground"
                        dangerouslySetInnerHTML={{ __html: html }}
                    />
                </div>
            ) : null}
        </header>
    );
};

export default CategoryHeader;
