import React from 'react';
import { useRouter } from '../../context/RouterContext';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Package,
  Image as ImageIcon,
  Users,
  Settings,
  LogOut,
  Cloud,
  ChevronRight,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Badge } from '../common/Badge';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { currentPath, navigate } = useRouter();
  const { user, logout, isAdmin, switchUserForDemo } = useAuth();

  const handleNav = (path: string) => {
    navigate(path);
    onClose();
  };

  // Nav items based on permissions
  const navItems = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      allowed: true,
    },
    {
      label: 'Productos',
      path: '/products',
      icon: <Package className="w-5 h-5" />,
      allowed: true,
    },
    {
      label: 'Imágenes',
      path: '/images',
      icon: <ImageIcon className="w-5 h-5" />,
      allowed: true,
    },
    {
      label: 'Usuarios',
      path: '/users',
      icon: <Users className="w-5 h-5" />,
      allowed: isAdmin, // Only Administrador can see & access
      badge: 'Admin',
    },
    {
      label: 'Configuración',
      path: '/settings',
      icon: <Settings className="w-5 h-5" />,
      allowed: true,
    },
  ];

  const roleColors: Record<string, 'purple' | 'info' | 'neutral'> = {
    Administrador: 'purple',
    Empleado: 'info',
    Usuario: 'neutral',
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 border-r border-slate-800 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-6 h-18 border-b border-slate-800 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <Cloud className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-base text-white tracking-tight flex items-center gap-1.5">
              Cloud Products
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </span>
            <span className="text-[11px] font-medium text-slate-400">
              Enterprise Suite v2.4
            </span>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-6 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Menú Principal
          </div>

          {navItems
            .filter((item) => item.allowed)
            .map((item) => {
              const active = currentPath.startsWith(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => handleNav(item.path)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group cursor-pointer ${
                    active
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25 font-semibold'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`transition-colors ${
                        active ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      {item.badge}
                    </span>
                  )}
                  {active && !item.badge && (
                    <ChevronRight className="w-4 h-4 text-white/70" />
                  )}
                </button>
              );
            })}

          {/* Quick Demo Switcher Widget */}
          <div className="pt-6 px-1">
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-left space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Simulador de Rol
                </span>
                <span className="text-[10px] text-slate-400">Demo</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Cambia de rol para probar los permisos visuales:
              </p>
              <div className="grid grid-cols-3 gap-1 pt-1">
                {(['Administrador', 'Empleado', 'Usuario'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => switchUserForDemo(r)}
                    className={`text-[10px] py-1 px-1.5 rounded font-medium border transition-colors cursor-pointer text-center truncate ${
                      user?.role === r
                        ? 'bg-blue-600 text-white border-blue-500'
                        : 'bg-slate-700/60 text-slate-300 border-slate-600 hover:bg-slate-700 hover:text-white'
                    }`}
                    title={`Cambiar a rol ${r}`}
                  >
                    {r.slice(0, 5)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Cloud Architecture status badge */}
        <div className="px-4 py-3 mx-3 mb-3 rounded-xl bg-slate-800/40 border border-slate-800 text-left space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-400">
            <span className="flex items-center gap-1">
              <Layers className="w-3 h-3 text-emerald-400" />
              Modo Cloud Frontend
            </span>
            <span className="text-emerald-400 font-bold">100% Mock</span>
          </div>
          <div className="w-full bg-slate-700/60 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full w-full rounded-full" />
          </div>
          <span className="text-[10px] text-slate-400 block">
            Listo para conectar Firebase Auth & Firestore
          </span>
        </div>

        {/* User footer & Logout */}
        <div className="p-4 border-t border-slate-800 shrink-0 bg-slate-950/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={user?.name || 'Usuario'}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-blue-500/30 shrink-0"
              />
              <div className="min-w-0 text-left">
                <p className="text-xs font-semibold text-white truncate">
                  {user?.name || 'Usuario'}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Badge variant={roleColors[user?.role || 'Usuario']} size="sm">
                    {user?.role || 'Usuario'}
                  </Badge>
                </div>
              </div>
            </div>

            <button
              onClick={() => logout()}
              title="Cerrar sesión"
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 rounded-lg transition-colors cursor-pointer shrink-0 ml-2"
              aria-label="Cerrar sesión"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
