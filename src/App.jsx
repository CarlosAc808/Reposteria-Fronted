import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Login from './components/auth/Login';
import Navbar from './components/layout/Navbar';
import DashboardModule from './components/dashboard/DashboardModule';
import PedidosModule from './components/pedidos/PedidosModule';
import RecetarioModule from './components/recetario/RecetarioModule';
import InventarioModule from './components/inventario/InventarioModule';
import CosteoModule from './components/costeo/CosteoModule';
import ComprasModule from './components/compras/ComprasModule';
import UsuariosModule from './components/usuarios/UsuariosModule';

function App() {
  const { isAuthenticated, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center text-secondary">
        <span className="material-symbols-outlined animate-spin text-[48px] text-primary mb-3">cake</span>
        <p className="font-headline-sm text-on-surface font-bold">Atelier Dulce</p>
        <span className="text-xs text-secondary mt-1">Iniciando sistema de pastelería...</span>
      </div>
    );
  }

  // Protección de rutas privadas: Si no está autenticado, solo puede ver el login
  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col text-on-surface selection:bg-secondary-container selection:text-on-secondary-container">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'dashboard' && <DashboardModule onNavigate={setActiveTab} />}
        {activeTab === 'pedidos' && <PedidosModule />}
        {activeTab === 'recetario' && <RecetarioModule />}
        {activeTab === 'inventario' && <InventarioModule />}
        {activeTab === 'costeo' && <CosteoModule />}
        {activeTab === 'compras' && <ComprasModule />}
        {activeTab === 'usuarios' && <UsuariosModule />}
      </main>
    </div>
  );
}

export default App;
