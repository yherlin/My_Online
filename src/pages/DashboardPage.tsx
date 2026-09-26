import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from '../context/RouterContext';
import { productService } from '../services/productService';
import { Product, DashboardStats } from '../types';
import { MONTHLY_REGISTRATIONS_DATA, CATEGORIES_LIST } from '../data/mockData';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import {
  Package,
  CheckCircle2,
  Clock,
  Image as ImageIcon,
  TrendingUp,
  Plus,
  UploadCloud,
  ArrowUpRight,
  Shield,
  Tag,
  DollarSign,
  ChevronRight,
  Boxes,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, canCreateProducts, canManageImages } = useAuth();
  const { navigate } = useRouter();

  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    activeProducts: 0,
    recentlyAddedProducts: 0,
    totalImages: 0,
    totalUsers: 0,
    outOfStockProducts: 0,
    totalStockValue: 0,
  });

  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<{ category: string; count: number; percentage: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [dashStats, allProducts] = await Promise.all([
          productService.getDashboardStats(),
          productService.getProducts(),
        ]);

        setStats(dashStats);

        // Get 5 most recent
        const sorted = [...allProducts].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        setRecentProducts(sorted.slice(0, 5));

        // Compute categories
        const catMap: Record<string, number> = {};
        allProducts.forEach((p) => {
          catMap[p.category] = (catMap[p.category] || 0) + 1;
        });

        const catData = CATEGORIES_LIST.map((cat) => {
          const count = catMap[cat] || 0;
          const percentage = allProducts.length > 0 ? Math.round((count / allProducts.length) * 100) : 0;
          return { category: cat, count, percentage };
        }).sort((a, b) => b.count - a.count);

        setCategoryCounts(catData);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="space-y-6 sm:space-y-8 text-left">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 p-6 sm:p-8 text-white shadow-xl shadow-blue-900/10">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-blue-200 mb-3 border border-white/10">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              Sesión activa como: <strong className="text-white">{user?.role}</strong>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Bienvenido, {user?.name}
            </h2>
            <p className="mt-1.5 text-sm text-blue-100/90 leading-relaxed">
              Panel de control de infraestructura y catálogo de productos en la nube. Monitorea métricas en tiempo real, inventarios y almacenamiento de medios.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {canCreateProducts && (
              <Button
                variant="primary"
                onClick={() => navigate('/products/new')}
                className="bg-white text-blue-800 hover:bg-blue-50 shadow-none font-bold"
                leftIcon={<Plus className="w-4 h-4 text-blue-700" />}
              >
                Nuevo producto
              </Button>
            )}
            {canManageImages && (
              <Button
                variant="outline"
                onClick={() => navigate('/images')}
                className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                leftIcon={<UploadCloud className="w-4 h-4" />}
              >
                Subir imágenes
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => navigate('/products')}
              className="bg-white/10 text-white border-white/20 hover:bg-white/20"
              leftIcon={<Boxes className="w-4 h-4" />}
            >
              Ver catálogo
            </Button>
          </div>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Products */}
        <div className="rounded-2xl bg-white p-5 sm:p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total de Productos
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {loading ? '...' : stats.totalProducts}
            </span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +18%
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Valor de inventario: <strong className="text-slate-700">{formatCurrency(stats.totalStockValue)}</strong>
          </p>
        </div>

        {/* Active Products */}
        <div className="rounded-2xl bg-white p-5 sm:p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Productos Activos
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {loading ? '...' : stats.activeProducts}
            </span>
            <span className="text-xs font-medium text-slate-400">
              Disponibles para venta
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {stats.outOfStockProducts > 0 ? (
              <span className="text-amber-600 font-semibold">{stats.outOfStockProducts} agotados actualmente</span>
            ) : (
              <span className="text-emerald-600 font-medium">Stock disponible en todos</span>
            )}
          </p>
        </div>

        {/* Recently Added */}
        <div className="rounded-2xl bg-white p-5 sm:p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Registrados Recientemente
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {loading ? '...' : stats.recentlyAddedProducts}
            </span>
            <span className="text-xs font-medium text-slate-400">Este mes</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Nuevas altas en catálogo
          </p>
        </div>

        {/* Stored Images */}
        <div className="rounded-2xl bg-white p-5 sm:p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Imágenes Almacenadas
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ImageIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {loading ? '...' : stats.totalImages}
            </span>
            <span className="text-xs font-medium text-slate-400">Archivos CDN</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Almacenamiento simulado Cloud
          </p>
        </div>
      </div>

      {/* Visual Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Productos por Categoría */}
        <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Productos por Categoría
              </h3>
              <p className="text-xs text-slate-500">
                Distribución porcentual de los equipos registrados
              </p>
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
              {categoryCounts.length} Categorías
            </span>
          </div>

          <div className="space-y-3.5 pt-2">
            {categoryCounts.map((cat, idx) => {
              const barColors = [
                'bg-blue-600',
                'bg-indigo-600',
                'bg-emerald-600',
                'bg-amber-500',
                'bg-purple-600',
                'bg-sky-500',
              ];
              const color = barColors[idx % barColors.length];

              return (
                <div key={cat.category} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium text-slate-700">
                    <span className="truncate pr-2">{cat.category}</span>
                    <span className="shrink-0 text-slate-500">
                      <strong className="text-slate-800">{cat.count}</strong> ({cat.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${color}`}
                      style={{ width: `${Math.max(cat.percentage, 4)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Productos Registrados durante los Últimos Meses */}
        <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Registros en los Últimos Meses
                </h3>
                <p className="text-xs text-slate-500">
                  Histórico de nuevos productos ingresados al sistema Cloud
                </p>
              </div>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> Tendencia positiva
              </span>
            </div>

            {/* Custom SVG Column Chart */}
            <div className="pt-6 pb-2">
              <div className="h-44 flex items-end justify-between gap-3 sm:gap-4 px-2">
                {MONTHLY_REGISTRATIONS_DATA.map((item, idx) => {
                  const maxCount = 18;
                  const heightPercent = Math.round((item.count / maxCount) * 100);
                  const isCurrent = idx === MONTHLY_REGISTRATIONS_DATA.length - 1;

                  return (
                    <div key={item.month} className="flex-1 flex flex-col items-center gap-2 group">
                      <span className="text-[11px] font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.count}
                      </span>
                      <div className="w-full bg-slate-100 rounded-t-lg h-36 flex items-end overflow-hidden p-1">
                        <div
                          className={`w-full rounded-md transition-all duration-500 ${
                            isCurrent
                              ? 'bg-blue-600 group-hover:bg-blue-700'
                              : 'bg-indigo-300 group-hover:bg-indigo-400'
                          }`}
                          style={{ height: `${heightPercent}%` }}
                        />
                      </div>
                      <span className={`text-xs font-semibold ${isCurrent ? 'text-blue-600' : 'text-slate-500'}`}>
                        {item.month}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Rango: Abril 2026 - Septiembre 2026</span>
            <span className="font-semibold text-slate-700">Total semestral: 53 productos</span>
          </div>
        </div>
      </div>

      {/* Recent Products Section */}
      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Productos Registrados Recientemente
            </h3>
            <p className="text-xs text-slate-500">
              Últimas altas incorporadas a la base de datos de productos
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/products')}
            rightIcon={<ChevronRight className="w-4 h-4" />}
          >
            Ver todos los productos
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-6">Producto</th>
                <th className="py-3.5 px-4">Categoría</th>
                <th className="py-3.5 px-4">Precio</th>
                <th className="py-3.5 px-4">Stock</th>
                <th className="py-3.5 px-4">Estado</th>
                <th className="py-3.5 px-6 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentProducts.map((product) => (
                <tr
                  key={product.id}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  onClick={() => navigate(`/products/${product.id}`)}
                >
                  <td className="py-3.5 px-6">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-11 h-11 rounded-lg object-cover ring-1 ring-slate-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                          {product.name}
                        </p>
                        <p className="text-xs text-slate-400 font-mono">
                          {product.sku}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 text-xs text-slate-700 font-medium">
                      <Tag className="w-3 h-3 text-slate-400" />
                      {product.category}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {formatCurrency(product.price)}
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`text-xs font-bold ${
                        product.stock === 0
                          ? 'text-rose-600'
                          : product.stock < 5
                          ? 'text-amber-600'
                          : 'text-slate-700'
                      }`}
                    >
                      {product.stock} un.
                    </span>
                  </td>

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

                  <td className="py-3.5 px-6 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/products/${product.id}`);
                      }}
                      rightIcon={<ChevronRight className="w-4 h-4" />}
                    >
                      Ver
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
