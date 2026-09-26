import React, { useState, useEffect } from 'react';
import { useRouter } from '../context/RouterContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { productService } from '../services/productService';
import { Product } from '../types';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { ProductFormModal } from '../components/products/ProductFormModal';
import {
  ArrowLeft,
  Edit2,
  Trash2,
  Calendar,
  User as UserIcon,
  Tag,
  DollarSign,
  PackageCheck,
  ShieldCheck,
  Server,
  ShoppingCart,
  TrendingDown,
  Layers,
  Sparkles,
  Check,
} from 'lucide-react';

export const ProductDetailPage: React.FC = () => {
  const { params, navigate } = useRouter();
  const { user, canEditProducts, canDeleteProducts, canSellProducts, canBuyProducts } = useAuth();
  const toast = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit modal
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Delete confirm
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Interactive quantity for buy/sale
  const [quantity, setQuantity] = useState(1);
  const [isTransacting, setIsTransacting] = useState(false);

  const productId = params.id;

  const loadProduct = async () => {
    if (!productId) {
      navigate('/products');
      return;
    }
    setLoading(true);
    try {
      const data = await productService.getProductById(productId);
      if (!data) {
        toast.error('Producto no encontrado.');
        navigate('/products');
        return;
      }
      setProduct(data);
    } catch {
      toast.error('Error al cargar la información del producto.');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const handleUpdate = async (formData: Partial<Product>) => {
    if (!product) return;
    try {
      const updated = await productService.updateProduct(product.id, formData);
      setProduct(updated);
      toast.success(`Producto "${updated.name}" actualizado correctamente.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al actualizar producto.';
      toast.error(msg);
      throw err;
    }
  };

  const handleDelete = async () => {
    if (!product) return;
    setIsDeleting(true);
    try {
      await productService.deleteProduct(product.id);
      toast.success(`Producto "${product.name}" eliminado del catálogo.`);
      navigate('/products');
    } catch {
      toast.error('Error al eliminar el producto.');
    } finally {
      setIsDeleting(false);
      setIsDeleteOpen(false);
    }
  };

  const handleTransaction = async (type: 'sale' | 'buy') => {
    if (!product) return;
    if (product.stock < quantity) {
      toast.warning(`Solo quedan ${product.stock} unidades disponibles.`);
      return;
    }

    setIsTransacting(true);
    try {
      const updated = await productService.purchaseProduct(product.id, quantity);
      setProduct(updated);
      if (type === 'sale') {
        toast.success(`Se registró la venta de ${quantity} unidad(es). Stock restante: ${updated.stock}`);
      } else {
        toast.success(`¡Compra procesada con éxito por ${quantity} unidad(es)!`);
      }
      setQuantity(1);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error en la operación.';
      toast.error(msg);
    } finally {
      setIsTransacting(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'USD',
    }).format(val);
  };

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-12 border border-slate-200 text-center">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium text-slate-500">Cargando detalles del producto...</p>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="space-y-6 text-left">
      {/* Back button and quick actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/products')}
          leftIcon={<ArrowLeft className="w-4 h-4" />}
        >
          Volver a productos
        </Button>

        <div className="flex items-center gap-2">
          {canEditProducts && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditOpen(true)}
              leftIcon={<Edit2 className="w-4 h-4 text-blue-600" />}
            >
              Editar producto
            </Button>
          )}

          {canDeleteProducts && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => setIsDeleteOpen(true)}
              leftIcon={<Trash2 className="w-4 h-4" />}
            >
              Eliminar producto
            </Button>
          )}
        </div>
      </div>

      {/* Main Product Card */}
      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-8">
          {/* Left Column: Big Image Display */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-slate-100 ring-1 ring-slate-200/80 shadow-inner group">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute top-4 left-4">
                <Badge
                  variant={
                    product.status === 'Activo'
                      ? 'success'
                      : product.status === 'Agotado'
                      ? 'danger'
                      : 'neutral'
                  }
                  size="md"
                  dot
                >
                  {product.status}
                </Badge>
              </div>
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white bg-slate-900/60 backdrop-blur-md px-3 py-1.5 rounded-xl">
                <span>SKU: {product.sku}</span>
                <span>Resolución Cloud 4K</span>
              </div>
            </div>

            {/* Spec tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs font-semibold text-slate-400">Etiquetas:</span>
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-medium bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Information & Actions */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
                  <Tag className="w-3.5 h-3.5" />
                  {product.category}
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {product.name}
                </h1>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  ID: {product.id} • SKU: {product.sku}
                </p>
              </div>

              {/* Price & Stock Banner */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-slate-500">Precio Unitario</span>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900">
                    {formatCurrency(product.price)}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-medium text-slate-500">Stock Actual</span>
                  <div
                    className={`text-xl font-extrabold ${
                      product.stock === 0 ? 'text-rose-600' : 'text-slate-900'
                    }`}
                  >
                    {product.stock} <span className="text-xs font-normal text-slate-500">unidades</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Descripción del Producto
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Metadata Details Grid */}
              <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 space-y-1">
                  <span className="text-slate-400 font-medium flex items-center gap-1">
                    <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                    Registrado por
                  </span>
                  <p className="font-semibold text-slate-800">{product.createdBy}</p>
                </div>

                <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 space-y-1">
                  <span className="text-slate-400 font-medium flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    Fecha de Registro
                  </span>
                  <p className="font-semibold text-slate-800">{product.createdAt}</p>
                </div>
              </div>
            </div>

            {/* Interactive Buy / Sell Sandbox */}
            <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  Operación en Tiempo Real
                </span>
                <span className="text-[11px] font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                  Rol: {user?.role}
                </span>
              </div>

              {product.stock > 0 ? (
                <div className="space-y-3 pt-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-600 font-medium">Cantidad:</span>
                    <div className="flex items-center border border-slate-300 rounded-lg bg-white overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 text-xs font-bold text-slate-900">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                        className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    <span className="text-xs text-slate-500">
                      Total: <strong className="text-slate-900">{formatCurrency(product.price * quantity)}</strong>
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {canSellProducts && (
                      <Button
                        variant="success"
                        size="md"
                        isLoading={isTransacting}
                        onClick={() => handleTransaction('sale')}
                        leftIcon={<TrendingDown className="w-4 h-4" />}
                      >
                        Registrar Venta ({quantity})
                      </Button>
                    )}

                    {canBuyProducts && (
                      <Button
                        variant="primary"
                        size="md"
                        isLoading={isTransacting}
                        onClick={() => handleTransaction('buy')}
                        leftIcon={<ShoppingCart className="w-4 h-4" />}
                      >
                        {user?.role === 'Usuario' ? 'Comprar Ahora' : 'Simular Compra'}
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-rose-600 font-bold">
                  Este producto está actualmente agotado. El stock debe ser reabastecido por un Administrador o Empleado.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <ProductFormModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSubmit={handleUpdate}
        initialData={product}
        isEditing={true}
      />

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="¿Eliminar producto?"
        message={`¿Estás seguro de que deseas eliminar permanentemente el producto "${product.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar definitivamente"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};
