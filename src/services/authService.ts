/**
 * Service: Authentication (Mock Provider)
 * Prepared for future drop-in replacement with Firebase Authentication:
 * - signInWithEmailAndPassword(auth, email, password)
 * - signOut(auth)
 * - onAuthStateChanged(auth, callback)
 */

import { User } from '../types';
import { INITIAL_USERS, STORAGE_KEYS } from '../data/mockData';

// Mock password for all demo accounts
export const DEMO_PASSWORD = '123456';

export const authService = {
  /**
   * Simulates authentication sign-in
   */
  async login(email: string, password: string, rememberMe: boolean = false): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 350));

    // Get users from storage or fallback to mock
    const rawUsers = localStorage.getItem(STORAGE_KEYS.USERS);
    const users: User[] = rawUsers ? JSON.parse(rawUsers) : INITIAL_USERS;

    const normalizedEmail = email.trim().toLowerCase();
    const user = users.find((u) => u.email.toLowerCase() === normalizedEmail);

    if (!user) {
      throw new Error('Credenciales incorrectas. El correo ingresado no está registrado.');
    }

    if (password !== DEMO_PASSWORD) {
      throw new Error('Contraseña incorrecta. (Prueba con 123456 para las cuentas de demostración).');
    }

    if (user.status === 'Inactivo') {
      throw new Error('Tu cuenta se encuentra inactiva. Contacta con el administrador del sistema.');
    }

    // Save session
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    if (rememberMe) {
      localStorage.setItem(STORAGE_KEYS.REMEMBER_USER, normalizedEmail);
    } else {
      localStorage.removeItem(STORAGE_KEYS.REMEMBER_USER);
    }

    return user;
  },

  /**
   * Retrieves active authenticated user session
   */
  getCurrentUser(): User | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Invalid JSON
    }
    return null;
  },

  /**
   * Retrieves remembered email if saved
   */
  getRememberedEmail(): string {
    return localStorage.getItem(STORAGE_KEYS.REMEMBER_USER) || '';
  },

  /**
   * Simulates logout
   */
  async logout(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },

  /**
   * Updates profile data for currently logged-in user
   */
  async updateProfile(updates: Partial<User>): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 250));
    const current = this.getCurrentUser();
    if (!current) throw new Error('No hay sesión activa.');

    const updatedUser: User = { ...current, ...updates };

    // Update in users list
    const rawUsers = localStorage.getItem(STORAGE_KEYS.USERS);
    const users: User[] = rawUsers ? JSON.parse(rawUsers) : INITIAL_USERS;
    const index = users.findIndex((u) => u.id === current.id);
    if (index !== -1) {
      users[index] = updatedUser;
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }

    // Update session
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedUser));
    return updatedUser;
  },
};
