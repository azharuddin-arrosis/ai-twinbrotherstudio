import { Link, router } from '@inertiajs/react';
import { toast } from 'sonner';
import AdminLayout from '../../../Components/Layout/AdminLayout';
import DataTable from '../../../Components/Admin/DataTable';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function CategoriesIndex({ categories }) {
    const columns = [
        {
            accessorKey: 'name',
            header: 'Category',
            enableSorting: true,
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <span
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: row.original.color }}
                    />
                    <span className="font-medium text-gray-900">{row.original.name}</span>
                </div>
            ),
        },
        {
            accessorKey: 'slug',
            header: 'Slug',
            enableSorting: true,
            cell: ({ getValue }) => (
                <span className="font-mono text-xs text-gray-400">{getValue()}</span>
            ),
        },
        {
            accessorKey: 'articles_count',
            header: 'Articles',
            enableSorting: true,
            cell: ({ getValue }) => (
                <span className="text-gray-500">{getValue()}</span>
            ),
        },
        {
            accessorKey: 'sort_order',
            header: 'Order',
            enableSorting: true,
            cell: ({ getValue }) => (
                <span className="text-gray-400">{getValue()}</span>
            ),
        },
        {
            id: 'actions',
            header: '',
            enableSorting: false,
            cell: ({ row }) => {
                const cat = row.original;
                return (
                    <div className="flex items-center gap-1.5 justify-end">
                        <Link
                            href={`/admin/categories/${cat.id}/edit`}
                            className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <Edit size={14} />
                        </Link>
                        <button
                            onClick={() => {
                                if (confirm('Delete this category? Articles will be deleted too.')) {
                                    router.delete(`/admin/categories/${cat.id}`, {
                                        onSuccess: () => toast.success('Category deleted.'),
                                        onError: () => toast.error('Failed to delete category.'),
                                    });
                                }
                            }}
                            className="p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                );
            },
        },
    ];

    return (
        <AdminLayout title="Categories">
            <div className="flex items-center justify-between mb-5">
                <p className="text-sm text-gray-500">{categories.length} categories</p>
                <Link
                    href="/admin/categories/create"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    <Plus size={14} /> New Category
                </Link>
            </div>

            <DataTable
                columns={columns}
                data={categories}
                searchPlaceholder="Search categories..."
                pageSize={15}
                emptyText="No categories found."
            />
        </AdminLayout>
    );
}
