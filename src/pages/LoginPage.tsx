import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from '../context/RouterContext';
import { useToast } from '../context/ToastContext';
import { authService } from '../services/authService';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import {
  Cloud,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  Server,
  Database,
  Cpu,
  Sparkles,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { navigate } = useRouter();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Forgot password modal
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  useEffect(() => {
    const remembered = authService.getRememberedEmail();
    if (remembered) {
      setEmail(remembered);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim()) {
      setErrorMsg('Por favor ingresa tu correo electrónico.');
      return;
    }
    if (!password) {
      setErrorMsg('Por favor ingresa tu contraseña.');
      return;
    }

    setIsLoading(true);
    try {
      const user = await login(email, password, rememberMe);
      toast.success(`¡Bienvenido de nuevo, ${user.name}!`, 'Sesión iniciada');
      navigate('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error desconocido de autenticación';
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoAccount = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('123456');
    setErrorMsg(null);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSent(true);
  };

  return (
    <div className="min-h-screen w-full flex bg-slate-50">
      {/* LEFT: Login Form Container */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-12 lg:p-16 max-w-xl mx-auto lg:max-w-none">
        {/* Top Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Cloud className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <span className="font-extrabold text-lg text-slate-900 tracking-tight">
              Cloud Products
            </span>
            <span className="block text-[11px] font-medium text-slate-400">
              Plataforma de Gestión Empresarial
            </span>
          </div>
        </div>

        {/* Form Body */}
        <div className="py-8 my-auto w-full max-w-md mx-auto">
          <div className="mb-8 text-left">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Iniciar sesión
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Ingresa tus credenciales para acceder a la administración de productos e infraestructura.
            </p>
          </div>

          {/* Authentication Error Banner */}
          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-800 text-xs flex items-start gap-3 animate-shake text-left">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-rose-900">Error de autenticación</p>
                <p className="mt-0.5 text-rose-700 leading-relaxed">{errorMsg}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Correo electrónico corporativo"
              type="email"
              placeholder="nombre@cloudproducts.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              startIcon={<Mail className="w-4 h-4" />}
              autoComplete="email"
            />

            <Input
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              startIcon={<Lock className="w-4 h-4" />}
              endIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 hover:text-slate-600 cursor-pointer"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              autoComplete="current-password"
            />

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 hover:text-slate-900">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span>Recordarme</span>
              </label>

              <button
                type="button"
                onClick={() => {
                  setForgotSent(false);
                  setForgotEmail(email);
                  setIsForgotOpen(true);
                }}
                className="font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="w-full"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Iniciar sesión
              </Button>
            </div>
          </form>

          {/* One-click Demo Accounts Selector */}
          <div className="mt-8 pt-6 border-t border-slate-200 text-left">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Cuentas de prueba (1 Clic)
              </span>
              <span className="text-[11px] text-slate-400 font-mono">Clave: 123456</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
              <button
                type="button"
                onClick={() => fillDemoAccount('admin@cloudproducts.com')}
                className="p-2.5 rounded-xl border border-slate-200 bg-white hover:border-purple-300 hover:bg-purple-50/50 transition-all text-left cursor-pointer group shadow-2xs"
              >
                <div className="text-[10px] uppercase font-bold text-purple-600 tracking-wider">
                  Administrador
                </div>
                <div className="text-xs font-semibold text-slate-900 group-hover:text-purple-700 truncate mt-0.5">
                  admin@cloud...
                </div>
              </button>

              <button
                type="button"
                onClick={() => fillDemoAccount('empleado@cloudproducts.com')}
                className="p-2.5 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/50 transition-all text-left cursor-pointer group shadow-2xs"
              >
                <div className="text-[10px] uppercase font-bold text-blue-600 tracking-wider">
                  Empleado
                </div>
                <div className="text-xs font-semibold text-slate-900 group-hover:text-blue-700 truncate mt-0.5">
                  empleado@cloud...
                </div>
              </button>

              <button
                type="button"
                onClick={() => fillDemoAccount('usuario@gmail.com')}
                className="p-2.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/50 transition-all text-left cursor-pointer group shadow-2xs"
              >
                <div className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">
                  Usuario
                </div>
                <div className="text-xs font-semibold text-slate-900 group-hover:text-emerald-700 truncate mt-0.5">
                  usuario@gmail...
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center lg:text-left text-xs text-slate-400 pt-6">
          <p>© 2026 Cloud Products Inc. Todos los derechos reservados.</p>
        </div>
      </div>

      {/* RIGHT: Cloud, Products & Tech Showcase Visual Container */}
      <div className="hidden lg:flex w-1/2 relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-950 p-12 flex-col justify-between text-white overflow-hidden">
        {/* Glow ambient background effects */}
        <div className="absolute top-1/4 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top feature badge */}
        <div className="relative z-10 flex items-center justify-between">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-blue-200">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Infraestructura Segura de Alta Disponibilidad
          </span>

          <span className="text-xs font-mono text-slate-400">SLA 99.99%</span>
        </div>

        {/* Center Tech & Cloud Graphics Card */}
        <div className="relative z-10 my-auto py-8">
          <div className="max-w-md space-y-6 text-left">
            <h1 className="text-3xl xl:text-4xl font-extrabold leading-tight tracking-tight text-white">
              Gestión Integral de Productos en la Nube
            </h1>
            <p className="text-sm xl:text-base text-slate-300 leading-relaxed">
              Administra inventario de servidores, matrices de almacenamiento NVMe, redes y dispositivos IoT con control granular de roles y trazabilidad completa.
            </p>

            {/* Interactive Preview SaaS cards */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20 text-blue-300">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Catálogo Cloud</div>
                  <div className="text-[11px] text-slate-400">Servidores & Redes</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Cloud CDN</div>
                  <div className="text-[11px] text-slate-400">Galería de imágenes</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/20 text-purple-300">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Roles y Accesos</div>
                  <div className="text-[11px] text-slate-400">Admin / Empleado</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/20 text-amber-300">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Firebase Ready</div>
                  <div className="text-[11px] text-slate-400">Capa modular</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom banner */}
        <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <span>Enterprise Cloud Architecture</span>
          <span className="flex items-center gap-1 text-emerald-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Nodos Operacionales
          </span>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={isForgotOpen}
        onClose={() => setIsForgotOpen(false)}
        title="Recuperar Contraseña"
        subtitle="Simulación de envío de enlace de restablecimiento seguro."
        maxWidth="md"
      >
        {forgotSent ? (
          <div className="text-center py-4 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Enlace enviado</h4>
            <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
              Hemos enviado las instrucciones para restablecer tu contraseña a{' '}
              <strong className="text-slate-800">{forgotEmail}</strong>. (Simulación frontend).
            </p>
            <p className="text-xs text-blue-600 font-medium">
              Recuerda que para el entorno demo la contraseña es <strong>123456</strong>.
            </p>
            <Button
              variant="primary"
              className="mt-4 w-full"
              onClick={() => setIsForgotOpen(false)}
            >
              Regresar al inicio de sesión
            </Button>
          </div>
        ) : (
          <form onSubmit={handleForgotSubmit} className="space-y-4 py-2">
            <p className="text-xs text-slate-600 text-left">
              Ingresa el correo corporativo vinculado a tu cuenta para recibir el enlace de acceso:
            </p>
            <Input
              label="Correo electrónico"
              type="email"
              placeholder="admin@cloudproducts.com"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              startIcon={<Mail className="w-4 h-4" />}
              required
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsForgotOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" variant="primary">
                Enviar enlace
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
