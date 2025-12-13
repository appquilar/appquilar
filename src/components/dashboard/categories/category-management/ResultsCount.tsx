import React from "react";

const ResultsCount: React.FC<{ visibleCount: number; total: number }> = ({
                                                                             visibleCount,
                                                                             total,
                                                                         }) => {
    return (
        <p className="text-sm text-muted-foreground">
            Mostrando {visibleCount} de {total} resultados
        </p>
    );
};

export default ResultsCount;
