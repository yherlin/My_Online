/**
 * Service: Products (Mock Firestore Provider)
 * Prepared for future drop-in replacement with Cloud Firestore:
 * - getDocs(collection(db, 'products'))
 * - getDoc(doc(db, 'products', id))
 * - addDoc(collection(db, 'products'), data)
 * - updateDoc(doc(db, 'products', id), data)
 * - deleteDoc(doc(db, 'products', id))
 */

import { Product, DashboardStats } from '../types';
import { INITIAL_PRODUCTS, INITIAL_IMAGES, INITIAL_USERS, STORAGE_KEYS } from '../data/mockData';

function getStoredProducts(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error parsing stored products', e);
  }
  // Initialize with mock
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
  return INITIAL_PRODUCTS;
}

function saveProducts(products: Product[]): void {
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
}

export const productService = {
  /**
   * Fetch all products
   */
  async getProducts(): Promise<Product[]> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return getStoredProducts();
  },

  /**
   * Fetch a single product by ID
   */
  async getProductById(id: string): Promise<Product | null> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const products = getStoredProducts();
    const product = products.find((p) => p.id === id);
    return product || null;
  },

  /**
   * Create a new product
   */
  async createProduct(
    data: Omit<Product, 'id' | 'createdAt' | 'sku'> & { sku?: string }
  ): Promise<Product> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const products = getStoredProducts();

    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      sku: data.sku || `CP-${data.category.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      name: data.name.trim(),
      description: data.description.trim(),
      category: data.category,
      price: Number(data.price),
      stock: Number(data.stock),
      status: Number(data.stock) === 0 ? 'Agotado' : data.status,
      imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString().split('T')[0],
      createdBy: data.createdBy || 'Sistema Cloud',
      createdById: data.createdById,
      tags: data.tags || ['Cloud', data.category],
    };

    const updated = [newProduct, ...products];
    saveProducts(updated);
    return newProduct;
  },

  /**
   * Update an existing product
   */
  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    await new Promise((resolve) => setTimeout(resolve, 250));
    const products = getStoredProducts();
    const index = products.findIndex((p) => p.id === id);

    if (index === -1) {
      throw new Error(`Producto con ID ${id} no encontrado.`);
    }

    const current = products[index];
    const newStock = updates.stock !== undefined ? Number(updates.stock) : current.stock;
    
    // Auto status adjust if stock hits 0
    let resolvedStatus = updates.status || current.status;
    if (newStock === 0) {
      resolvedStatus = 'Agotado';
    } else if (resolvedStatus === 'Agotado' && newStock > 0) {
      resolvedStatus = 'Activo';
    }

    const updatedProduct: Product = {
      ...current,
      ...updates,
      price: updates.price !== undefined ? Number(updates.price) : current.price,
      stock: newStock,
      status: resolvedStatus,
      updatedAt: new Date().toISOString().split('T')[0],
    };

    products[index] = updatedProduct;
    saveProducts(products);
    return updatedProduct;
  },

  /**
   * Delete a product
   */
  async deleteProduct(id: string): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const products = getStoredProducts();
    const filtered = products.filter((p) => p.id !== id);
    if (filtered.length === products.length) {
      return false;
    }
    saveProducts(filtered);
    return true;
  },

  /**
   * Simulate a purchase / sale (decrements stock)
   */
  async purchaseProduct(id: string, quantity: number = 1): Promise<Product> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const products = getStoredProducts();
    const index = products.findIndex((p) => p.id === id);

    if (index === -1) {
      throw new Error('Producto no encontrado');
    }

    const prod = products[index];
    if (prod.stock < quantity) {
      throw new Error(`Stock insuficiente. Solo quedan ${prod.stock} unidades disponibles.`);
    }

    const newStock = prod.stock - quantity;
    const updatedProd: Product = {
      ...prod,
      stock: newStock,
      status: newStock === 0 ? 'Agotado' : prod.status,
    };

    products[index] = updatedProd;
    saveProducts(products);
    return updatedProd;
  },

  /**
   * Compute aggregated dashboard metrics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    const products = getStoredProducts();
    const rawImages = localStorage.getItem(STORAGE_KEYS.IMAGES);
    const imagesCount = rawImages ? JSON.parse(rawImages).length : INITIAL_IMAGES.length;
    const rawUsers = localStorage.getItem(STORAGE_KEYS.USERS);
    const usersCount = rawUsers ? JSON.parse(rawUsers).length : INITIAL_USERS.length;

    const totalProducts = products.length;
    const activeProducts = products.filter((p) => p.status === 'Activo').length;
    const outOfStockProducts = products.filter((p) => p.stock === 0 || p.status === 'Agotado').length;
    
    // Consider recent if registered in the current or previous month
    const recentlyAddedProducts = products.filter((p) => p.createdAt >= '2026-09-01').length;
    
    const totalStockValue = products.reduce((acc, p) => acc + (p.price * p.stock), 0);

    return {
      totalProducts,
      activeProducts,
      recentlyAddedProducts,
      totalImages: imagesCount,
      totalUsers: usersCount,
      outOfStockProducts,
      totalStockValue,
    };
  },

  /**
   * Restore default mock data
   */
  resetData(): void {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    localStorage.setItem(STORAGE_KEYS.IMAGES, JSON.stringify(INITIAL_IMAGES));
  },
};
