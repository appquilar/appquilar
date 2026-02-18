import { type ReactNode } from "react";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardSectionHeaderProps {
    title: string;
    description?: string;
    icon: LucideIcon;
    actions?: ReactNode;
    className?: string;
}

const DashboardSectionHeader = ({
    title,
    description,
    icon: Icon,
    actions,
    className,
}: DashboardSectionHeaderProps) => {
    return (
        <header className={cn("flex flex-col gap-2.5 sm:flex-row sm:items-start sm:justify-between", className)}>
            <div className="flex min-w-0 items-start gap-2.5">
                <div className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200/80 bg-white text-[#F19D70] shadow-sm">
                    <Icon size={16} />
                </div>
                <div className="min-w-0">
                    <h1 className="truncate text-[1.45rem] font-extrabold tracking-tight text-[#0F172A]">{title}</h1>
                    {description ? (
                        <p className="mt-1 text-[0.9rem] text-[#0F172A]/55">{description}</p>
                    ) : null}
                </div>
            </div>

            {actions ? (
                <div className="shrink-0">{actions}</div>
            ) : null}
        </header>
    );
};

export default DashboardSectionHeader;
