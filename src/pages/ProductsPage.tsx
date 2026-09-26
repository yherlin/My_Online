import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from '../context/RouterContext';
import { useToast } from '../context/ToastContext';
import { productService } from '../services/productService';
import { Product, ProductCategory, ProductStatus } from '../types';
import { CATEGORIES_LIST } from '../data/mockData';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Badge } from '../components/common/Badge';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { EmptyState } from '../components/common/EmptyState';
import { ProductFormModal } from '../components/products/ProductFormModal';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  ShoppingCart,
  TrendingDown,
  ArrowUpDown,
  Tag,
  Boxes,
  X,
} from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const { user, canCreateProducts, canEditProducts, canDeleteProducts, canSellProducts, canBuyProducts } = useAuth();
  const { navigate } = useRouter();
  const toast = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'price-asc' | 'price-desc' | 'name' | 'stock'>('recent');

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Delete confirm dialog
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Quick sale/purchase modal or action
  const [actionTarget, setActionTarget] = useState<{ product: Product; type: 'sale' | 'buy' } | null>(null);

  const fetchProducts = async () => {
    try {
      const data = await productService.getProducts();
      setProducts(data);
    } catch {
      toast.error('Error al cargar la lista de productos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Status filter
    if (selectedStatus !== 'all') {
      result = result.filter((p) => p.status === selectedStatus);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'recent') {
        return b.createdAt.localeCompare(a.createdAt);
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'price-asc') {
        return a.price - b.price;
      }
      if (sortBy === 'price-desc') {
        return b.price - a.price;
      }
      if (sortBy === 'stock') {
        return a.stock - b.stock;
      }
      return 0;
    });

    return result;
  }, [products, searchQuery, selectedCategory, selectedStatus, sortBy]);

  // Handlers
  const handleOpenCreate = () => {
    setEditingProduct(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (product: Product, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingProduct(product);
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = async (formData: Partial<Product>) => {
    try {
      if (editingProduct) {
        const updated = await productService.updateProduct(editingProduct.id, formData);
        setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        toast.success(`Producto "${updated.name}" actualizado con éxito.`);
      } else {
        const created = await productService.createProduct(formData as any);
        setProducts((prev) => [created, ...prev]);
        toast.success(`Producto "${created.name}" registrado en la plataforma Cloud.`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar el producto.';
      toast.error(msg);
      throw err;
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const ok = await productService.deleteProduct(deleteTarget.id);
      if (ok) {
        setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
        toast.success(`Producto "${deleteTarget.name}" eliminado del catálogo.`);
      }
    } catch {
      toast.error('No fue posible eliminar el producto.');
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleQuickPurchaseOrSale = async (product: Product, type: 'buy' | 'sale', e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (product.stock <= 0) {
      toast.warning('No hay existencias disponibles para este producto.');
      return;
    }

    try {
      const updated = await productService.purchaseProduct(product.id, 1);
      setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      if (type === 'sale') {
        toast.success(`Venta registrada: 1x "${product.name}". Nuevo stock: ${updated.stock} un.`);
      } else {
        toast.success(`¡Compra procesada con éxito para "${product.name}"!`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error en la transacción.';
      toast.error(msg);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'USD',
    }).format(val);
  };

  const hasActiveFilters = searchQuery !== '' || selectedCategory !== 'all' || selectedStatus !== 'all';

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedStatus('all');
    setSortBy('recent');
  };

  return (
    <div className="space-y-6 text-left">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Catálogo de Productos
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Administra los servidores, dispositivos de red, almacenamiento e infraestructura Cloud.
          </p>
        </div>

        {canCreateProducts && (
          <Button
            variant="primary"
            onClick={handleOpenCreate}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            + Nuevo producto
          </Button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl bg-white p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="md:col-span-2">
            <Input
              placeholder="Buscar por nombre, SKU o especificación técnica..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              startIcon={<Search className="w-4 h-4" />}
              endIcon={
                searchQuery ? (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="p-1 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : undefined
              }
            />
          </div>

          {/* Category Filter */}
          <div>
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              options={[
                { value: 'all', label: 'Todas las categorías' },
                ...CATEGORIES_LIST.map((c) => ({ value: c, label: c })),
              ]}
            />
          </div>

          {/* Status Filter */}
          <div>
            <Select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              options={[
                { value: 'all', label: 'Todos los estados' },
                { value: 'Activo', label: 'Activo' },
                { value: 'Inactivo', label: 'Inactivo' },
                { value: 'Agotado', label: 'Agotado' },
              ]}
            />
          </div>
        </div>

        {/* Second Row: Sorting + Active indicators */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>
              Mostrando <strong>{filteredProducts.length}</strong> de {products.length} productos
            </span>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-blue-600 hover:text-blue-800 font-semibold underline ml-2 cursor-pointer"
              >
                Limpiar filtros
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 flex items-center gap-1">
              <ArrowUpDown className="w-3 h-3" />
              Ordenar por:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="recent">Más recientes</option>
              <option value="name">Nombre (A-Z)</option>
              <option value="price-asc">Precio: Menor a Mayor</option>
              <option value="price-desc">Precio: Mayor a Menor</option>
              <option value="stock">Stock disponible</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Table (Desktop) & Cards (Mobile) */}
      {loading ? (
        <div className="rounded-2xl bg-white p-12 border border-slate-200 text-center">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-500">Cargando inventario Cloud...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <EmptyState
          title="No se encontraron productos"
          description={
            hasActiveFilters
              ? 'Intenta ajustar los criterios de búsqueda o filtros seleccionados.'
              : 'Aún no hay productos registrados en el sistema.'
          }
          actionText={hasActiveFilters ? 'Restablecer filtros' : canCreateProducts ? '+ Crear primer producto' : undefined}
          onAction={hasActiveFilters ? resetFilters : handleOpenCreate}
        />
      ) : (
        <div className="rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-6">Imagen & Nombre</th>
                  <th className="py-3.5 px-4">Categoría</th>
                  <th className="py-3.5 px-4">Precio</th>
                  <th className="py-3.5 px-4">Stock</th>
                  <th className="py-3.5 px-4">Estado</th>
                  <th className="py-3.5 px-4">Fecha de Registro</th>
                  <th className="py-3.5 px-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => navigate(`/products/${product.id}`)}
                  >
                    {/* Image & Name */}
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200 shrink-0 bg-slate-100"
                        />
                        <div className="min-w-0 max-w-xs">
                          <p className="font-semibold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                            {product.name}
                          </p>
                          <p className="text-xs text-slate-400 font-mono mt-0.5">
                            SKU: {product.sku}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 text-xs text-slate-700 font-medium bg-slate-100/80 px-2.5 py-1 rounded-md">
                        <Tag className="w-3 h-3 text-slate-400" />
                        {product.category}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {formatCurrency(product.price)}
                    </td>

                    {/* Stock */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-xs font-bold ${
                          product.stock === 0
                            ? 'text-rose-600 bg-rose-50 px-2 py-0.5 rounded'
                            : product.stock < 5
                            ? 'text-amber-600 bg-amber-50 px-2 py-0.5 rounded'
                            : 'text-slate-700'
                        }`}
                      >
                        {product.stock} un.
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          product.status === 'Activo'
                            ? 'success'
                            : product.status === 'Agotado'
                            ? 'danger'
                            : 'neutral'
                        }
                        size="sm"
                        dot
                      >
                        {product.status}
                      </Badge>
                    </td>

                    {/* Created Date */}
                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      {product.createdAt}
                    </td>

                    {/* Action buttons */}
                    <td className="py-3.5 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View Details */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/products/${product.id}`)}
                          title="Ver detalle del producto"
                        >
                          <Eye className="w-4 h-4 text-slate-500" />
                        </Button>

                        {/* Edit (Admin or Empleado) */}
                        {canEditProducts && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleOpenEdit(product, e)}
                            title="Editar producto"
                          >
                            <Edit2 className="w-4 h-4 text-blue-600" />
                          </Button>
                        )}

                        {/* Empleado: Realizar venta */}
                        {canSellProducts && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={(e) => handleQuickPurchaseOrSale(product, 'sale', e)}
                            title="Registrar venta de 1 unidad"
                            className="text-xs text-emerald-700 hover:bg-emerald-50"
                            disabled={product.stock === 0}
                          >
                            <TrendingDown className="w-3.5 h-3.5 text-emerald-600 mr-1" />
                            Vender
                          </Button>
                        )}

                        {/* Usuario: Comprar */}
                        {user?.role === 'Usuario' && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={(e) => handleQuickPurchaseOrSale(product, 'buy', e)}
                            title="Comprar producto"
                            className="text-xs"
                            disabled={product.stock === 0}
                          >
                            <ShoppingCart className="w-3.5 h-3.5 mr-1" />
                            Comprar
                          </Button>
                        )}

                        {/* Delete (Admin only) */}
                        {canDeleteProducts && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteTarget(product);
                            }}
                            title="Eliminar producto (Solo Administrador)"
                          >
                            <Trash2 className="w-4 h-4 text-rose-500" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View */}
          <div className="block lg:hidden divide-y divide-slate-100">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => navigate(`/products/${product.id}`)}
                className="p-4 sm:p-5 hover:bg-slate-50 transition-colors space-y-3 cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-16 h-16 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <Badge
                        variant={
                          product.status === 'Activo'
                            ? 'success'
                            : product.status === 'Agotado'
                            ? 'danger'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        {product.status}
                      </Badge>
                      <span className="text-sm font-extrabold text-slate-900">
                        {formatCurrency(product.price)}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm mt-1 truncate">
                      {product.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      SKU: {product.sku}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
                  <span className="truncate">{product.category}</span>
                  <span>Stock: <strong>{product.stock} un.</strong></span>
                </div>

                {/* Mobile action bar */}
                <div
                  className="flex items-center justify-end gap-2 pt-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/products/${product.id}`)}
                  >
                    Ver detalles
                  </Button>

                  {canEditProducts && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => handleOpenEdit(product, e)}
                    >
                      Editar
                    </Button>
                  )}

                  {canSellProducts && (
                    <Button
                      variant="success"
                      size="sm"
                      onClick={(e) => handleQuickPurchaseOrSale(product, 'sale', e)}
                      disabled={product.stock === 0}
                    >
                      Vender
                    </Button>
                  )}

                  {user?.role === 'Usuario' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={(e) => handleQuickPurchaseOrSale(product, 'buy', e)}
                      disabled={product.stock === 0}
                    >
                      Comprar
                    </Button>
                  )}

                  {canDeleteProducts && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(product);
                      }}
                    >
                      Eliminar
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Create / Edit Product */}
      <ProductFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingProduct}
        isEditing={!!editingProduct}
      />

      {/* Confirmation Dialog: Delete Product */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="¿Eliminar producto del catálogo?"
        message={`¿Estás seguro de que deseas eliminar permanentemente "${deleteTarget?.name}"? Esta acción removerá el ítem de las consultas y estadísticas.`}
        confirmText="Sí, eliminar producto"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};
