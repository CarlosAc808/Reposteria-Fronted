import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@atelier.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const result = await login(email, password);
    if (!result.success) {
      setError(result.message);
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-secondary-container/40 rounded-full blur-3xl -z-10 transform translate-x-1/3 -translate-y-1/3"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-container/20 rounded-full blur-3xl -z-10 transform -translate-x-1/3 translate-y-1/3"></div>

      <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-outline-variant/40 p-8 sm:p-10">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-surface-container rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm text-primary">
            <span className="material-symbols-outlined text-[36px]">cake</span>
          </div>
          <h1 className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight">
            Atelier Dulce
          </h1>
          <p className="font-body-md text-secondary mt-1">
            Sistema Integral de Gestión Pastelera
          </p>
        </div>

        {/* Error message alert */}
        {error && (
          <div className="mb-6 p-3.5 bg-error-container text-on-error-container rounded-xl flex items-center gap-2.5 text-sm animate-shake">
            <span className="material-symbols-outlined text-[20px] text-error flex-shrink-0">error</span>
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Login form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block font-label-md text-secondary mb-1.5 font-semibold" htmlFor="email">
              Correo Electrónico
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3.5 text-secondary text-[20px]">mail</span>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="chef@atelier.com"
                className="w-full h-12 pl-11 pr-4 bg-surface rounded-xl border border-outline-variant/60 text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary shadow-sm transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block font-label-md text-secondary mb-1.5 font-semibold" htmlFor="password">
              Contraseña
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3.5 text-secondary text-[20px]">lock</span>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-12 pl-11 pr-4 bg-surface rounded-xl border border-outline-variant/60 text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary shadow-sm transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full h-12 mt-2 bg-primary hover:bg-[#853406] active:scale-[0.99] text-on-primary font-label-lg rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all font-semibold disabled:opacity-50"
          >
            {submitting ? (
              <>
                <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                <span>Iniciando sesión...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[20px]">login</span>
                <span>Ingresar al Sistema</span>
              </>
            )}
          </button>
        </form>

        {/* Demo credentials hint */}
        <div className="mt-8 pt-6 border-t border-surface-variant flex flex-col gap-2 text-center">
          <span className="font-label-sm uppercase tracking-wider text-secondary font-bold">Credenciales de Acceso:</span>
          <div className="p-2.5 bg-surface-container-low rounded-lg text-xs font-mono text-on-surface-variant flex flex-col gap-1">
            <div><strong>Admin:</strong> admin@atelier.com / admin123</div>
            <div><strong>Pastelero:</strong> mateo@atelier.com / pastelero123</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
