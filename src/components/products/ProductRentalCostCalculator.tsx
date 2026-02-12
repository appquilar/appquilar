import { useMemo, useState } from "react";
import { Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCalculateRentalCost } from "@/application/hooks/useProducts";
import { RentalCostBreakdown } from "@/domain/repositories/ProductRepository";
import SpanishDateInput from "./SpanishDateInput";

type ProductRentalCostCalculatorProps = {
    productId: string;
    isLoggedIn: boolean;
    startDate?: string;
    endDate?: string;
    onStartDateChange?: (value: string) => void;
    onEndDateChange?: (value: string) => void;
    onCalculationChange?: (value: RentalCostBreakdown | null) => void;
};

const formatMoneyFromCents = (amount: number, currency: string): string => {
    const value = Number(amount || 0) / 100;
    return `${value.toFixed(2)} ${currency}`;
};

const ProductRentalCostCalculator = ({
    productId,
    isLoggedIn,
    startDate: controlledStartDate,
    endDate: controlledEndDate,
    onStartDateChange,
    onEndDateChange,
    onCalculationChange,
}: ProductRentalCostCalculatorProps) => {
    const [internalStartDate, setInternalStartDate] = useState<string>("");
    const [internalEndDate, setInternalEndDate] = useState<string>("");
    const [lastCalculation, setLastCalculation] = useState<RentalCostBreakdown | null>(null);

    const { mutateAsync: calculateRentalCost, isPending } = useCalculateRentalCost();
    const startDate = controlledStartDate ?? internalStartDate;
    const endDate = controlledEndDate ?? internalEndDate;

    const canCalculate = useMemo(() => {
        return productId.length > 0 && startDate.length > 0 && endDate.length > 0;
    }, [productId, startDate, endDate]);

    const handleCalculate = async () => {
        if (!canCalculate) return;
        if (!isLoggedIn) {
            sessionStorage.setItem(
                "auth:infoMessage",
                "Debes iniciar sesión para calcular el coste del alquiler.",
            );
            const loginBtn = document.querySelector('[data-trigger-login]') as HTMLElement | null;
            loginBtn?.click();
            return;
        }

        const result = await calculateRentalCost({
            productId,
            startDate,
            endDate,
        });

        setLastCalculation(result);
        onCalculationChange?.(result);
    };

    return (
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <div className="flex items-center gap-2">
                <Calculator size={16} className="text-primary" />
                <h4 className="font-semibold">Calcula tu alquiler</h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                    <label htmlFor="rental-start-date" className="text-sm text-muted-foreground">
                        Fecha de inicio
                    </label>
                    <SpanishDateInput
                        id="rental-start-date"
                        value={startDate}
                        onChange={(value) => {
                            setLastCalculation(null);
                            onCalculationChange?.(null);
                            if (controlledStartDate === undefined) {
                                setInternalStartDate(value);
                            }
                            onStartDateChange?.(value);
                        }}
                    />
                </div>

                <div className="space-y-1">
                    <label htmlFor="rental-end-date" className="text-sm text-muted-foreground">
                        Fecha de fin
                    </label>
                    <SpanishDateInput
                        id="rental-end-date"
                        value={endDate}
                        onChange={(value) => {
                            setLastCalculation(null);
                            onCalculationChange?.(null);
                            if (controlledEndDate === undefined) {
                                setInternalEndDate(value);
                            }
                            onEndDateChange?.(value);
                        }}
                    />
                </div>
            </div>

            <Button
                type="button"
                onClick={handleCalculate}
                disabled={!canCalculate || isPending}
                className="w-full"
            >
                {isPending ? "Calculando..." : "Calcular coste"}
            </Button>

            {lastCalculation && (
                <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Días de alquiler</span>
                        <span className="font-medium">{lastCalculation.days}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Precio por día</span>
                        <span className="font-medium">
                            {formatMoneyFromCents(
                                lastCalculation.pricePerDay.amount,
                                lastCalculation.pricePerDay.currency
                            )}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal alquiler</span>
                        <span className="font-medium">
                            {formatMoneyFromCents(
                                lastCalculation.rentalPrice.amount,
                                lastCalculation.rentalPrice.currency
                            )}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Fianza</span>
                        <span className="font-medium">
                            {formatMoneyFromCents(
                                lastCalculation.deposit.amount,
                                lastCalculation.deposit.currency
                            )}
                        </span>
                    </div>
                    <div className="border-t border-border pt-2 mt-2 flex justify-between text-base">
                        <span className="font-semibold">Total</span>
                        <span className="font-semibold">
                            {formatMoneyFromCents(
                                lastCalculation.totalPrice.amount,
                                lastCalculation.totalPrice.currency
                            )}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductRentalCostCalculator;
