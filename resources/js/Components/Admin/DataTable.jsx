import React, { useState } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    flexRender,
} from '@tanstack/react-table';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

export default function DataTable({
    columns,
    data,
    searchPlaceholder = 'Search...',
    pageSize = 15,
    emptyText = 'No data found.',
    rowClassName,
    onRowClick,
    renderSubRow,
}) {
    const [sorting, setSorting] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize });

    const table = useReactTable({
        data,
        columns,
        state: { sorting, globalFilter, pagination },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    const { pageIndex } = table.getState().pagination;
    const pageCount = table.getPageCount();
    const totalFiltered = table.getFilteredRowModel().rows.length;
    const firstRow = pageIndex * pageSize + 1;
    const lastRow = Math.min((pageIndex + 1) * pageSize, totalFiltered);

    return (
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
            {/* Search bar */}
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between gap-3">
                <input
                    type="text"
                    value={globalFilter}
                    onChange={(e) => {
                        setGlobalFilter(e.target.value);
                        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
                    }}
                    placeholder={searchPlaceholder}
                    className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 w-60"
                />
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-400 w-10 text-center select-none">#</th>
                                {headerGroup.headers.map((header) => {
                                    const canSort = header.column.getCanSort();
                                    const sortDir = header.column.getIsSorted();

                                    return (
                                        <th
                                            key={header.id}
                                            className="text-left px-4 py-3 text-xs font-semibold text-gray-500 select-none"
                                        >
                                            {header.isPlaceholder ? null : (
                                                <button
                                                    type="button"
                                                    disabled={!canSort}
                                                    onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                                                    className={`inline-flex items-center gap-1 ${canSort ? 'cursor-pointer hover:text-gray-700' : 'cursor-default'}`}
                                                >
                                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                                    {canSort && (
                                                        <span className="inline-flex flex-col -space-y-px">
                                                            <ChevronUp
                                                                size={10}
                                                                className={sortDir === 'asc' ? 'text-indigo-500' : 'text-gray-300'}
                                                            />
                                                            <ChevronDown
                                                                size={10}
                                                                className={sortDir === 'desc' ? 'text-indigo-500' : 'text-gray-300'}
                                                            />
                                                        </span>
                                                    )}
                                                </button>
                                            )}
                                        </th>
                                    );
                                })}
                            </tr>
                        ))}
                    </thead>

                    <tbody>
                        {table.getRowModel().rows.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length + 1}
                                    className="px-4 py-10 text-sm text-center text-gray-400"
                                >
                                    {emptyText}
                                </td>
                            </tr>
                        ) : (
                            table.getRowModel().rows.map((row) => (
                                <React.Fragment key={row.id}>
                                    <tr
                                        className={`border-b border-gray-50 hover:bg-gray-50/50 ${rowClassName ? rowClassName(row) : ''}`}
                                        onClick={onRowClick ? () => onRowClick(row) : undefined}
                                    >
                                        <td className="px-4 py-3 text-xs text-gray-400 text-center w-10 tabular-nums">
                                            {pageIndex * table.getState().pagination.pageSize + row.index + 1}
                                        </td>
                                        {row.getVisibleCells().map((cell) => (
                                            <td key={cell.id} className="px-4 py-3 text-sm">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                    {renderSubRow && renderSubRow(row)}
                                </React.Fragment>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalFiltered > 0 && (
                <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between gap-3 flex-wrap">
                    <p className="text-xs text-gray-500">
                        Showing {firstRow}–{lastRow} of {totalFiltered} entries
                    </p>

                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                            Page {pageIndex + 1} of {pageCount}
                        </span>

                        <button
                            type="button"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                        >
                            <ChevronLeft size={14} />
                            Prev
                        </button>

                        <button
                            type="button"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                        >
                            Next
                            <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
