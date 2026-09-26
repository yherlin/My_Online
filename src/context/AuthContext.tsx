import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<User>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<User>;
  switchUserForDemo: (role: UserRole) => Promise<void>;
  // Role helpers
  isAdmin: boolean;
  isEmpleado: boolean;
  isUsuario: boolean;
  canManageUsers: boolean;
  canDeleteProducts: boolean;
  canCreateProducts: boolean;
  canEditProducts: boolean;
  canManageImages: boolean;
  canSellProducts: boolean;
  canBuyProducts: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check local storage session on mount
    const current = authService.getCurrentUser();
    if (current) {
      setUser(current);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    setLoading(true);
    try {
      const authenticatedUser = await authService.login(email, password, rememberMe);
      setUser(authenticatedUser);
      return authenticatedUser;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    const updated = await authService.updateProfile(data);
    setUser(updated);
    return updated;
  };

  /**
   * Helper for evaluator/demo quick switching
   */
  const switchUserForDemo = async (role: UserRole) => {
    let email = 'admin@cloudproducts.com';
    if (role === 'Empleado') email = 'empleado@cloudproducts.com';
    if (role === 'Usuario') email = 'usuario@gmail.com';
    await login(email, '123456', true);
  };

  const isAdmin = user?.role === 'Administrador';
  const isEmpleado = user?.role === 'Empleado';
  const isUsuario = user?.role === 'Usuario';

  // Specific visual permissions as specified in prompt
  const canManageUsers = isAdmin;
  const canDeleteProducts = isAdmin;
  const canCreateProducts = isAdmin || isEmpleado;
  const canEditProducts = isAdmin || isEmpleado;
  const canManageImages = isAdmin || isEmpleado; // Admin full, Empleado upload/view
  const canSellProducts = isEmpleado;
  const canBuyProducts = isUsuario || isEmpleado;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        updateProfile,
        switchUserForDemo,
        isAdmin,
        isEmpleado,
        isUsuario,
        canManageUsers,
        canDeleteProducts,
        canCreateProducts,
        canEditProducts,
        canManageImages,
        canSellProducts,
        canBuyProducts,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};
