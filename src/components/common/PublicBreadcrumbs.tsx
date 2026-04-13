import { Fragment } from "react";
import { Link } from "react-router-dom";

type BreadcrumbItem = {
    label: string;
    to?: string;
};

interface PublicBreadcrumbsProps {
    items: BreadcrumbItem[];
    className?: string;
}

const PublicBreadcrumbs = ({ items, className }: PublicBreadcrumbsProps) => {
    if (items.length === 0) {
        return null;
    }

    return (
        <nav aria-label="Breadcrumb" className={className}>
            <ol className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;

                    return (
                        <Fragment key={`${item.label}-${index}`}>
                            <li>
                                {item.to && !isLast ? (
                                    <Link to={item.to} className="hover:text-foreground hover:underline">
                                        {item.label}
                                    </Link>
                                ) : (
                                    <span className={isLast ? "text-foreground" : undefined}>{item.label}</span>
                                )}
                            </li>
                            {!isLast ? <li aria-hidden="true">/</li> : null}
                        </Fragment>
                    );
                })}
            </ol>
        </nav>
    );
};

export default PublicBreadcrumbs;
