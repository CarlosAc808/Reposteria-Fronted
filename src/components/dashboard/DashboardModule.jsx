import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';

const COLORS = ['#9f3e07', '#c05621', '#006867', '#74584c', '#ba1a1a'];

const DashboardModule = ({ onNavigate }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estados para exportar reporte mensual
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [exportData, setExportData] = useState(null);
  const [loadingExport, setLoadingExport] = useState(false);
  const [downloadingCsv, setDownloadingCsv] = useState(false);

  const fetchExportData = async (month) => {
    try {
      setLoadingExport(true);
      const res = await api.get(`/dashboard/export?mes=${month}`);
      if (res.data.success) {
        setExportData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingExport(false);
    }
  };

  useEffect(() => {
    if (showExportModal) {
      fetchExportData(selectedMonth);
    }
  }, [showExportModal, selectedMonth]);

  const handleDownloadCsv = async () => {
    try {
      setDownloadingCsv(true);
      const res = await api.get(`/dashboard/export?mes=${selectedMonth}&format=csv`, {
        responseType: 'blob',
      });
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reporte_atelier_dulce_${selectedMonth}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Error al descargar el archivo CSV.');
    } finally {
      setDownloadingCsv(false);
    }
  };

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/metrics');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar las métricas en tiempo real.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    // Auto-refresh metrics every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-secondary">
        <span className="material-symbols-outlined animate-spin text-[40px] text-primary mb-2">progress_activity</span>
        <p className="font-body-md font-medium">Consultando indicadores en vivo de la pastelería...</p>
      </div>
    );
  }

  const { kpis, graficas, alertas } = data || {
    kpis: {},
    graficas: {},
    alertas: {},
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12">
      {/* Chef Greeting & Quick Operational Bar */}
      <div className="bg-surface-container-low rounded-2xl p-6 shadow-sm border border-outline-variant/30 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1 z-10">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍰</span>
            <h1 className="font-headline-sm text-headline-sm text-on-surface font-bold">
              Panel de Control Operativo
            </h1>
          </div>
          <p className="font-body-md text-secondary">
            Métricas calculadas directamente de la base de datos en tiempo real.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 z-10 flex-wrap">
          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface hover:bg-surface-container-high font-label-md font-semibold shadow-sm transition-all text-xs sm:text-sm"
          >
            <span className="material-symbols-outlined text-[18px] text-primary">download</span>
            <span>Descargar Reporte Mensual</span>
          </button>
          <button
            onClick={() => onNavigate('pedidos')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-[#853406] text-on-primary font-label-md font-semibold shadow-sm transition-all text-xs sm:text-sm"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>Nuevo Pedido</span>
          </button>
          <button
            onClick={() => onNavigate('costeo')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container text-primary hover:bg-surface-container-high font-label-md font-semibold shadow-sm transition-all text-xs sm:text-sm"
          >
            <span className="material-symbols-outlined text-[18px]">calculate</span>
            <span>Calcular Costeo</span>
          </button>
        </div>
      </div>

      {/* Alertas Urgentes Banner */}
      {(alertas?.stock_critico?.length > 0 || alertas?.proximos_caducar?.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {alertas?.stock_critico?.length > 0 && (
            <div className="bg-error-container/40 border border-error/30 rounded-xl p-4 flex items-start gap-3">
              <span className="material-symbols-outlined text-error text-[24px] flex-shrink-0 mt-0.5">warning</span>
              <div>
                <h4 className="font-title-md text-error font-bold">Existencias Bajas / Críticas</h4>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  {alertas.stock_critico.map(i => `${i.nombre} (${i.stock_actual} ${i.unidad_base})`).join(' • ')}
                </p>
              </div>
            </div>
          )}

          {alertas?.proximos_caducar?.length > 0 && (
            <div className="bg-secondary-container/60 border border-secondary/30 rounded-xl p-4 flex items-start gap-3">
              <span className="material-symbols-outlined text-secondary text-[24px] flex-shrink-0 mt-0.5">schedule</span>
              <div>
                <h4 className="font-title-md text-secondary font-bold">Próximos a Vencer (7 días)</h4>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  {alertas.proximos_caducar.map(i => `${i.nombre} (${i.stock_actual} ${i.unidad_base})`).join(' • ')}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 8 Operational KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Pedidos pendientes */}
        <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col justify-between">
          <div className="flex items-center justify-between text-secondary">
            <span className="text-xs font-bold uppercase tracking-wider">Pendientes</span>
            <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[18px]">hourglass_top</span>
            </div>
          </div>
          <div className="my-2">
            <span className="font-display-lg text-display-lg text-on-surface font-bold">
              {kpis.pedidos_pendientes ?? 0}
            </span>
          </div>
          <span className="text-[11px] text-secondary font-medium">Por iniciar en cocina</span>
        </div>

        {/* 2. Programados para hoy */}
        <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col justify-between">
          <div className="flex items-center justify-between text-secondary">
            <span className="text-xs font-bold uppercase tracking-wider">Para Hoy</span>
            <div className="w-8 h-8 rounded-full bg-primary-container/20 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[18px]">calendar_today</span>
            </div>
          </div>
          <div className="my-2">
            <span className="font-display-lg text-display-lg text-primary font-bold">
              {kpis.pedidos_hoy ?? 0}
            </span>
          </div>
          <span className="text-[11px] text-secondary font-medium">Entregas del día</span>
        </div>

        {/* 3. En preparación */}
        <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col justify-between">
          <div className="flex items-center justify-between text-secondary">
            <span className="text-xs font-bold uppercase tracking-wider">En Preparación</span>
            <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[18px]">skillet</span>
            </div>
          </div>
          <div className="my-2">
            <span className="font-display-lg text-display-lg text-on-surface font-bold">
              {kpis.en_preparacion ?? 0}
            </span>
          </div>
          <span className="text-[11px] text-secondary font-medium">En horno y decoración</span>
        </div>

        {/* 4. Entregas completadas */}
        <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col justify-between">
          <div className="flex items-center justify-between text-secondary">
            <span className="text-xs font-bold uppercase tracking-wider">Entregados</span>
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
            </div>
          </div>
          <div className="my-2">
            <span className="font-display-lg text-display-lg text-emerald-700 font-bold">
              {kpis.entregas_completadas ?? 0}
            </span>
          </div>
          <span className="text-[11px] text-emerald-800 font-semibold">Completados con éxito</span>
        </div>

        {/* 5. Ingredientes con existencias bajas */}
        <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col justify-between">
          <div className="flex items-center justify-between text-secondary">
            <span className="text-xs font-bold uppercase tracking-wider">Stock Bajo</span>
            <div className="w-8 h-8 rounded-full bg-error-container flex items-center justify-center text-error">
              <span className="material-symbols-outlined text-[18px]">production_quantity_limits</span>
            </div>
          </div>
          <div className="my-2">
            <span className="font-display-lg text-display-lg text-error font-bold">
              {kpis.existencias_bajas ?? 0}
            </span>
          </div>
          <span className="text-[11px] text-error font-semibold">Requieren surtido</span>
        </div>

        {/* 6. Próximos a caducar */}
        <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col justify-between">
          <div className="flex items-center justify-between text-secondary">
            <span className="text-xs font-bold uppercase tracking-wider">Por Caducar</span>
            <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[18px]">event_busy</span>
            </div>
          </div>
          <div className="my-2">
            <span className="font-display-lg text-display-lg text-secondary font-bold">
              {kpis.proximos_caducar ?? 0}
            </span>
          </div>
          <span className="text-[11px] text-secondary font-medium">En los próximos 7 días</span>
        </div>

        {/* 7. Compras durante el mes */}
        <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col justify-between">
          <div className="flex items-center justify-between text-secondary">
            <span className="text-xs font-bold uppercase tracking-wider">Compras del Mes</span>
            <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[18px]">receipt_long</span>
            </div>
          </div>
          <div className="my-2">
            <span className="font-display-lg text-display-lg text-on-surface font-bold">
              ${(kpis.compras_mes || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <span className="text-[11px] text-secondary font-medium">Inversión en insumos</span>
        </div>

        {/* 8. Costos de producción durante el mes */}
        <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col justify-between">
          <div className="flex items-center justify-between text-secondary">
            <span className="text-xs font-bold uppercase tracking-wider">Costeo del Mes</span>
            <div className="w-8 h-8 rounded-full bg-tertiary/10 flex items-center justify-center text-tertiary">
              <span className="material-symbols-outlined text-[18px]">payments</span>
            </div>
          </div>
          <div className="my-2">
            <span className="font-display-lg text-display-lg text-tertiary font-bold">
              ${(kpis.costeo_mes || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <span className="text-[11px] text-secondary font-medium">Costo insumos consumidos</span>
        </div>
      </div>

      {/* Real-time Interactive Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfica 1: Pedidos por Estado */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col">
          <h3 className="font-title-lg text-title-lg text-on-surface font-bold mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">donut_large</span>
            Pedidos por Estado
          </h3>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={graficas?.pedidos_por_estado || []}
                  dataKey="total"
                  nameKey="estado"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={45}
                  label={(entry) => `${entry.estado}: ${entry.total}`}
                >
                  {(graficas?.pedidos_por_estado || []).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfica 2: Pedidos por Día */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col">
          <h3 className="font-title-lg text-title-lg text-on-surface font-bold mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">bar_chart</span>
            Entregas Programadas por Fecha
          </h3>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={graficas?.pedidos_ultimos_dias || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eed5c8" />
                <XAxis dataKey="fecha" stroke="#57423a" />
                <YAxis allowDecimals={false} stroke="#57423a" />
                <Tooltip />
                <Bar dataKey="total" name="Total Pedidos" fill="#c05621" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfica 3: Ingredientes más consumidos */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col">
          <h3 className="font-title-lg text-title-lg text-on-surface font-bold mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">scale</span>
            Ingredientes Más Consumidos en Costeos
          </h3>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={graficas?.ingredientes_top || []}
                margin={{ left: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#eed5c8" />
                <XAxis type="number" stroke="#57423a" />
                <YAxis dataKey="nombre" type="category" stroke="#57423a" width={110} />
                <Tooltip />
                <Bar dataKey="total_consumido" name="Consumo (unidad base)" fill="#006867" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfica 4: Evolución de Gastos en Compras vs Costeo */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col">
          <h3 className="font-title-lg text-title-lg text-on-surface font-bold mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">trending_up</span>
            Evolución de Compras de Insumos ($)
          </h3>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={graficas?.gastos_compras || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eed5c8" />
                <XAxis dataKey="periodo" stroke="#57423a" />
                <YAxis stroke="#57423a" />
                <Tooltip />
                <Line type="monotone" dataKey="total_gasto" name="Total Compras ($)" stroke="#9f3e07" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Modal para Descargar / Exportar Reporte Mensual */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-surface rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-surface-variant p-6 flex flex-col gap-5">
            {/* Header Modal */}
            <div className="flex items-center justify-between pb-3 border-b border-surface-variant">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[26px]">analytics</span>
                <h3 className="font-headline-sm text-lg font-bold text-on-surface">
                  Descargar Reporte Mensual
                </h3>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-secondary hover:bg-surface-container"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Selector de Mes */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-container-low p-4 rounded-xl border border-outline-variant/30">
              <div>
                <label className="text-xs font-bold text-secondary uppercase tracking-wider block mb-1">
                  Seleccionar Periodo (Mes):
                </label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-outline-variant bg-surface text-on-surface font-semibold text-sm focus:outline-primary"
                />
              </div>
              <span className="text-xs text-secondary max-w-[220px]">
                El reporte compila automáticamente compras, costeos y pedidos del mes seleccionado.
              </span>
            </div>

            {/* Vista Previa de Indicadores */}
            {loadingExport ? (
              <div className="flex flex-col items-center justify-center py-8 text-secondary">
                <span className="material-symbols-outlined animate-spin text-[32px] text-primary mb-2">progress_activity</span>
                <p className="text-xs">Consultando datos del periodo...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-surface-container-lowest p-3.5 rounded-xl border border-outline-variant/30">
                  <span className="text-[11px] font-semibold text-secondary uppercase">Compras del Mes</span>
                  <p className="text-lg font-bold text-primary mt-1">
                    ${Number(exportData?.resumen?.total_compras || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </p>
                  <span className="text-[11px] text-secondary">
                    {exportData?.compras?.length || 0} compras registradas
                  </span>
                </div>

                <div className="bg-surface-container-lowest p-3.5 rounded-xl border border-outline-variant/30">
                  <span className="text-[11px] font-semibold text-secondary uppercase">Costeo / Producción</span>
                  <p className="text-lg font-bold text-secondary mt-1">
                    ${Number(exportData?.resumen?.total_costeos || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </p>
                  <span className="text-[11px] text-secondary">
                    {exportData?.costeos?.length || 0} preparaciones costeadas
                  </span>
                </div>

                <div className="bg-surface-container-lowest p-3.5 rounded-xl border border-outline-variant/30">
                  <span className="text-[11px] font-semibold text-secondary uppercase">Pedidos del Mes</span>
                  <p className="text-lg font-bold text-on-surface mt-1">
                    {exportData?.resumen?.total_pedidos || 0}
                  </p>
                  <span className="text-[11px] text-emerald-700 font-medium">
                    {exportData?.resumen?.pedidos_entregados || 0} entregados • {exportData?.resumen?.pedidos_pendientes || 0} activos
                  </span>
                </div>
              </div>
            )}

            {/* Botones de Descarga */}
            <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-surface-variant">
              <button
                onClick={handleDownloadCsv}
                disabled={downloadingCsv || loadingExport}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold shadow-sm transition-all disabled:opacity-50 text-sm"
              >
                <span className="material-symbols-outlined text-[20px]">table_view</span>
                <span>{downloadingCsv ? 'Descargando...' : 'Descargar en Excel (.CSV)'}</span>
              </button>

              <button
                onClick={() => window.print()}
                disabled={loadingExport}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary hover:bg-[#853406] text-on-primary font-semibold shadow-sm transition-all disabled:opacity-50 text-sm"
              >
                <span className="material-symbols-outlined text-[20px]">print</span>
                <span>Imprimir / Guardar como PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reporte imprimible formal para window.print() (oculto en pantalla normal, visible al imprimir) */}
      <div id="printable-monthly-report" className="hidden">
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #9f3e07', paddingBottom: '12px', marginBottom: '20px' }}>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#9f3e07' }}>Atelier Dulce</h1>
              <p style={{ margin: '4px 0 0', color: '#666', fontSize: '12px' }}>Pastelería Artesanal • Reporte Mensual Operativo</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, fontWeight: 'bold', fontSize: '14px' }}>Periodo: {selectedMonth}</p>
              <p style={{ margin: '2px 0 0', color: '#666', fontSize: '11px' }}>Generado: {new Date().toLocaleDateString('es-MX')}</p>
            </div>
          </div>

          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px' }}>1. Resumen Ejecutivo del Mes</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '25px', fontSize: '13px' }}>
            <tbody>
              <tr style={{ background: '#f8f4f2', borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '8px', fontWeight: 'bold' }}>Total Inversión en Compras:</td>
                <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold', color: '#9f3e07' }}>
                  ${Number(exportData?.resumen?.total_compras || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '8px', fontWeight: 'bold' }}>Total Costos de Producción (Costeos):</td>
                <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>
                  ${Number(exportData?.resumen?.total_costeos || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </td>
              </tr>
              <tr style={{ background: '#f8f4f2', borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '8px', fontWeight: 'bold' }}>Total Pedidos Registrados:</td>
                <td style={{ padding: '8px', textAlign: 'right' }}>{exportData?.resumen?.total_pedidos || 0}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '8px', fontWeight: 'bold' }}>Pedidos Entregados con Éxito:</td>
                <td style={{ padding: '8px', textAlign: 'right' }}>{exportData?.resumen?.pedidos_entregados || 0}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', fontWeight: 'bold' }}>Pedidos Pendientes / En Proceso:</td>
                <td style={{ padding: '8px', textAlign: 'right' }}>{exportData?.resumen?.pedidos_pendientes || 0}</td>
              </tr>
            </tbody>
          </table>

          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px' }}>2. Detalle de Compras ({exportData?.compras?.length || 0})</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '25px', fontSize: '11px' }}>
            <thead>
              <tr style={{ background: '#f1ece8', borderBottom: '2px solid #ccc' }}>
                <th style={{ padding: '6px', textAlign: 'left' }}>Folio</th>
                <th style={{ padding: '6px', textAlign: 'left' }}>Establecimiento / Proveedor</th>
                <th style={{ padding: '6px', textAlign: 'left' }}>Fecha</th>
                <th style={{ padding: '6px', textAlign: 'right' }}>Total ($)</th>
              </tr>
            </thead>
            <tbody>
              {exportData?.compras?.length > 0 ? (
                exportData.compras.map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '6px' }}>{c.folio_ticket}</td>
                    <td style={{ padding: '6px' }}>{c.establecimiento}</td>
                    <td style={{ padding: '6px' }}>{c.fecha_compra ? c.fecha_compra.slice(0, 10) : ''}</td>
                    <td style={{ padding: '6px', textAlign: 'right' }}>${Number(c.importe_total).toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="4" style={{ padding: '8px', textAlign: 'center', color: '#999' }}>Sin compras registradas en este mes</td></tr>
              )}
            </tbody>
          </table>

          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px' }}>3. Detalle de Producción y Costeos ({exportData?.costeos?.length || 0})</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '25px', fontSize: '11px' }}>
            <thead>
              <tr style={{ background: '#f1ece8', borderBottom: '2px solid #ccc' }}>
                <th style={{ padding: '6px', textAlign: 'left' }}>Folio</th>
                <th style={{ padding: '6px', textAlign: 'left' }}>Preparación</th>
                <th style={{ padding: '6px', textAlign: 'center' }}>Porciones</th>
                <th style={{ padding: '6px', textAlign: 'right' }}>Costo Total ($)</th>
                <th style={{ padding: '6px', textAlign: 'right' }}>Costo Unitario ($)</th>
              </tr>
            </thead>
            <tbody>
              {exportData?.costeos?.length > 0 ? (
                exportData.costeos.map(cost => (
                  <tr key={cost.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '6px' }}>{cost.folio}</td>
                    <td style={{ padding: '6px' }}>{cost.nombre_preparacion}</td>
                    <td style={{ padding: '6px', textAlign: 'center' }}>{cost.porciones}</td>
                    <td style={{ padding: '6px', textAlign: 'right' }}>${Number(cost.costo_total).toFixed(2)}</td>
                    <td style={{ padding: '6px', textAlign: 'right' }}>${Number(cost.costo_por_porcion).toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" style={{ padding: '8px', textAlign: 'center', color: '#999' }}>Sin costeos registrados en este mes</td></tr>
              )}
            </tbody>
          </table>

          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px' }}>4. Detalle de Pedidos del Mes ({exportData?.pedidos?.length || 0})</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
            <thead>
              <tr style={{ background: '#f1ece8', borderBottom: '2px solid #ccc' }}>
                <th style={{ padding: '6px', textAlign: 'left' }}>Folio</th>
                <th style={{ padding: '6px', textAlign: 'left' }}>Cliente</th>
                <th style={{ padding: '6px', textAlign: 'left' }}>Fecha Entrega</th>
                <th style={{ padding: '6px', textAlign: 'left' }}>Estado</th>
                <th style={{ padding: '6px', textAlign: 'right' }}>Precio Sugerido ($)</th>
              </tr>
            </thead>
            <tbody>
              {exportData?.pedidos?.length > 0 ? (
                exportData.pedidos.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '6px' }}>{p.folio}</td>
                    <td style={{ padding: '6px' }}>{p.cliente_nombre}</td>
                    <td style={{ padding: '6px' }}>{p.fecha_entrega ? p.fecha_entrega.slice(0, 10) : ''}</td>
                    <td style={{ padding: '6px', textTransform: 'capitalize' }}>{p.estado}</td>
                    <td style={{ padding: '6px', textAlign: 'right' }}>${Number(p.precio_sugerido || 0).toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" style={{ padding: '8px', textAlign: 'center', color: '#999' }}>Sin pedidos registrados en este mes</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardModule;
