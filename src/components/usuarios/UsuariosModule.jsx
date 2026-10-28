import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const UsuariosModule = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    rol: 'pastelero',
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users');
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenCreate = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      rol: 'pastelero',
    });
    setErrorMsg('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSaving(true);

    try {
      const res = await api.post('/users', formData);
      if (res.data.success) {
        setShowModal(false);
        fetchUsers();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error al registrar usuario.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Desea eliminar este usuario del sistema?')) return;
    try {
      const res = await api.delete(`/users/${id}`);
      if (res.data.success) {
        fetchUsers();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error al eliminar usuario.');
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="font-label-sm uppercase tracking-wider text-secondary font-bold">
            Módulo 4 • Seguridad & Accesos
          </span>
          <h1 className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight mt-0.5">
            Administración de Usuarios y Personal
          </h1>
          <p className="text-xs text-secondary mt-1">
            Gestión de credenciales de acceso para chefs, pasteleros y administradores.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary hover:bg-[#853406] active:scale-95 text-on-primary font-label-md font-semibold shadow-sm transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">person_add</span>
          <span>Registrar Nuevo Usuario</span>
        </button>
      </div>

      {/* Users List */}
      {loading ? (
        <div className="text-center py-16 text-secondary flex flex-col items-center gap-2">
          <span className="material-symbols-outlined animate-spin text-[36px] text-primary">progress_activity</span>
          <span>Cargando usuarios...</span>
        </div>
      ) : (
        <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-surface-container-low text-secondary text-xs uppercase tracking-wider font-semibold border-b border-outline-variant/30">
                  <th className="py-3 px-4">Usuario</th>
                  <th className="py-3 px-4">Correo Electrónico</th>
                  <th className="py-3 px-4">Rol en el Atelier</th>
                  <th className="py-3 px-4">Fecha de Alta</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 text-on-surface font-body-md">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="py-4 px-4 font-bold text-on-surface flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-xs shadow-sm">
                        {u.name?.charAt(0)}
                      </div>
                      <span>{u.name}</span>
                    </td>
                    <td className="py-4 px-4 font-mono text-secondary text-xs">
                      {u.email}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                        u.rol === 'admin'
                          ? 'bg-primary-container/20 text-primary border border-primary/30'
                          : 'bg-surface-container text-secondary'
                      }`}>
                        {u.rol}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-xs text-secondary">
                      {new Date(u.created_at).toLocaleDateString('es-MX')}
                    </td>
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleDelete(u.id)}
                        title="Eliminar Usuario"
                        className="p-1.5 text-secondary hover:text-error hover:bg-error-container/40 rounded-lg transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE USER MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/40 w-full max-w-md p-6 sm:p-8">
            <div className="flex items-center justify-between pb-3 border-b border-surface-variant mb-4">
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Registrar Personal</h3>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full text-secondary hover:text-on-surface hover:bg-surface-container flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 bg-error-container text-on-error-container rounded-xl text-sm font-medium flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-on-surface">
              <div>
                <label className="block text-xs font-bold text-secondary mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej. Mateo Ramos"
                  className="w-full h-11 px-3.5 bg-surface rounded-xl border border-outline-variant/60 text-sm focus:ring-2 focus:ring-primary shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-secondary mb-1">Correo Electrónico *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="mateo@atelier.com"
                  className="w-full h-11 px-3.5 bg-surface rounded-xl border border-outline-variant/60 text-sm focus:ring-2 focus:ring-primary shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-secondary mb-1">Contraseña de Acceso *</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full h-11 px-3.5 bg-surface rounded-xl border border-outline-variant/60 text-sm focus:ring-2 focus:ring-primary shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-secondary mb-1">Rol / Permisos</label>
                <select
                  value={formData.rol}
                  onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                  className="w-full h-11 px-3 bg-surface rounded-xl border border-outline-variant/60 text-sm font-semibold"
                >
                  <option value="admin">Administrador General</option>
                  <option value="pastelero">Chef / Pastelero</option>
                  <option value="asistente">Ayudante de Cocina</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-surface-variant">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-outline-variant text-secondary text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-primary hover:bg-[#853406] text-white text-xs font-semibold shadow-sm flex items-center gap-2"
                >
                  {saving && <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>}
                  <span>Guardar Usuario</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsuariosModule;
