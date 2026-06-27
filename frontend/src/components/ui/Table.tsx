import { useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
} from '@tanstack/react-table';
import type {
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
} from '@tanstack/react-table';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search, SlidersHorizontal } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchPlaceholder?: string;
  searchColumnId?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchPlaceholder = "Search...",
  searchColumnId,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [showVisibilityMenu, setShowVisibilityMenu] = useState(false);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  return (
    <div className="space-y-4">
      {/* Search & Toolbars */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        {searchColumnId && (
          <div className="relative w-full sm:max-w-xs">
            <Input
              icon={<Search size={16} />}
              placeholder={searchPlaceholder}
              value={(table.getColumn(searchColumnId)?.getFilterValue() as string) ?? ''}
              onChange={(event) =>
                table.getColumn(searchColumnId)?.setFilterValue(event.target.value)
              }
              className="py-2 pl-9 rounded-xl border-slate-200/80 bg-white"
            />
          </div>
        )}
        
        {/* Column Visibility Selector */}
        <div className="relative ml-auto w-full sm:w-auto">
          <Button
            variant="glass"
            size="sm"
            onClick={() => setShowVisibilityMenu(!showVisibilityMenu)}
            className="w-full sm:w-auto flex items-center gap-2 border-slate-200/80 hover:bg-slate-50"
          >
            <SlidersHorizontal size={14} />
            Columns
          </Button>

          {showVisibilityMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowVisibilityMenu(false)} />
              <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white border border-slate-100 shadow-glossy-md p-2 z-20">
                <p className="text-xs font-semibold text-slate-400 px-2 py-1.5 uppercase tracking-wide">Toggle Columns</p>
                <div className="h-px bg-slate-100 my-1" />
                <div className="max-h-48 overflow-y-auto space-y-0.5">
                  {table
                    .getAllColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => {
                      return (
                        <label
                          key={column.id}
                          className="flex items-center gap-2 px-2 py-1.5 text-xs text-slate-600 hover:bg-slate-50 rounded-lg cursor-pointer transition-all"
                        >
                          <input
                            type="checkbox"
                            checked={column.getIsVisible()}
                            onChange={(e) => column.toggleVisibility(!!e.target.checked)}
                            className="rounded border-slate-300 text-brand-550 focus:ring-brand-100"
                          />
                          <span className="capitalize">{column.id}</span>
                        </label>
                      );
                    })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Glossy Table */}
      <div className="rounded-2xl border border-slate-200/60 overflow-hidden bg-white/70 backdrop-blur-md shadow-glossy-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-slate-200/80 bg-slate-50/70">
                  {headerGroup.headers.map((header) => {
                    return (
                      <th
                        key={header.id}
                        className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider select-none cursor-pointer"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <div className="flex items-center gap-1.5">
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                          {header.column.getCanSort() && (
                            <span className="text-slate-400">
                              {header.column.getIsSorted() === 'desc' ? (
                                <ChevronDown size={14} />
                              ) : header.column.getIsSorted() === 'asc' ? (
                                <ChevronUp size={14} />
                              ) : (
                                <div className="w-3.5 h-3.5" />
                              )}
                            </span>
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-slate-100/60">
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="py-3.5 px-4 text-sm text-slate-700 font-medium">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="h-24 text-center text-sm text-slate-400 font-medium"
                  >
                    No results found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1 text-slate-500">
        <div className="text-xs font-medium">
          Showing Page {table.getState().pagination.pageIndex + 1} of{' '}
          {table.getPageCount() || 1}
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            variant="glass"
            size="sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="p-1.5 rounded-lg border-slate-200/80 hover:bg-slate-50"
          >
            <ChevronsLeft size={16} />
          </Button>
          <Button
            variant="glass"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="p-1.5 rounded-lg border-slate-200/80 hover:bg-slate-50"
          >
            <ChevronLeft size={16} />
          </Button>
          <Button
            variant="glass"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="p-1.5 rounded-lg border-slate-200/80 hover:bg-slate-50"
          >
            <ChevronRight size={16} />
          </Button>
          <Button
            variant="glass"
            size="sm"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="p-1.5 rounded-lg border-slate-200/80 hover:bg-slate-50"
          >
            <ChevronsRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
