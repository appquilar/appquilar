
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface DataTableItem {
  id: string | number;
}

interface Column<TItem extends DataTableItem> {
  key: string;
  header: string;
  cell?: (item: TItem) => React.ReactNode;
}

interface Action<TItem extends DataTableItem> {
  label: string;
  icon: React.ReactNode;
  onClick: (item: TItem) => void;
}

interface DataTableProps<TItem extends DataTableItem> {
  data: TItem[];
  columns: Column<TItem>[];
  actions?: Action<TItem>[];
  emptyMessage?: string;
}

const DataTable = <TItem extends DataTableItem>({
  data, 
  columns, 
  actions = [],
  emptyMessage = "No se encontraron registros"
}: DataTableProps<TItem>) => {
  if (data.length === 0) {
    return (
      <div className="text-center py-12 bg-muted/30 rounded-lg">
        <h3 className="text-lg font-medium mb-2">{emptyMessage}</h3>
        <p className="text-muted-foreground">Ajusta tu búsqueda o añade un nuevo registro.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table className="min-w-[720px]">
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key}>{column.header}</TableHead>
            ))}
            {actions.length > 0 && <TableHead className="w-24 text-right">Acciones</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.id}>
              {columns.map((column) => (
                <TableCell key={`${item.id}-${column.key}`}>
                  {column.cell ? column.cell(item) : String(item[column.key as keyof TItem] ?? "")}
                </TableCell>
              ))}
              {actions.length > 0 && (
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {actions.map((action, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => action.onClick(item)}
                      >
                        {action.icon}
                        <span className="sr-only">{action.label}</span>
                      </Button>
                    ))}
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DataTable;
