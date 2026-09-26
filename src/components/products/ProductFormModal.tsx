import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { ImageUploader } from '../common/ImageUploader';
import { Product, ProductCategory, ProductStatus } from '../../types';
import { CATEGORIES_LIST } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import { Tag, DollarSign, PackageCheck, FileText, Check } from 'lucide-react';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Product>) => Promise<void>;
  initialData?: Product | null;
  isEditing?: boolean;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEditing = false,
}) => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Servidores Cloud');
  const [price, setPrice] = useState<string>('99.00');
  const [stock, setStock] = useState<string>('10');
  const [status, setStatus] = useState<ProductStatus>('Activo');
  const [imageUrl, setImageUrl] = useState('');
  const [sku, setSku] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData && isEditing) {
      setName(initialData.name);
      setDescription(initialData.description);
      setCategory(initialData.category);
      setPrice(String(initialData.price));
      setStock(String(initialData.stock));
      setStatus(initialData.status);
      setImageUrl(initialData.imageUrl);
      setSku(initialData.sku);
    } else {
      // Defaults for new product
      setName('');
      setDescription('');
      setCategory('Servidores Cloud');
      setPrice('450.00');
      setStock('12');
      setStatus('Activo');
      setImageUrl('https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80');
      setSku('');
    }
    setErrors({});
  }, [initialData, isEditing, isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'El nombre del producto es obligatorio';
    } else if (name.trim().length < 3) {
      newErrors.name = 'Debe tener al menos 3 caracteres';
    }

    if (!description.trim()) {
      newErrors.description = 'La descripción es obligatoria';
    }

    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      newErrors.price = 'Ingresa un precio válido mayor a 0';
    }

    const numStock = Number(stock);
    if (isNaN(numStock) || numStock < 0 || !Number.isInteger(numStock)) {
      newErrors.stock = 'El stock debe ser un número entero no negativo';
    }

    if (!imageUrl) {
      newErrors.image = 'La imagen del producto es obligatoria';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim(),
        category,
        price: Number(price),
        stock: Number(stock),
        status: Number(stock) === 0 ? 'Agotado' : status,
        imageUrl,
        sku: sku || undefined,
        createdBy: initialData?.createdBy || user?.name || 'Administrador Cloud',
        createdById: initialData?.createdById || user?.id,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Producto' : 'Registrar Nuevo Producto'}
      subtitle={
        isEditing
          ? 'Actualiza las especificaciones técnicas, precio o inventario disponible.'
          : 'Ingresa los datos para catalogar un nuevo producto en la plataforma Cloud.'
      }
      maxWidth="2xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            leftIcon={<Check className="w-4 h-4" />}
          >
            {isEditing ? 'Guardar Cambios' : 'Crear Producto'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Nombre del Producto *"
            placeholder="ej. Servidor Rack Enterprise X900"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
            startIcon={<Tag className="w-4 h-4" />}
          />

          <Input
            label="Código SKU (Opcional)"
            placeholder="ej. CP-SRV-902"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            helperText="Si lo dejas vacío se autogenerará con el prefijo Cloud"
          />
        </div>

        {/* Category & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Categoría *"
            value={category}
            onChange={(e) => setCategory(e.target.value as ProductCategory)}
            options={CATEGORIES_LIST as unknown as string[]}
          />

          <Select
            label="Estado Inicial *"
            value={status}
            onChange={(e) => setStatus(e.target.value as ProductStatus)}
            options={[
              { value: 'Activo', label: 'Activo (En catálogo)' },
              { value: 'Inactivo', label: 'Inactivo (Oculto)' },
              { value: 'Agotado', label: 'Agotado (Sin inventario)' },
            ]}
          />
        </div>

        {/* Price & Stock */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Precio Unitario ($ USD) *"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            error={errors.price}
            startIcon={<DollarSign className="w-4 h-4" />}
          />

          <Input
            label="Stock Disponible (Unidades) *"
            type="number"
            min="0"
            step="1"
            placeholder="0"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            error={errors.stock}
            startIcon={<PackageCheck className="w-4 h-4" />}
          />
        </div>

        {/* Description */}
        <div className="text-left space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 tracking-wide">
            Descripción Detallada *
          </label>
          <div className="relative">
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe las características técnicas, capacidades y compatibilidad del producto..."
              className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.description ? 'border-rose-300' : 'border-slate-300'
              }`}
            />
          </div>
          {errors.description && (
            <p className="text-xs text-rose-600 font-medium">{errors.description}</p>
          )}
        </div>

        {/* Image Uploader */}
        <ImageUploader
          label="Imagen del Producto (Drag & Drop o Selección) *"
          value={imageUrl}
          onChange={(url) => setImageUrl(url)}
          error={errors.image}
          heightClass="h-44"
        />
      </form>
    </Modal>
  );
};
