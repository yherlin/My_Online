export type UserRole = 'Administrador' | 'Empleado' | 'Usuario';
export type UserStatus = 'Activo' | 'Inactivo';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatar: string;
  createdAt: string;
  lastLogin?: string;
  department?: string;
}

export type ProductCategory = 
  | 'Servidores Cloud'
  | 'Almacenamiento'
  | 'Redes & Conectividad'
  | 'Seguridad & Firewalls'
  | 'Software SaaS'
  | 'Dispositivos IoT';

export type ProductStatus = 'Activo' | 'Inactivo' | 'Agotado';

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: ProductCategory;
  price: number;
  stock: number;
  status: ProductStatus;
  imageUrl: string;
  createdAt: string;
  createdBy: string;
  createdById?: string;
  updatedAt?: string;
  tags?: string[];
}

export interface CloudImage {
  id: string;
  name: string;
  url: string;
  size: string; // e.g., "1.4 MB"
  dimensions?: string; // e.g., "1920x1080"
  type: string; // e.g., "image/jpeg"
  uploadedAt: string;
  uploadedBy: string;
  productId?: string;
  productName?: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
  duration?: number;
}

export interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  recentlyAddedProducts: number;
  totalImages: number;
  totalUsers: number;
  outOfStockProducts: number;
  totalStockValue: number;
}
