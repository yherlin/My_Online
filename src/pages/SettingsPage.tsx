import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { productService } from '../services/productService';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Badge } from '../components/common/Badge';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import {
  User,
  Settings,
  Bell,
  Sun,
  Moon,
  Layers,
  Shield,
  RotateCcw,
  CheckCircle2,
  Database,
  Cloud,
  Save,
  Key,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const toast = useToast();

  // Profile Form state
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [department, setDepartment] = useState(user?.department || 'Operaciones Cloud');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Preferences
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [notifStockAlerts, setNotifStockAlerts] = useState(true);
  const [notifNewProducts, setNotifNewProducts] = useState(true);
  const [notifSecurityLogins, setNotifSecurityLogins] = useState(false);

  // Reset confirmation
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.warning('El nombre no puede estar vacío.');
      return;
    }

    setIsSavingProfile(true);
    try {
      await updateProfile({
        name: name.trim(),
        avatar: avatar.trim(),
        department: department.trim(),
      });
      toast.success('Perfil actualizado correctamente.');
    } catch {
      toast.error('Error al actualizar el perfil.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleResetData = () => {
    productService.resetData();
    setIsResetConfirmOpen(false);
    toast.success('Se han restablecido los datos mock al estado inicial.');
    setTimeout(() => {
      window.location.reload();
    }, 400);
  };

  return (
    <div className="space-y-6 sm:space-y-8 text-left max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Configuración del Sistema
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Administra la información de tu perfil, preferencias visuales y arquitectura de conexión.
        </p>
      </div>

      {/* Profile Section */}
      <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Información del Perfil
            </h3>
            <p className="text-xs text-slate-500">
              Datos personales del usuario autenticado en la sesión actual
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-2">
            <img
              src={avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={name}
              className="w-20 h-20 rounded-2xl object-cover ring-4 ring-blue-500/20"
            />
            <div className="flex-1 w-full space-y-2">
              <Input
                label="URL de Imagen de Avatar"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="https://..."
              />
              <p className="text-[11px] text-slate-400">
                Pega la URL de tu imagen o un avatar generado.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nombre Completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 tracking-wide mb-1.5">
                Correo Electrónico (No editable en demo)
              </label>
              <input
                type="email"
                disabled
                value={email}
                className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3.5 py-2.5 text-sm text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 tracking-wide mb-1.5">
                Rol Asignado
              </label>
              <div className="pt-1">
                <Badge variant={user?.role === 'Administrador' ? 'purple' : 'info'} size="md">
                  {user?.role}
                </Badge>
              </div>
            </div>

            <Input
              label="Departamento / Área"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              isLoading={isSavingProfile}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Guardar Cambios de Perfil
            </Button>
          </div>
        </form>
      </div>

      {/* Preferences Section: Theme & Notifications */}
      <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Preferencias del Sistema
            </h3>
            <p className="text-xs text-slate-500">
              Personaliza el tema visual y la frecuencia de alertas
            </p>
          </div>
        </div>

        {/* Theme Selector */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700 tracking-wide">
            Tema de la Interfaz
          </label>
          <div className="grid grid-cols-2 gap-3 max-w-sm">
            <button
              type="button"
              onClick={() => {
                setTheme('light');
                toast.info('Tema Claro seleccionado.');
              }}
              className={`p-3 rounded-xl border flex items-center gap-3 transition-colors cursor-pointer ${
                theme === 'light'
                  ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-bold'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Sun className="w-4 h-4 text-amber-500" />
              <span className="text-xs">Tema Claro (Activo)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setTheme('dark');
                toast.info('Modo Oscuro registrado en preferencias.');
              }}
              className={`p-3 rounded-xl border flex items-center gap-3 transition-colors cursor-pointer ${
                theme === 'dark'
                  ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-bold'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Moon className="w-4 h-4 text-indigo-500" />
              <span className="text-xs">Tema Oscuro</span>
            </button>
          </div>
        </div>

        {/* Notifications Toggles */}
        <div className="space-y-3 pt-2">
          <label className="block text-xs font-semibold text-slate-700 tracking-wide flex items-center gap-1.5">
            <Bell className="w-4 h-4 text-slate-500" />
            Configuración de Notificaciones
          </label>

          <div className="space-y-2.5">
            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 cursor-pointer">
              <div>
                <p className="text-xs font-bold text-slate-800">
                  Alertas de inventario crítico y stock agotado
                </p>
                <p className="text-[11px] text-slate-500">
                  Recibe avisos inmediatos cuando un producto alcance 0 unidades.
                </p>
              </div>
              <input
                type="checkbox"
                checked={notifStockAlerts}
                onChange={(e) => setNotifStockAlerts(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 cursor-pointer">
              <div>
                <p className="text-xs font-bold text-slate-800">
                  Notificaciones de nuevos productos agregados
                </p>
                <p className="text-[11px] text-slate-500">
                  Notificar en campana cuando otro miembro catalogue un servidor o equipo.
                </p>
              </div>
              <input
                type="checkbox"
                checked={notifNewProducts}
                onChange={(e) => setNotifNewProducts(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 cursor-pointer">
              <div>
                <p className="text-xs font-bold text-slate-800">
                  Alertas de seguridad y nuevos inicios de sesión
                </p>
                <p className="text-[11px] text-slate-500">
                  Monitoreo de accesos de cuentas y cambios de privilegios.
                </p>
              </div>
              <input
                type="checkbox"
                checked={notifSecurityLogins}
                onChange={(e) => setNotifSecurityLogins(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Architecture Readiness Box */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 p-6 text-white border border-slate-800 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                Arquitectura Preparada para Firebase
              </h4>
              <p className="text-xs text-slate-400">
                Capa de servicios desacoplada para migración inmediata
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Frontend Desacoplado 100%
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Toda la persistencia de este sistema está orquestada a través de interfaces TypeScript en el directorio <code className="bg-slate-800 px-1.5 py-0.5 rounded text-blue-300 font-mono">/src/services/</code>. Para activar Firebase en el futuro, solo se requiere sustituir los métodos de:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
            <span className="font-bold text-blue-400 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5" />
              authService.ts
            </span>
            <p className="text-[11px] text-slate-400">
              → Sustituir por Firebase Auth (signInWithEmailAndPassword).
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
            <span className="font-bold text-emerald-400 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5" />
              productService.ts
            </span>
            <p className="text-[11px] text-slate-400">
              → Sustituir por Cloud Firestore (collection 'products').
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
            <span className="font-bold text-amber-400 flex items-center gap-1.5">
              <Cloud className="w-3.5 h-3.5" />
              imageService.ts
            </span>
            <p className="text-[11px] text-slate-400">
              → Sustituir por Firebase Storage (uploadBytes & getDownloadURL).
            </p>
          </div>
        </div>
      </div>

      {/* Reset Factory Mock Data Button */}
      <div className="p-5 rounded-2xl bg-slate-100 border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-slate-800">
            Restablecer Datos de Demostración
          </h4>
          <p className="text-xs text-slate-500">
            Restaura los 11 productos originales, las 8 imágenes y los 5 usuarios de prueba.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => setIsResetConfirmOpen(true)}
          leftIcon={<RotateCcw className="w-4 h-4 text-slate-600" />}
        >
          Restablecer a valores iniciales
        </Button>
      </div>

      {/* Confirm Reset Dialog */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleResetData}
        title="¿Restablecer datos de demostración?"
        message="Esta acción reemplazará los productos, imágenes y usuarios creados en esta sesión por los datos originales de prueba."
        confirmText="Sí, restablecer todo"
        variant="warning"
      />
    </div>
  );
};
