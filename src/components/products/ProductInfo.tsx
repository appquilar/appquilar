import React from 'react';
import { Info, AlertTriangle } from 'lucide-react';
import { Product } from '@/domain/models/Product';
import CompanyInfo from './CompanyInfo';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import ProductRentalCostCalculator from './ProductRentalCostCalculator';
import { RentalCostBreakdown } from '@/domain/repositories/ProductRepository';

interface ProductInfoProps {
    product: Product;
    onContact: () => void;
    isLoggedIn: boolean;
    leadStartDate: string;
    leadEndDate: string;
    onLeadStartDateChange: (value: string) => void;
    onLeadEndDateChange: (value: string) => void;
    onLeadCalculationChange: (value: RentalCostBreakdown | null) => void;
}

const ProductInfo = ({
    product,
    onContact,
    isLoggedIn,
    leadStartDate,
    leadEndDate,
    onLeadStartDateChange,
    onLeadEndDateChange,
    onLeadCalculationChange,
}: ProductInfoProps) => {

    const handleContact = () => {
        if (!isLoggedIn) {
            sessionStorage.setItem(
                "auth:infoMessage",
                "Debes iniciar sesión para contactar con el propietario.",
            );
            const loginBtn = document.querySelector('[data-trigger-login]') as HTMLElement | null;
            loginBtn?.click();
            return;
        }

        onContact();
    };

    const price = product.price || { daily: 0, deposit: 0, tiers: [] };
    const tiers = price.tiers || [];

    return (
        <div className="space-y-8">
            {/* Draft/Archived Disclaimer */}
            {product.publicationStatus && product.publicationStatus !== 'published' && (
                <Alert variant="warning" className="bg-yellow-50 border-yellow-200">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <AlertTitle className="text-yellow-800">Producto no publicado</AlertTitle>
                    <AlertDescription className="text-yellow-700">
                        Este producto está en estado <strong>{product.publicationStatus === 'draft' ? 'Borrador' : 'Archivado'}</strong>.
                        Solo tú puedes ver esta página.
                    </AlertDescription>
                </Alert>
            )}

            {/* Header Info */}
            <div>
                <div className="flex items-center mb-3 gap-2">
                    {product.category?.name && (
                        <span className="text-xs bg-primary/10 px-2.5 py-0.5 rounded-full text-primary font-medium">
              {product.category.name}
            </span>
                    )}
                </div>

                <h1 className="text-3xl sm:text-4xl font-display font-bold tracking-tight mb-4 text-foreground">
                    {product.name}
                </h1>
            </div>

            {/* Pricing Section */}
            <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    Tarifas de Alquiler
                </h3>

                <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-border bg-muted/30 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Precio Base</p>
                            <p className="text-xs text-muted-foreground mt-0.5">Precio del primer tier disponible</p>
                        </div>
                        <div className="text-right">
                    <span className="text-3xl font-bold text-foreground">
                        {(price.daily || 0).toFixed(2)}€
                    </span>
                            <span className="text-muted-foreground ml-1">/ día</span>
                        </div>
                    </div>

                    {price.deposit !== undefined && price.deposit > 0 && (
                        <div className="px-5 py-3 border-b border-border flex items-center justify-between bg-white">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">Fianza</span>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Info size={14} className="text-muted-foreground cursor-help" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Importe reembolsable al finalizar el alquiler</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            <span className="font-medium text-foreground">{price.deposit.toFixed(2)}€</span>
                        </div>
                    )}

                    {tiers.length > 0 && (
                        <div className="p-0">
                            <div className="px-5 py-3 bg-muted/10 border-b border-border">
                                <p className="text-sm font-semibold text-foreground">Descuentos por duración</p>
                            </div>
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent border-border">
                                        <TableHead className="w-1/2 pl-5">Duración</TableHead>
                                        <TableHead className="text-right pr-5">Precio por día</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {tiers.map((tier, index) => (
                                        <TableRow key={index} className="hover:bg-muted/5 border-border">
                                            <TableCell className="pl-5 font-medium">
                                                {tier.daysFrom} {tier.daysTo ? `a ${tier.daysTo}` : '+'} días
                                            </TableCell>
                                            <TableCell className="text-right pr-5 text-foreground font-semibold">
                                                {Number(tier.pricePerDay || 0).toFixed(2)}€
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>
            </div>

            <ProductRentalCostCalculator
                productId={product.id}
                isLoggedIn={isLoggedIn}
                startDate={leadStartDate}
                endDate={leadEndDate}
                onStartDateChange={onLeadStartDateChange}
                onEndDateChange={onLeadEndDateChange}
                onCalculationChange={onLeadCalculationChange}
            />

            <div className="pt-4 border-t border-border">
                <CompanyInfo
                    company={product.company}
                    onContact={handleContact}
                    isLoggedIn={isLoggedIn}
                />
            </div>
        </div>
    );
};

export default ProductInfo;
