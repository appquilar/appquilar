export type DynamicPropertyType = 'boolean' | 'select' | 'multi_select' | 'integer' | 'decimal';

export interface DynamicPropertyOption {
    value: string;
    label: string;
}

export interface DynamicPropertyDefinition {
    code: string;
    label: string;
    type: DynamicPropertyType;
    filterable: boolean;
    unit?: string | null;
    options?: DynamicPropertyOption[];
}

export type ProductDynamicPropertyValue = boolean | string | number | string[];
export type ProductDynamicProperties = Record<string, ProductDynamicPropertyValue>;

export interface CategoryDynamicPropertiesResult {
    dynamicFiltersEnabled: boolean;
    disabledReason?: string | null;
    definitions: DynamicPropertyDefinition[];
}

export interface AvailableDynamicFilterOption extends DynamicPropertyOption {
    count: number;
    selected: boolean;
}

export interface AvailableDynamicFilterRange {
    min: number | null;
    max: number | null;
}

export interface AvailableDynamicFilter {
    code: string;
    label: string;
    type: DynamicPropertyType;
    unit?: string | null;
    options?: AvailableDynamicFilterOption[];
    range?: AvailableDynamicFilterRange;
    selectedRange?: AvailableDynamicFilterRange;
}
