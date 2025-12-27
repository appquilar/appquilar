import * as React from "react";
import { Input } from "@/components/ui/input";

type Props = {
    valueCents: number;                 // valor real que guardas en el form (INT)
    onChangeCents: (cents: number) => void;

    placeholder?: string;
    disabled?: boolean;
    className?: string;

    /**
     * Si true, en blur formatea visualmente a "12,34".
     * Si false, deja lo que el usuario escribió.
     */
    formatOnBlur?: boolean;
};

function centsToHuman(cents: number, decimalSeparator: "," | "." = ",") {
    const sign = cents < 0 ? "-" : "";
    const abs = Math.abs(cents);
    const euros = Math.floor(abs / 100);
    const dec = String(abs % 100).padStart(2, "0");
    return `${sign}${euros}${decimalSeparator}${dec}`;
}

function humanToCents(raw: string): number | null {
    // Limpia espacios
    const s = raw.trim();
    if (!s) return 0;

    // Permitir: "12", "12,", "12.", "12,3", "12.34"
    // Convertimos coma -> punto para parseo consistente
    const normalized = s.replace(",", ".");

    // Si termina en "." (ej "12.") lo tratamos como "12.00"
    const safe = normalized.endsWith(".") ? `${normalized}00` : normalized;

    // Validación básica: solo dígitos, un punto y opcional signo
    if (!/^-?\d*(\.\d*)?$/.test(safe)) return null;

    const num = Number(safe);
    if (Number.isNaN(num)) return null;

    // Redondeo a 2 decimales y a céntimos
    return Math.round(num * 100);
}

export default function MoneyInput({
                                       valueCents,
                                       onChangeCents,
                                       placeholder,
                                       disabled,
                                       className,
                                       formatOnBlur = true,
                                   }: Props) {
    const [text, setText] = React.useState<string>(() => centsToHuman(valueCents, ","));
    const lastCentsRef = React.useRef<number>(valueCents);

    // Si el valor real cambia desde fuera (reset, cargar defaults, etc),
    // actualizamos el texto SOLO si no estamos en medio de edición rara.
    React.useEffect(() => {
        if (lastCentsRef.current !== valueCents) {
            lastCentsRef.current = valueCents;
            setText(centsToHuman(valueCents, ","));
        }
    }, [valueCents]);

    const onChange = (v: string) => {
        // ✅ permitir libremente números + , .
        // bloqueamos letras, pero dejamos cosas intermedias como "12," mientras escribe
        if (!/^-?[\d.,]*$/.test(v)) return;
        setText(v);
    };

    const onBlur = () => {
        const cents = humanToCents(text);

        // Si es inválido, revertimos al último valor bueno
        if (cents === null) {
            setText(centsToHuman(valueCents, ","));
            return;
        }

        onChangeCents(cents);
        lastCentsRef.current = cents;

        if (formatOnBlur) {
            setText(centsToHuman(cents, ","));
        }
    };

    return (
        <div className="relative">
            <Input
                value={text}
                onChange={(e) => onChange(e.target.value)}
                onBlur={onBlur}
                placeholder={placeholder}
                disabled={disabled}
                className={`pr-10 ${className ?? ""}`}
                inputMode="decimal"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
        €
      </span>
        </div>
    );
}
