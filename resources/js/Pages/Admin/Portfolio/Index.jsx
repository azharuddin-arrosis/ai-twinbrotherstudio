import { useRef, useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { toast } from 'sonner';
import AdminLayout from '../../../Components/Layout/AdminLayout';
import DataTable from '../../../Components/Admin/DataTable';
import { Plus, Edit, Trash2, Eye, EyeOff, Star, GripVertical } from 'lucide-react';

export default function PortfolioIndex({ items }) {
    const [localItems, setLocalItems] = useState(items);
    const dragItem = useRef(null);
    const dragOverItem = useRef(null);

    const handleDragStart = (index) => { dragItem.current = index; };
    const handleDragEnter = (index) => { dragOverItem.current = index; };
    const handleDrop = () => {
        const newItems = [...localItems];
        const dragged = newItems.splice(dragItem.current, 1)[0];
        newItems.splice(dragOverItem.current, 0, dragged);
        const reordered = newItems.map((item, idx) => ({ ...item, order: idx }));
        setLocalItems(reordered);
        dragItem.current = null;
        dragOverItem.current = null;
        router.post('/admin/portfolio/reorder', {
            items: reordered.map(({ id, order }) => ({ id, order })),
        }, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => toast.success('Order updated.'),
            onError: () => toast.error('Failed to update order.'),
        });
    };

    const handleDelete = (id) => {
        if (confirm('Delete this portfolio item?')) {
            router.delete(`/admin/portfolio/${id}`, {
                onSuccess: () => toast.success('Portfolio item deleted.'),
                onError: () => toast.error('Failed to delete portfolio item.'),
            });
        }
    };

    const handleTogglePublish = (id) => {
        router.post(`/admin/portfolio/${id}/toggle-publish`, {}, {
            preserveScroll: true,
            onSuccess: () => toast.success('Publish status updated.'),
            onError: () => toast.error('Failed to update publish status.'),
        });
    };

    const columns = [
        {
            id: 'drag',
            header: '',
            enableSorting: false,
            cell: ({ row }) => (
                <div
                    className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 px-1"
                    draggable
                    onDragStart={() => handleDragStart(row.index)}
                    onDragEnter={() => handleDragEnter(row.index)}
                    onDragEnd={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                >
                    <GripVertical size={14} />
                </div>
            ),
        },
        {
            accessorKey: 'title',
            header: 'Project',
            enableSorting: true,
            cell: ({ row }) => {
                const item = row.original;
                return (
                    <div className="flex items-center gap-3">
                        {item.image_path ? (
                            <img
                                src={`/storage/${item.image_path}`}
                                alt={item.title}
                                className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-gray-100"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0" />
                        )}
                        <div>
                            <p className="font-medium text-gray-900 flex items-center gap-1.5">
                                {item.title}
                                {item.is_featured && (
                                    <Star size={11} className="text-amber-400 fill-amber-400" />
                                )}
                            </p>
                            <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{item.short_desc}</p>
                        </div>
                    </div>
                );
            },
        },
        {
            id: 'tech_stack',
            header: 'Stack',
            enableSorting: false,
            cell: ({ row }) => {
                const stack = row.original.tech_stack ?? [];
                return (
                    <div className="flex flex-wrap gap-1">
                        {stack.slice(0, 3).map((t) => (
                            <span key={t} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">
                                {t}
                            </span>
                        ))}
                        {stack.length > 3 && (
                            <span className="text-xs text-gray-400">+{stack.length - 3}</span>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: 'is_published',
            header: 'Status',
            enableSorting: true,
            cell: ({ getValue }) => {
                const published = getValue();
                return (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        published ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                        {published ? 'Published' : 'Draft'}
                    </span>
                );
            },
        },
        {
            id: 'actions',
            header: '',
            enableSorting: false,
            cell: ({ row }) => {
                const item = row.original;
                return (
                    <div className="flex items-center gap-1.5 justify-end">
                        <button
                            onClick={() => handleTogglePublish(item.id)}
                            className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
                            title={item.is_published ? 'Unpublish' : 'Publish'}
                        >
                            {item.is_published ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        <Link
                            href={`/admin/portfolio/${item.id}/edit`}
                            className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <Edit size={14} />
                        </Link>
                        <button
                            onClick={() => handleDelete(item.id)}
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
        <AdminLayout title="Portfolio">
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h2 className="text-sm font-semibold text-gray-900">Portfolio Items</h2>
                    <p className="text-xs text-gray-400 mt-0.5">{items.length} items total</p>
                </div>
                <Link
                    href="/admin/portfolio/create"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    <Plus size={14} /> New Item
                </Link>
            </div>

            <DataTable
                columns={columns}
                data={localItems}
                searchPlaceholder="Search portfolio..."
                pageSize={15}
                emptyText="No portfolio items yet."
            />
        </AdminLayout>
    );
}
