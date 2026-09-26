/**
 * Service: Users (Mock Firestore Provider for Users Collection)
 * Prepared for future drop-in replacement with Cloud Firestore:
 * - collection(db, 'users')
 * - setDoc / updateDoc / deleteDoc
 */

import { User } from '../types';
import { INITIAL_USERS, STORAGE_KEYS } from '../data/mockData';

function getStoredUsers(): User[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error reading users from storage', e);
  }
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
  return INITIAL_USERS;
}

function saveUsers(users: User[]): void {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

export const userService = {
  /**
   * Fetch all users
   */
  async getUsers(): Promise<User[]> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return getStoredUsers();
  },

  /**
   * Get single user by ID
   */
  async getUserById(id: string): Promise<User | null> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const users = getStoredUsers();
    return users.find((u) => u.id === id) || null;
  },

  /**
   * Create a new user
   */
  async createUser(data: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const users = getStoredUsers();

    // Check duplicate email
    if (users.some((u) => u.email.toLowerCase() === data.email.trim().toLowerCase())) {
      throw new Error('Ya existe un usuario con este correo electrónico.');
    }

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      role: data.role,
      status: data.status || 'Activo',
      avatar: data.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.name)}&backgroundColor=0284c7`,
      createdAt: new Date().toISOString().split('T')[0],
      department: data.department || 'Operaciones',
      lastLogin: 'Pendiente de inicio',
    };

    const updated = [newUser, ...users];
    saveUsers(updated);
    return newUser;
  },

  /**
   * Update an existing user
   */
  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 250));
    const users = getStoredUsers();
    const index = users.findIndex((u) => u.id === id);

    if (index === -1) {
      throw new Error(`Usuario con ID ${id} no encontrado.`);
    }

    // Check email clash if modified
    if (updates.email) {
      const emailClash = users.some(
        (u) => u.id !== id && u.email.toLowerCase() === updates.email!.trim().toLowerCase()
      );
      if (emailClash) {
        throw new Error('Ese correo electrónico ya está en uso por otro usuario.');
      }
    }

    const updatedUser: User = {
      ...users[index],
      ...updates,
      name: updates.name ? updates.name.trim() : users[index].name,
      email: updates.email ? updates.email.trim().toLowerCase() : users[index].email,
    };

    users[index] = updatedUser;
    saveUsers(users);
    return updatedUser;
  },

  /**
   * Delete user
   */
  async deleteUser(id: string): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const users = getStoredUsers();
    
    // Prevent deletion of primary admin
    if (id === 'usr-1') {
      throw new Error('No es posible eliminar al Administrador Principal del sistema.');
    }

    const filtered = users.filter((u) => u.id !== id);
    if (filtered.length === users.length) return false;

    saveUsers(filtered);
    return true;
  },
};
