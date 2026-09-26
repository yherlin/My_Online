import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { User, UserRole, UserStatus } from '../../types';
import { User as UserIcon, Mail, Building, Check } from 'lucide-react';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<User>) => Promise<void>;
  initialData?: User | null;
  isEditing?: boolean;
}

export const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEditing = false,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('Empleado');
  const [status, setStatus] = useState<UserStatus>('Activo');
  const [department, setDepartment] = useState('Gestión de Inventario');
  const [avatar, setAvatar] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData && isEditing) {
      setName(initialData.name);
      setEmail(initialData.email);
      setRole(initialData.role);
      setStatus(initialData.status);
      setDepartment(initialData.department || 'Operaciones');
      setAvatar(initialData.avatar);
    } else {
      setName('');
      setEmail('');
      setRole('Empleado');
      setStatus('Activo');
      setDepartment('Gestión de Inventario');
      setAvatar('');
    }
    setErrors({});
  }, [initialData, isEditing, isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'El nombre completo es requerido';
    } else if (name.trim().length < 3) {
      newErrors.name = 'El nombre debe tener al menos 3 letras';
    }

    if (!email.trim()) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Ingresa un correo electrónico válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role,
        status,
        department: department.trim(),
        avatar:
          avatar ||
          `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
            name
          )}&backgroundColor=0284c7`,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Modificar Usuario' : 'Registrar Nuevo Usuario'}
      subtitle={
        isEditing
          ? 'Actualiza los datos personales, rol o estado del usuario en el sistema.'
          : 'Crea una nueva cuenta de acceso corporativo a la plataforma Cloud.'
      }
      maxWidth="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            leftIcon={<Check className="w-4 h-4" />}
          >
            {isEditing ? 'Guardar Cambios' : 'Registrar Usuario'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nombre Completo *"
          placeholder="ej. Mariana Silva"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          startIcon={<UserIcon className="w-4 h-4" />}
        />

        <Input
          label="Correo Electrónico Corporativo *"
          type="email"
          placeholder="ej. m.silva@cloudproducts.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          startIcon={<Mail className="w-4 h-4" />}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Rol de Usuario *"
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            options={[
              { value: 'Administrador', label: 'Administrador (Acceso total)' },
              { value: 'Empleado', label: 'Empleado (Operaciones & Catálogo)' },
              { value: 'Usuario', label: 'Usuario (Solo Consulta & Compras)' },
            ]}
          />

          <Select
            label="Estado de la Cuenta *"
            value={status}
            onChange={(e) => setStatus(e.target.value as UserStatus)}
            options={[
              { value: 'Activo', label: 'Activo (Acceso habilitado)' },
              { value: 'Inactivo', label: 'Inactivo (Bloqueado)' },
            ]}
          />
        </div>

        <Input
          label="Departamento u Organización"
          placeholder="ej. Soporte Técnico / Redes"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          startIcon={<Building className="w-4 h-4" />}
        />

        <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-800 leading-relaxed text-left">
          <strong>Nota de Credenciales:</strong> En este entorno frontend mock, la contraseña temporal predeterminada para nuevos usuarios es <code className="bg-blue-100 px-1 py-0.5 rounded font-mono font-bold text-blue-900">123456</code>.
        </div>
      </form>
    </Modal>
  );
};
