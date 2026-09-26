import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from '../../context/RouterContext';
import {
  Menu,
  Bell,
  Search,
  CheckCircle2,
  AlertTriangle,
  Server,
  User as UserIcon,
  Settings,
  LogOut,
  ChevronDown,
  ExternalLink,
} from 'lucide-react';
import { Badge } from '../common/Badge';

interface HeaderProps {
  onOpenSidebar: () => void;
}

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'info' | 'warning' | 'success';
  read: boolean;
}

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    title: 'Inventario Crítico',
    description: 'El producto CP-NAS-BACKUP se encuentra agotado (0 unidades en stock).',
    time: 'Hace 10 min',
    type: 'warning',
    read: false,
  },
  {
    id: 'n2',
    title: 'Sincronización Cloud',
    description: 'Catálogo de productos sincronizado con la réplica regional US-East.',
    time: 'Hace 45 min',
    type: 'info',
    read: false,
  },
  {
    id: 'n3',
    title: 'Nueva Imagen Registrada',
    description: 'Valeria Mendoza subió "switch_core_ports_leds.jpg" (1.9 MB).',
    time: 'Hace 2 horas',
    type: 'success',
    read: true,
  },
];

export const Header: React.FC<HeaderProps> = ({ onOpenSidebar }) => {
  const { user, logout, isAdmin } = useAuth();
  const { navigate, currentPath } = useRouter();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const roleColors: Record<string, 'purple' | 'info' | 'neutral'> = {
    Administrador: 'purple',
    Empleado: 'info',
    Usuario: 'neutral',
  };

  // Humanize path breadcrumb
  const getBreadcrumb = () => {
    if (currentPath === '/dashboard') return 'Dashboard General';
    if (currentPath === '/products') return 'Catálogo de Productos';
    if (currentPath === '/products/new') return 'Registrar Nuevo Producto';
    if (currentPath.startsWith('/products/')) return 'Ficha Técnica del Producto';
    if (currentPath === '/images') return 'Almacenamiento de Imágenes';
    if (currentPath === '/users') return 'Gestión de Usuarios y Roles';
    if (currentPath === '/settings') return 'Configuración de la Plataforma';
    return 'Cloud Products';
  };

  return (
    <header className="sticky top-0 z-30 h-18 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between transition-all">
      {/* Left section: Hamburger button + Breadcrumbs */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={onOpenSidebar}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 lg:hidden transition-colors cursor-pointer"
          aria-label="Abrir menú"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="text-left">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500 hidden sm:inline">
              Cloud Products /
            </span>
            <h1 className="text-sm sm:text-base font-bold text-slate-800 tracking-tight">
              {getBreadcrumb()}
            </h1>
          </div>
        </div>
      </div>

      {/* Right section: Search shortcut + Notifications + User Menu */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Quick Search trigger (navigates to products) */}
        <button
          onClick={() => navigate('/products')}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 text-xs transition-colors cursor-pointer"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Buscar productos...</span>
          <kbd className="font-mono text-[10px] bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-400">
            /
          </kbd>
        </button>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Ver notificaciones"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-2xl border border-slate-100 py-3 z-50 animate-fadeIn text-left">
              <div className="flex items-center justify-between px-4 pb-2.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Notificaciones
                  </h4>
                  {unreadCount > 0 && (
                    <span className="bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                      {unreadCount} nuevas
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                  >
                    Marcar leídas
                  </button>
                )}
              </div>

              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {notifications.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3.5 flex items-start gap-3 hover:bg-slate-50 transition-colors ${
                      !item.read ? 'bg-blue-50/30' : ''
                    }`}
                  >
                    <div className="shrink-0 mt-0.5">
                      {item.type === 'warning' ? (
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                      ) : item.type === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Server className="w-4 h-4 text-blue-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 leading-tight">
                        {item.title}
                      </p>
                      <p className="text-xs text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {item.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-[1px] bg-slate-200 hidden sm:block" />

        {/* User profile dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 p-1.5 sm:px-2 sm:py-1 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Abrir menú de usuario"
          >
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={user?.name || 'Usuario'}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover ring-2 ring-blue-500/20"
            />
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-800 leading-tight">
                {user?.name || 'Usuario'}
              </span>
              <span className="text-[11px] text-slate-500 font-medium leading-none mt-0.5">
                {user?.role || 'Usuario'}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white shadow-2xl border border-slate-100 py-2 z-50 animate-fadeIn text-left">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900 leading-tight">
                  {user?.name}
                </p>
                <p className="text-xs text-slate-500 truncate mt-0.5">{user?.email}</p>
                <div className="mt-2 flex items-center gap-1.5">
                  <Badge variant={roleColors[user?.role || 'Usuario']} size="sm" dot>
                    Rol: {user?.role}
                  </Badge>
                </div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    navigate('/settings');
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <UserIcon className="w-4 h-4 text-slate-400" />
                  <span>Mi Perfil</span>
                </button>
                <button
                  onClick={() => {
                    navigate('/settings');
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>Preferencias & Configuración</span>
                </button>
                {isAdmin && (
                  <button
                    onClick={() => {
                      navigate('/users');
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4 text-slate-400" />
                    <span>Administrar Usuarios</span>
                  </button>
                )}
              </div>

              <div className="border-t border-slate-100 pt-1">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Cerrar sesión</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
