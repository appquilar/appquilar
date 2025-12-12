interface ResultsCountProps {
    visibleCount: number;
    total: number;
}

const ResultsCount = ({ visibleCount, total }: ResultsCountProps) => {
    if (total === 0) {
        return null;
    }

    return (
        <p className="text-sm text-muted-foreground">
            Mostrando {visibleCount} de {total} usuarios
        </p>
    );
};

export default ResultsCount;
