import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

export interface RouteMatch {
  path: string;
  params: Record<string, string>;
}

interface RouterContextType {
  currentPath: string;
  params: Record<string, string>;
  navigate: (to: string) => void;
  isActive: (path: string, exact?: boolean) => boolean;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>(() => {
    const path = window.location.pathname;
    return path === '/' || path === '' ? '/dashboard' : path;
  });

  const [params, setParams] = useState<Record<string, string>>({});

  // Sync route and check route guards
  const updateRoute = useCallback((newPath: string) => {
    // Parameter extraction for /products/:id
    const productDetailMatch = newPath.match(/^\/products\/([^/]+)$/);
    if (productDetailMatch && productDetailMatch[1] !== 'new') {
      setParams({ id: productDetailMatch[1] });
    } else {
      setParams({});
    }

    setCurrentPath(newPath);
    if (window.location.pathname !== newPath) {
      window.history.pushState(null, '', newPath);
    }
  }, []);

  // Listen to popstate (back/forward browser buttons)
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const normalized = path === '/' ? '/dashboard' : path;
      updateRoute(normalized);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [updateRoute]);

  // Route guarding
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      if (currentPath !== '/login') {
        updateRoute('/login');
      }
    } else {
      // User is logged in
      if (currentPath === '/login' || currentPath === '/') {
        updateRoute('/dashboard');
      } else if (currentPath === '/users' && user.role !== 'Administrador') {
        // Only admin can access /users
        updateRoute('/dashboard');
      }
    }
  }, [user, authLoading, currentPath, updateRoute]);

  const navigate = useCallback((to: string) => {
    updateRoute(to);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [updateRoute]);

  const isActive = useCallback(
    (path: string, exact: boolean = false) => {
      if (exact) return currentPath === path;
      if (path === '/dashboard') return currentPath === '/dashboard';
      return currentPath.startsWith(path);
    },
    [currentPath]
  );

  return (
    <RouterContext.Provider value={{ currentPath, params, navigate, isActive }}>
      {children}
    </RouterContext.Provider>
  );
};

export const useRouter = (): RouterContextType => {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter debe utilizarse dentro de un RouterProvider');
  }
  return context;
};
