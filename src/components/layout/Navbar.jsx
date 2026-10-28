import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'pedidos', label: 'Pedidos y Calendario', icon: 'calendar_month' },
    { id: 'recetario', label: 'Recetario', icon: 'menu_book' },
    { id: 'inventario', label: 'Inventario', icon: 'inventory_2' },
    { id: 'costeo', label: 'Costeo Libre', icon: 'calculate' },
    { id: 'compras', label: 'Compras', icon: 'shopping_bag' },
    { id: 'usuarios', label: 'Usuarios', icon: 'group' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-surface/95 backdrop-blur-md border-b border-surface-variant shadow-sm">
      <div className="w-full px-3 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-sm flex-shrink-0">
              <span className="material-symbols-outlined text-[22px] sm:text-[24px]">cake</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-headline-sm text-sm sm:text-base xl:text-headline-sm text-on-surface font-bold tracking-tight whitespace-nowrap">
                  Atelier Dulce
                </span>
                <span className="hidden xl:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-semibold whitespace-nowrap border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                  En Producción
                </span>
              </div>
              <span className="text-[11px] text-secondary font-medium whitespace-nowrap hidden 2xl:block">
                Hora: <strong className="text-on-surface">{time}</strong>
              </span>
            </div>
          </div>

          {/* Navigation Items (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 py-1 flex-1 min-w-0 justify-start overflow-x-auto no-scrollbar">
            {navItems.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 rounded-xl transition-all whitespace-nowrap text-xs font-semibold flex-shrink-0 ${
                    active
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  <span className="material-symbols-outlined text-[17px]">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User profile & Logout */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center gap-2 pl-1">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-xs sm:text-sm shadow-sm flex-shrink-0">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="hidden xl:flex flex-col text-left">
                <span className="text-xs font-semibold text-on-surface leading-tight truncate max-w-[110px]">
                  {user?.name || 'Usuario'}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-secondary font-medium">
                  {user?.rol || 'Pastelero'}
                </span>
              </div>
            </div>

            <button
              onClick={logout}
              title="Cerrar sesión"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-outline hover:text-error hover:bg-error-container/40 transition-colors flex-shrink-0"
            >
              <span className="material-symbols-outlined text-[19px] sm:text-[20px]">logout</span>
            </button>
          </div>
        </div>

        {/* Mobile / Tablet Horizontal Navigation Tabs */}
        <div className="lg:hidden flex items-center gap-1 overflow-x-auto py-2 no-scrollbar border-t border-surface-variant/50">
          {navItems.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all flex-shrink-0 ${
                  active
                    ? 'bg-primary text-on-primary font-semibold shadow-sm'
                    : 'text-secondary hover:bg-surface-container'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
