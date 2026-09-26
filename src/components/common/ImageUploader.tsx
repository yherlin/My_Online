import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, Trash2, CheckCircle2, Sparkles } from 'lucide-react';
import { Button } from './Button';

interface ImageUploaderProps {
  value?: string;
  onChange: (base64OrUrl: string, fileData?: { name: string; size: number; type: string }) => void;
  label?: string;
  error?: string;
  helperText?: string;
  heightClass?: string;
}

const SAMPLE_PRESETS = [
  {
    name: 'Servidor Blade Rack',
    url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Matriz NVMe SAN',
    url: 'https://images.unsplash.com/photo-1597852074816-d933c4d2b988?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Switch Troncal 100G',
    url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Firewall NGFW',
    url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Dispositivo IoT Edge',
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
  },
];

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  value,
  onChange,
  label = 'Imagen del producto',
  error,
  helperText = 'Formatos soportados: JPG, PNG, WEBP hasta 5MB. (Simulación local para Firebase Storage)',
  heightClass = 'h-48',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string>('');
  const [fileSizeStr, setFileSizeStr] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileProcess = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido (JPG, PNG, WebP).');
      return;
    }

    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    setFileName(file.name);
    setFileSizeStr(`${sizeInMB} MB`);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onChange(result, {
        name: file.name,
        size: file.size,
        type: file.type,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setFileName('');
    setFileSizeStr('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full space-y-2 text-left">
      {label && (
        <label className="block text-xs font-semibold text-slate-700 tracking-wide">
          {label}
        </label>
      )}

      {value ? (
        // Preview state
        <div className="relative rounded-xl border border-slate-200 overflow-hidden bg-slate-50 group">
          <div className={`w-full ${heightClass} relative flex items-center justify-center bg-slate-900/5`}>
            <img
              src={value}
              alt="Previsualización"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
            />
            <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
                leftIcon={<ImageIcon className="w-4 h-4" />}
              >
                Cambiar imagen
              </Button>
              <Button
                type="button"
                size="sm"
                variant="danger"
                onClick={handleClear}
                leftIcon={<Trash2 className="w-4 h-4" />}
              >
                Eliminar
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between px-3 py-2 bg-white border-t border-slate-100 text-xs text-slate-500">
            <span className="flex items-center gap-1.5 font-medium text-slate-700 truncate max-w-[200px]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              {fileName || 'Imagen cargada en previsualización'}
            </span>
            <span>{fileSizeStr || 'Almacenamiento Local'}</span>
          </div>
        </div>
      ) : (
        // Dropzone state
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed transition-all cursor-pointer select-none text-center ${
            isDragging
              ? 'border-blue-500 bg-blue-50/50 scale-[1.01]'
              : 'border-slate-300 hover:border-blue-400 bg-slate-50/60 hover:bg-slate-50'
          }`}
        >
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-3 shadow-xs">
            <UploadCloud className="w-6 h-6 animate-pulse" />
          </div>
          <h4 className="text-sm font-semibold text-slate-800 mb-1">
            Arrastra tus imágenes aquí
          </h4>
          <p className="text-xs text-slate-500 mb-4">
            o haz clic para explorar en tu equipo
          </p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            Seleccionar imágenes
          </Button>
        </div>
      )}

      {/* Preset selector shortcut */}
      {!value && (
        <div className="pt-1">
          <p className="text-[11px] font-medium text-slate-400 mb-1.5 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            O elige una imagen predeterminada de infraestructura Cloud:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {SAMPLE_PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => {
                  onChange(preset.url, {
                    name: `${preset.name.toLowerCase().replace(/\s+/g, '_')}.jpg`,
                    size: 2150000,
                    type: 'image/jpeg',
                  });
                  setFileName(`${preset.name}.jpg`);
                  setFileSizeStr('2.1 MB');
                }}
                className="text-[11px] font-medium bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 px-2 py-1 rounded border border-slate-200 transition-colors cursor-pointer"
              >
                + {preset.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Hidden native input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/jpg, image/webp"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileProcess(e.target.files[0]);
          }
        }}
      />

      {error ? (
        <p className="text-xs text-rose-600 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-slate-400">{helperText}</p>
      ) : null}
    </div>
  );
};
