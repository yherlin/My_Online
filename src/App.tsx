/**
 * Cloud Products - Enterprise SaaS Frontend
 */

import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { RouterProvider, useRouter } from './context/RouterContext';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { ImagesPage } from './pages/ImagesPage';
import { UsersPage } from './pages/UsersPage';
import { SettingsPage } from './pages/SettingsPage';
import { ToastContainer } from './components/common/ToastContainer';
import { ProductFormModal } from './components/products/ProductFormModal';
import { productService } from './services/productService';
import { useToast } from './context/ToastContext';

const AppContent: React.FC = () => {
  const { currentPath, params, navigate } = useRouter();
  const { user, loading } = useAuth();
  const toast = useToast();

  // Route: /products/new handler
  const isNewProductRoute = currentPath === '/products/new';

  const handleCreateFromNewRoute = async (formData: any) => {
    try {
      const created = await productService.createProduct(formData);
      toast.success(`Producto "${created.name}" registrado con éxito.`);
      navigate(`/products/${created.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al crear producto';
      toast.error(msg);
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-base font-bold text-slate-200">Iniciando Cloud Products...</h2>
        <p className="text-xs text-slate-400 mt-1">Cargando entorno de ejecución frontend</p>
      </div>
    );
  }

  // If user is not authenticated or on login path
  if (!user || currentPath === '/login') {
    return (
      <>
        <ToastContainer />
        <LoginPage />
      </>
    );
  }

  // Render view inside AppLayout
  return (
    <AppLayout>
      {/* Route matching */}
      {(() => {
        if (currentPath === '/dashboard') {
          return <DashboardPage />;
        }

        if (currentPath === '/products' || isNewProductRoute) {
          return (
            <>
              <ProductsPage />
              {isNewProductRoute && (
                <ProductFormModal
                  isOpen={true}
                  onClose={() => navigate('/products')}
                  onSubmit={handleCreateFromNewRoute}
                />
              )}
            </>
          );
        }

        if (params.id && currentPath.startsWith('/products/')) {
          return <ProductDetailPage />;
        }

        if (currentPath === '/images') {
          return <ImagesPage />;
        }

        if (currentPath === '/users') {
          return <UsersPage />;
        }

        if (currentPath === '/settings') {
          return <SettingsPage />;
        }

        // Default fallback to dashboard
        return <DashboardPage />;
      })()}
    </AppLayout>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <RouterProvider>
          <AppContent />
        </RouterProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
