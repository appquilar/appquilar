import { useEffect, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { RentalFormValues } from '@/domain/models/RentalForm';
import DateTimeField from './components/DateTimeField';
import MonetaryField from './components/MonetaryField';
import { useIsMobile } from '@/hooks/use-mobile';
import { Product } from '@/domain/models/Product';
import { useCalculateRentalCost } from '@/application/hooks/useProducts';
import { RentalCostBreakdown } from '@/domain/repositories/ProductRepository';

interface RentalDetailsFieldsProps {
  form: UseFormReturn<RentalFormValues>;
  selectedProduct: Product | null;
}

const formatDateToApi = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatMoneyFromCents = (amount: number, currency: string): string => {
  const value = Number(amount || 0) / 100;
  return `${value.toFixed(2)} ${currency}`;
};

const RentalDetailsFields = ({ form, selectedProduct }: RentalDetailsFieldsProps) => {
  const isMobile = useIsMobile();
  const { mutateAsync: calculateRentalCost, isPending: isCalculating } = useCalculateRentalCost();
  const [calculation, setCalculation] = useState<RentalCostBreakdown | null>(null);
  const [calculationError, setCalculationError] = useState<string | null>(null);

  const startDate = form.watch('startDate');
  const endDate = form.watch('endDate');

  const selectedProductId = selectedProduct?.id ?? null;
  const isProductSelected = Boolean(selectedProductId);
  const hasValidDates = Boolean(
    startDate instanceof Date
      && !Number.isNaN(startDate.getTime())
      && endDate instanceof Date
      && !Number.isNaN(endDate.getTime())
      && endDate >= startDate
  );

  const startDateKey = hasValidDates && startDate ? formatDateToApi(startDate) : '';
  const endDateKey = hasValidDates && endDate ? formatDateToApi(endDate) : '';

  useEffect(() => {
    if (!isProductSelected) {
      setCalculation(null);
      setCalculationError(null);
      form.setValue('priceAmount', 0, { shouldValidate: true });
      form.setValue('depositAmount', 0, { shouldValidate: true });
      return;
    }

    if (!hasValidDates || !selectedProductId) {
      setCalculation(null);
      setCalculationError(null);
      return;
    }

    let isCancelled = false;

    const runCalculation = async () => {
      try {
        setCalculationError(null);
        const result = await calculateRentalCost({
          productId: selectedProductId,
          startDate: startDateKey,
          endDate: endDateKey,
        });

        if (isCancelled) {
          return;
        }

        setCalculation(result);
        form.setValue('priceAmount', result.rentalPrice.amount / 100, { shouldValidate: true });
        form.setValue('priceCurrency', result.rentalPrice.currency, { shouldValidate: true });
        form.setValue('depositAmount', result.deposit.amount / 100, { shouldValidate: true });
        form.setValue('depositCurrency', result.deposit.currency, { shouldValidate: true });
      } catch (_error) {
        if (isCancelled) {
          return;
        }

        setCalculation(null);
        setCalculationError('No se pudo calcular el coste del alquiler con esas fechas.');
      }
    };

    runCalculation();

    return () => {
      isCancelled = true;
    };
  }, [calculateRentalCost, endDateKey, form, hasValidDates, isProductSelected, selectedProductId, startDateKey]);

  return (
    <>
      <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-medium`}>Detalles del Alquiler</h2>
      {!isProductSelected && (
        <p className="text-sm text-muted-foreground">
          Selecciona primero un producto publicado para habilitar fechas y cálculo automático del coste.
        </p>
      )}
      <div className="grid grid-cols-1 gap-4">
        <DateTimeField
          form={form}
          name="startDate"
          label="Fecha de Inicio"
          disabledDateFn={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
          disabled={!isProductSelected}
        />

        <DateTimeField
          form={form}
          name="endDate"
          label="Fecha de Fin"
          disabledDateFn={(date) => {
            const startDate = form.getValues('startDate');
            return date < startDate || date < new Date(new Date().setHours(0, 0, 0, 0));
          }}
          disabled={!isProductSelected}
        />

        <MonetaryField
          form={form}
          amountName="priceAmount"
          currencyName="priceCurrency"
          label="Precio del alquiler"
          description="Importe total del alquiler"
          disabled={!isProductSelected}
        />

        <MonetaryField
          form={form}
          amountName="depositAmount"
          currencyName="depositCurrency"
          label="Fianza"
          description="Importe de la fianza"
          disabled={!isProductSelected}
        />

        {isProductSelected && isCalculating && (
          <p className="text-sm text-muted-foreground">Calculando coste del alquiler...</p>
        )}

        {isProductSelected && calculationError && (
          <p className="text-sm text-destructive">{calculationError}</p>
        )}

        {isProductSelected && calculation && !isCalculating && (
          <div className="rounded-md border bg-muted/20 p-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Días</span>
              <span className="font-medium">{calculation.days}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Precio por día</span>
              <span className="font-medium">
                {formatMoneyFromCents(calculation.pricePerDay.amount, calculation.pricePerDay.currency)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal alquiler</span>
              <span className="font-medium">
                {formatMoneyFromCents(calculation.rentalPrice.amount, calculation.rentalPrice.currency)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fianza</span>
              <span className="font-medium">
                {formatMoneyFromCents(calculation.deposit.amount, calculation.deposit.currency)}
              </span>
            </div>
            <div className="border-t pt-2 mt-2 flex justify-between">
              <span className="font-semibold">Total</span>
              <span className="font-semibold">
                {formatMoneyFromCents(calculation.totalPrice.amount, calculation.totalPrice.currency)}
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default RentalDetailsFields;
