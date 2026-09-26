import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from '../context/RouterContext';
import { useToast } from '../context/ToastContext';
import { userService } from '../services/userService';
import { User, UserRole, UserStatus } from '../types';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { UserFormModal } from '../components/users/UserFormModal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { EmptyState } from '../components/common/EmptyState';
import {
  Users,
  Plus,
  Search,
  Shield,
  ShieldAlert,
  Edit2,
  Trash2,
  Mail,
  Building,
  UserCheck,
  UserX,
  Lock,
} from 'lucide-react';

export const UsersPage: React.FC = () => {
  const { user: currentUser, isAdmin } = useAuth();
  const { navigate } = useRouter();
  const toast = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // Modal
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchUsers = async () => {
    try {
      const data = await userService.getUsers();
      setUsers(data);
    } catch {
      toast.error('Error al cargar la lista de usuarios.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Access check: Only Administrador can access users module
  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white rounded-2xl border border-rose-200 text-center shadow-sm space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">
          Acceso Restringido: Módulo de Usuarios
        </h3>
        <p className="text-sm text-slate-500 leading-relaxed">
          Tu rol actual (<strong>{currentUser?.role}</strong>) no cuenta con privilegios administrativos para consultar ni modificar cuentas de usuarios o roles de la plataforma.
        </p>
        <div className="pt-2">
          <Button variant="primary" onClick={() => navigate('/dashboard')}>
            Regresar al Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const handleOpenCreate = () => {
    setEditingUser(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (formData: Partial<User>) => {
    try {
      if (editingUser) {
        const updated = await userService.updateUser(editingUser.id, formData);
        setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
        toast.success(`Usuario "${updated.name}" actualizado correctamente.`);
      } else {
        const created = await userService.createUser(formData as any);
        setUsers((prev) => [created, ...prev]);
        toast.success(`Usuario "${created.name}" registrado en la plataforma Cloud.`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al procesar el usuario.';
      toast.error(msg);
      throw err;
    }
  };

  const handleToggleStatus = async (targetUser: User) => {
    if (targetUser.id === currentUser?.id) {
      toast.warning('No puedes desactivar tu propia cuenta activa.');
      return;
    }

    const nextStatus: UserStatus = targetUser.status === 'Activo' ? 'Inactivo' : 'Activo';
    try {
      const updated = await userService.updateUser(targetUser.id, { status: nextStatus });
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      toast.info(`Estado de "${updated.name}" cambiado a ${nextStatus}.`);
    } catch {
      toast.error('No se pudo cambiar el estado del usuario.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.id === currentUser?.id) {
      toast.warning('No puedes eliminar tu propia cuenta en sesión.');
      return;
    }

    setIsDeleting(true);
    try {
      const ok = await userService.deleteUser(deleteTarget.id);
      if (ok) {
        setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
        toast.success(`Usuario "${deleteTarget.name}" eliminado del sistema.`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al eliminar usuario.';
      toast.error(msg);
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  const roleColors: Record<UserRole, 'purple' | 'info' | 'neutral'> = {
    Administrador: 'purple',
    Empleado: 'info',
    Usuario: 'neutral',
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.department && u.department.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Gestión de Usuarios y Roles
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Administra credenciales de acceso, asigna permisos jerárquicos y supervisa el estado de las cuentas.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleOpenCreate}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          + Nuevo usuario
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl bg-white p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por nombre, correo o departamento..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-400 font-medium">Rol:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="all">Todos los roles</option>
            <option value="Administrador">Administrador</option>
            <option value="Empleado">Empleado</option>
            <option value="Usuario">Usuario</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="rounded-2xl bg-white p-12 border border-slate-200 text-center">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-500">Cargando directorio de usuarios...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <EmptyState
          title="No se encontraron usuarios"
          description="Ajusta el filtro o busca con otro término."
          actionText="+ Crear usuario"
          onAction={handleOpenCreate}
        />
      ) : (
        <div className="rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-6">Usuario & Correo</th>
                  <th className="py-3.5 px-4">Rol del Sistema</th>
                  <th className="py-3.5 px-4">Estado</th>
                  <th className="py-3.5 px-4">Departamento</th>
                  <th className="py-3.5 px-4">Fecha de Registro</th>
                  <th className="py-3.5 px-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((item) => {
                  const isCurrent = item.id === currentUser?.id;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Name & Avatar */}
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.avatar}
                            alt={item.name}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/20 shrink-0 bg-slate-100"
                          />
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 truncate flex items-center gap-1.5">
                              {item.name}
                              {isCurrent && (
                                <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded font-bold">
                                  Tú
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-slate-400 font-mono flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {item.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-4">
                        <Badge variant={roleColors[item.role]} size="sm" dot>
                          {item.role}
                        </Badge>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={item.status === 'Activo' ? 'success' : 'neutral'}
                          size="sm"
                        >
                          {item.status}
                        </Badge>
                      </td>

                      {/* Department */}
                      <td className="py-3.5 px-4 text-xs text-slate-600 font-medium">
                        {item.department || 'Operaciones'}
                      </td>

                      {/* Created Date */}
                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        {item.createdAt}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Toggle Active Status */}
                          <button
                            onClick={() => handleToggleStatus(item)}
                            disabled={isCurrent}
                            title={item.status === 'Activo' ? 'Desactivar acceso' : 'Habilitar acceso'}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              item.status === 'Activo'
                                ? 'text-amber-600 hover:bg-amber-50'
                                : 'text-emerald-600 hover:bg-emerald-50'
                            } disabled:opacity-40 disabled:cursor-not-allowed`}
                          >
                            {item.status === 'Activo' ? (
                              <UserX className="w-4 h-4" />
                            ) : (
                              <UserCheck className="w-4 h-4" />
                            )}
                          </button>

                          {/* Edit User */}
                          <button
                            onClick={() => handleOpenEdit(item)}
                            title="Editar usuario"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete User */}
                          <button
                            onClick={() => setDeleteTarget(item)}
                            disabled={isCurrent || item.id === 'usr-1'}
                            title={
                              isCurrent
                                ? 'No puedes eliminar tu cuenta'
                                : item.id === 'usr-1'
                                ? 'Administrador principal protegido'
                                : 'Eliminar usuario'
                            }
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Create / Edit User */}
      <UserFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingUser}
        isEditing={!!editingUser}
      />

      {/* Delete User Confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="¿Eliminar usuario del sistema?"
        message={`¿Estás seguro de que deseas revocar el acceso y eliminar permanentemente la cuenta de "${deleteTarget?.name}" (${deleteTarget?.email})?`}
        confirmText="Sí, eliminar cuenta"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};
