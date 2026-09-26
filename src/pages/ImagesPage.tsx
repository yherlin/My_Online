import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { imageService } from '../services/imageService';
import { CloudImage } from '../types';
import { ImageUploader } from '../components/common/ImageUploader';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { EmptyState } from '../components/common/EmptyState';
import {
  UploadCloud,
  Trash2,
  Maximize2,
  Calendar,
  HardDrive,
  Tag,
  CheckCircle2,
  Sparkles,
  Layers,
  Search,
  Filter,
} from 'lucide-react';

export const ImagesPage: React.FC = () => {
  const { user, canManageImages, isAdmin } = useAuth();
  const toast = useToast();

  const [images, setImages] = useState<CloudImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Upload area state
  const [newImageBase64, setNewImageBase64] = useState('');
  const [newFileData, setNewFileData] = useState<{ name: string; size: number; type: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<CloudImage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Lightbox preview modal
  const [previewImage, setPreviewImage] = useState<CloudImage | null>(null);

  const fetchImages = async () => {
    try {
      const data = await imageService.getImages();
      setImages(data);
    } catch {
      toast.error('Error al cargar la galería de imágenes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleUploadNew = async () => {
    if (!newImageBase64 || !newFileData) {
      toast.warning('Por favor selecciona o arrastra una imagen antes de subir.');
      return;
    }

    setIsUploading(true);
    try {
      const uploaded = await imageService.uploadImage(
        {
          name: newFileData.name,
          size: newFileData.size,
          type: newFileData.type,
          base64Url: newImageBase64,
        },
        {
          uploadedBy: user?.name || 'Administrador',
          productName: 'Equipo Cloud sin vincular',
        }
      );

      setImages((prev) => [uploaded, ...prev]);
      setNewImageBase64('');
      setNewFileData(null);
      toast.success(`Imagen "${uploaded.name}" guardada en la galería Cloud CDN.`);
    } catch {
      toast.error('No se pudo completar la subida de la imagen.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const ok = await imageService.deleteImage(deleteTarget.id);
      if (ok) {
        setImages((prev) => prev.filter((img) => img.id !== deleteTarget.id));
        toast.success(`Imagen "${deleteTarget.name}" eliminada.`);
      }
    } catch {
      toast.error('Error al eliminar la imagen.');
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  const filteredImages = images.filter(
    (img) =>
      img.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (img.productName && img.productName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Almacenamiento de Imágenes Cloud
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Galería multimedia de activos, fotografías de servidores y diagramas de arquitectura.
          </p>
        </div>

        {/* Cloud quota chip */}
        <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-slate-200/80 shadow-2xs">
          <HardDrive className="w-4 h-4 text-blue-600" />
          <div className="text-xs">
            <span className="font-bold text-slate-800">{images.length} Archivos</span>
            <span className="text-slate-400"> • 24.8 MB de 5 GB</span>
          </div>
        </div>
      </div>

      {/* Upload Zone (Only for Admin & Empleado) */}
      {canManageImages && (
        <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Zona de Carga Multimedia
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              Simulación lista para Firebase Storage
            </span>
          </div>

          <ImageUploader
            value={newImageBase64}
            onChange={(url, fileData) => {
              setNewImageBase64(url);
              if (fileData) setNewFileData(fileData);
            }}
            label=""
            helperText="Arrastra archivos de imagen o haz clic para seleccionarlos desde tu equipo."
            heightClass="h-44"
          />

          {newImageBase64 && (
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setNewImageBase64('');
                  setNewFileData(null);
                }}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleUploadNew}
                isLoading={isUploading}
                leftIcon={<UploadCloud className="w-4 h-4" />}
              >
                Subir al Storage Cloud
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Gallery Filter & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar imagen por nombre o producto..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <span className="text-xs text-slate-500 font-medium">
          Mostrando <strong>{filteredImages.length}</strong> imágenes
        </span>
      </div>

      {/* Images Grid */}
      {loading ? (
        <div className="rounded-2xl bg-white p-12 border border-slate-200 text-center">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-500">Cargando biblioteca multimedia...</p>
        </div>
      ) : filteredImages.length === 0 ? (
        <EmptyState
          title="No hay imágenes coincidentes"
          description="Sube una nueva imagen mediante la zona superior o prueba con otro término de búsqueda."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredImages.map((image) => (
            <div
              key={image.id}
              className="rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col group"
            >
              {/* Image Preview Container */}
              <div
                className="relative aspect-4/3 overflow-hidden bg-slate-100 cursor-pointer"
                onClick={() => setPreviewImage(image)}
              >
                <img
                  src={image.url}
                  alt={image.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewImage(image);
                    }}
                    className="p-2 rounded-lg bg-white/90 text-slate-800 hover:bg-white shadow-md transition-transform hover:scale-110 cursor-pointer"
                    title="Ver en tamaño completo"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>

                  {canManageImages && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(image);
                      }}
                      className="p-2 rounded-lg bg-rose-600/90 text-white hover:bg-rose-600 shadow-md transition-transform hover:scale-110 cursor-pointer"
                      title="Eliminar imagen"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-slate-950/60 backdrop-blur-xs text-[10px] font-bold text-white">
                  {image.size}
                </div>
              </div>

              {/* Card Meta Content */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-2.5">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 truncate" title={image.name}>
                    {image.name}
                  </h4>
                  {image.productName && (
                    <p className="text-[11px] text-blue-600 truncate mt-0.5 flex items-center gap-1 font-medium">
                      <Tag className="w-3 h-3 shrink-0" />
                      {image.productName}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {image.uploadedAt}
                  </span>

                  {canManageImages && (
                    <button
                      onClick={() => setDeleteTarget(image)}
                      className="text-slate-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                      title="Eliminar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      <Modal
        isOpen={!!previewImage}
        onClose={() => setPreviewImage(null)}
        title={previewImage?.name || 'Previsualización de Imagen'}
        subtitle={`Tamaño: ${previewImage?.size} • Subido por: ${previewImage?.uploadedBy || 'Administrador'}`}
        maxWidth="3xl"
        footer={
          <Button variant="outline" onClick={() => setPreviewImage(null)}>
            Cerrar
          </Button>
        }
      >
        {previewImage && (
          <div className="space-y-4">
            <div className="w-full max-h-[60vh] rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center">
              <img
                src={previewImage.url}
                alt={previewImage.name}
                className="max-h-[60vh] w-auto max-w-full object-contain"
              />
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
              <span>Resolución: {previewImage.dimensions || '1920x1080'}</span>
              <span>Formato: {previewImage.type}</span>
              <span>Fecha: {previewImage.uploadedAt}</span>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="¿Eliminar imagen de la galería?"
        message={`¿Estás seguro de que deseas eliminar la imagen "${deleteTarget?.name}"? Esta acción borrará el archivo del almacenamiento Cloud.`}
        confirmText="Sí, eliminar imagen"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};
