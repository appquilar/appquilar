import type { AvailableDynamicFilter } from "@/domain/models/DynamicProperty";

export type DynamicValueFilters = Record<string, string[]>;
export type DynamicRangeFilters = Record<string, { min?: number; max?: number }>;

interface DynamicPropertyFiltersSectionProps {
    availableDynamicFilters: AvailableDynamicFilter[];
    selectedDynamicRangeFilters: DynamicRangeFilters;
    selectedDynamicValueFilters: DynamicValueFilters;
    onToggleDynamicOption: (filterCode: string, optionValue: string, checked: boolean) => void;
    onUpdateDynamicRangeFilter: (filterCode: string, boundary: "min" | "max", rawValue: string) => void;
}

const DynamicPropertyFiltersSection = ({
    availableDynamicFilters,
    selectedDynamicRangeFilters,
    selectedDynamicValueFilters,
    onToggleDynamicOption,
    onUpdateDynamicRangeFilter,
}: DynamicPropertyFiltersSectionProps) => {
    return (
        <div className="border-t border-border/60 pt-4">
            <h3 className="mb-3 text-sm font-medium">Propiedades</h3>
            <div className="space-y-4">
                {availableDynamicFilters.map((filter) => {
                    if (filter.options && filter.options.length > 0) {
                        return (
                            <div key={filter.code}>
                                <p className="mb-2 text-sm font-medium">{filter.label}</p>
                                <div className="space-y-2">
                                    {filter.options.map((option) => (
                                        <label
                                            key={`${filter.code}-${option.value}`}
                                            className="flex items-center justify-between gap-3 text-sm"
                                        >
                                            <span className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={(selectedDynamicValueFilters[filter.code] ?? []).includes(option.value)}
                                                    onChange={(event) =>
                                                        onToggleDynamicOption(
                                                            filter.code,
                                                            option.value,
                                                            event.target.checked
                                                        )
                                                    }
                                                />
                                                <span>{option.label}</span>
                                            </span>
                                            <span className="text-xs text-muted-foreground">{option.count}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        );
                    }

                    if (filter.range) {
                        const selectedRange = selectedDynamicRangeFilters[filter.code] ?? {};

                        return (
                            <div key={filter.code}>
                                <p className="mb-2 text-sm font-medium">{filter.label}</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        type="number"
                                        inputMode="decimal"
                                        value={selectedRange.min ?? ""}
                                        onChange={(event) =>
                                            onUpdateDynamicRangeFilter(filter.code, "min", event.target.value)
                                        }
                                        placeholder={
                                            filter.range.min !== null
                                                ? `Mín. ${filter.range.min}`
                                                : "Mínimo"
                                        }
                                        className="h-10 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                    />
                                    <input
                                        type="number"
                                        inputMode="decimal"
                                        value={selectedRange.max ?? ""}
                                        onChange={(event) =>
                                            onUpdateDynamicRangeFilter(filter.code, "max", event.target.value)
                                        }
                                        placeholder={
                                            filter.range.max !== null
                                                ? `Máx. ${filter.range.max}`
                                                : "Máximo"
                                        }
                                        className="h-10 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                    />
                                </div>
                            </div>
                        );
                    }

                    return null;
                })}
            </div>
        </div>
    );
};

export default DynamicPropertyFiltersSection;
