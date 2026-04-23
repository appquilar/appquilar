import { useMemo, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PHONE_COUNTRIES, type PhoneCountryOption } from "@/components/ui/phone-country-data";
import { cn } from "@/lib/utils";
import { normalizeSearchText } from "@/utils/normalizeSearchText";

const DEFAULT_COUNTRY_CODE = "ES";
const MAX_E164_NATIONAL_DIGITS = 15;

const PHONE_COUNTRIES_WITH_SEARCH = PHONE_COUNTRIES.map((country) => ({
    ...country,
    searchText: normalizeSearchText(`${country.name} ${country.code} ${country.dialCode}`),
}));

const DEFAULT_COUNTRY =
    PHONE_COUNTRIES_WITH_SEARCH.find((option) => option.code === DEFAULT_COUNTRY_CODE)
    ?? PHONE_COUNTRIES_WITH_SEARCH[0];

function getFlagEmoji(countryCode: string): string {
    return countryCode
        .toUpperCase()
        .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
}

function formatPhoneNumber(rawValue: string, formatGroups: readonly number[]): string {
    if (!rawValue) {
        return "";
    }

    const digits = rawValue.replace(/\D/g, "");
    const chunks: string[] = [];
    let cursor = 0;

    for (const groupLength of formatGroups) {
        if (cursor >= digits.length) {
            break;
        }

        chunks.push(digits.slice(cursor, cursor + groupLength));
        cursor += groupLength;
    }

    if (cursor < digits.length) {
        chunks.push(digits.slice(cursor));
    }

    return chunks.join(" ");
}

type PhoneNumberInputProps = {
    id?: string;
    countryCode: string;
    prefix: string;
    number: string;
    onCountryChange: (value: { countryCode: string; prefix: string }) => void;
    onNumberChange: (value: string) => void;
    disabled?: boolean;
    invalid?: boolean;
};

export function PhoneNumberInput({
    id,
    countryCode,
    prefix,
    number,
    onCountryChange,
    onNumberChange,
    disabled = false,
    invalid = false,
}: PhoneNumberInputProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");

    const selectedCountry = useMemo(() => {
        const normalizedCountryCode = countryCode.toUpperCase();
        return (
            PHONE_COUNTRIES_WITH_SEARCH.find((option) => option.code === normalizedCountryCode)
            ?? DEFAULT_COUNTRY
        );
    }, [countryCode]);

    const filteredCountries = useMemo(() => {
        const normalizedQuery = normalizeSearchText(query);

        if (!normalizedQuery) {
            return PHONE_COUNTRIES_WITH_SEARCH;
        }

        return PHONE_COUNTRIES_WITH_SEARCH.filter((option) =>
            option.searchText.includes(normalizedQuery),
        );
    }, [query]);

    const displayPrefix = prefix || selectedCountry.dialCode;
    const displayNumber = formatPhoneNumber(number, selectedCountry.formatGroups);

    const handleCountrySelect = (option: PhoneCountryOption) => {
        onCountryChange({
            countryCode: option.code,
            prefix: option.dialCode,
        });
        setOpen(false);
        setQuery("");
    };

    const handleNumberChange = (value: string) => {
        const sanitizedValue = value.replace(/\D/g, "").slice(0, MAX_E164_NATIONAL_DIGITS);
        onNumberChange(sanitizedValue);
    };

    return (
        <div
            className={cn(
                "ui-phone-number-input flex min-h-11 w-full overflow-hidden rounded-md border border-input bg-background transition-colors",
                "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
                invalid && "border-destructive",
                disabled && "opacity-60",
            )}
        >
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <button
                        type="button"
                        role="combobox"
                        aria-expanded={open}
                        aria-label="Seleccionar país y prefijo telefónico"
                        disabled={disabled}
                        className={cn(
                            "ui-phone-number-input-country flex min-w-[176px] items-center gap-2 border-r border-input bg-muted/45 px-3 text-left text-sm",
                            "transition-colors hover:bg-muted/65 focus:outline-none",
                        )}
                    >
                        <span className="text-base leading-none">
                            {getFlagEmoji(selectedCountry.code)}
                        </span>
                        <span className="truncate font-medium">{selectedCountry.name}</span>
                        <span className="shrink-0 text-muted-foreground">{displayPrefix}</span>
                        <ChevronDown className="ml-auto h-4 w-4 shrink-0 text-muted-foreground" />
                    </button>
                </PopoverTrigger>

                <PopoverContent
                    className="w-[360px] p-0"
                    align="start"
                    side="bottom"
                    sideOffset={6}
                >
                    <Command shouldFilter={false}>
                        <CommandInput
                            placeholder="Buscar país o prefijo..."
                            value={query}
                            onValueChange={setQuery}
                        />
                        <CommandList className="max-h-[320px]">
                            <CommandEmpty>No se han encontrado países.</CommandEmpty>
                            <CommandGroup>
                                {filteredCountries.map((option) => (
                                    <CommandItem
                                        key={`${option.code}-${option.dialCode}`}
                                        value={`${option.code}-${option.dialCode}`}
                                        onSelect={() => handleCountrySelect(option)}
                                        className="gap-3"
                                    >
                                        <Check
                                            className={cn(
                                                "h-4 w-4 shrink-0",
                                                option.code === selectedCountry.code
                                                    ? "opacity-100"
                                                    : "opacity-0",
                                            )}
                                        />
                                        <span className="text-base leading-none">
                                            {getFlagEmoji(option.code)}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <div className="truncate font-medium">{option.name}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {option.code}
                                            </div>
                                        </div>
                                        <span className="text-sm text-muted-foreground">
                                            {option.dialCode}
                                        </span>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

            <input
                id={id}
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                value={displayNumber}
                onChange={(event) => handleNumberChange(event.target.value)}
                placeholder="Número de teléfono"
                disabled={disabled}
                aria-label="Número de teléfono"
                className={cn(
                    "ui-phone-number-input-field h-full flex-1 bg-transparent px-3 py-2 text-base outline-none placeholder:text-muted-foreground md:text-sm",
                    disabled && "cursor-not-allowed",
                )}
            />
        </div>
    );
}
