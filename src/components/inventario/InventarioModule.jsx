import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const InventarioModule = () => {
  const [ingredientes, setIngredientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [onlyLowStock, setOnlyLowStock] = useState(false);
  const [onlyExpiring, setOnlyExpiring] = useState(false);

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create'); // 'create' | 'edit' | 'merma' | 'ajuste' | 'history'
  const [selectedItem, setSelectedItem] = useState(null);
  const [movimientos, setMovimientos] = useState([]);
  const [loadingMovs, setLoadingMovs] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    categoria: 'Harinas y Azúcares',
    descripcion: '',
    unidad_base: 'kg',
    stock_actual: 0,
    stock_minimo: 5,
    costo_unitario: 0,
    fecha_caducidad: '',
    activo: true,
    imagen: '',
  });

  const [mermaData, setMermaData] = useState({
    cantidad: '',
    unidad: 'kg',
    motivo: 'Caducidad / Desperdicio en producción',
  });

  const [ajusteData, setAjusteData] = useState({
    nueva_existencia: '',
    motivo: 'Inventario físico mensual autorizado',
  });

  const [errorMsg, setErrorMsg] = useState('');

  // Fetch ingredients
  const fetchIngredientes = async () => {
    try {
      setLoading(true);
      const res = await api.get('/ingredientes', {
        params: {
          buscar: search,
          categoria: category,
          solo_bajas: onlyLowStock ? '1' : '0',
          solo_caducar: onlyExpiring ? '1' : '0',
        },
      });
      if (res.data.success) {
        setIngredientes(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIngredientes();
  }, [search, category, onlyLowStock, onlyExpiring]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setFormData({
      codigo: '',
      nombre: '',
      categoria: 'Harinas y Azúcares',
      descripcion: '',
      unidad_base: 'kg',
      stock_actual: 0,
      stock_minimo: 5,
      costo_unitario: 0,
      fecha_caducidad: '',
      activo: true,
      imagen: '',
    });
    setErrorMsg('');
    setModalType('create');
    setShowModal(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (item) => {
    setSelectedItem(item);
    setFormData({
      codigo: item.codigo || '',
      nombre: item.nombre,
      categoria: item.categoria,
      descripcion: item.descripcion || '',
      unidad_base: item.unidad_base,
      stock_actual: item.stock_actual,
      stock_minimo: item.stock_minimo,
      costo_unitario: item.costo_unitario,
      fecha_caducidad: item.fecha_caducidad ? item.fecha_caducidad.split('T')[0] : '',
      activo: item.activo,
      imagen: item.imagen || '',
    });
    setErrorMsg('');
    setModalType('edit');
    setShowModal(true);
  };

  // Open Merma Modal
  const handleOpenMerma = (item) => {
    setSelectedItem(item);
    setMermaData({
      cantidad: '',
      unidad: item.unidad_base,
      motivo: 'Caducidad o merma reportada en cocina',
    });
    setErrorMsg('');
    setModalType('merma');
    setShowModal(true);
  };

  // Open Ajuste Modal
  const handleOpenAjuste = (item) => {
    setSelectedItem(item);
    setAjusteData({
      nueva_existencia: item.stock_actual,
      motivo: 'Ajuste de inventario físico autorizado',
    });
    setErrorMsg('');
    setModalType('ajuste');
    setShowModal(true);
  };

  // Open History Drawer
  const handleOpenHistory = async (item = null) => {
    setSelectedItem(item);
    setModalType('history');
    setShowModal(true);
    setLoadingMovs(true);
    try {
      const res = await api.get('/movimientos', {
        params: item ? { ingrediente_id: item.id } : {},
      });
      if (res.data.success) {
        setMovimientos(res.data.data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMovs(false);
    }
  };

  // Submit create / edit
  const handleSubmitIngredient = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.nombre.trim() || !formData.unidad_base) {
      setErrorMsg('Nombre y unidad base son obligatorios.');
      return;
    }

    try {
      if (modalType === 'create') {
        const res = await api.post('/ingredientes', formData);
        if (res.data.success) {
          setShowModal(false);
          fetchIngredientes();
        }
      } else if (modalType === 'edit') {
        const res = await api.put(`/ingredientes/${selectedItem.id}`, formData);
        if (res.data.success) {
          setShowModal(false);
          fetchIngredientes();
        }
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error al guardar ingrediente.');
    }
  };

  // Submit Merma
  const handleSubmitMerma = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!mermaData.cantidad || parseFloat(mermaData.cantidad) <= 0) {
      setErrorMsg('Indique una cantidad válida mayor a cero.');
      return;
    }

    try {
      const res = await api.post(`/ingredientes/${selectedItem.id}/merma`, mermaData);
      if (res.data.success) {
        setShowModal(false);
        fetchIngredientes();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error al registrar merma.');
    }
  };

  // Submit Ajuste
  const handleSubmitAjuste = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (ajusteData.nueva_existencia === '' || parseFloat(ajusteData.nueva_existencia) < 0) {
      setErrorMsg('Indique una existencia válida (no se admiten existencias negativas).');
      return;
    }

    try {
      const res = await api.post(`/ingredientes/${selectedItem.id}/ajuste`, ajusteData);
      if (res.data.success) {
        setShowModal(false);
        fetchIngredientes();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error al aplicar ajuste.');
    }
  };

  // Deactivate or Delete
  const handleDelete = async (id) => {
    if (!window.confirm('¿Desea desactivar/archivar este ingrediente? El historial de movimientos se conservará intacto.')) return;
    try {
      const res = await api.delete(`/ingredientes/${id}`);
      if (res.data.success) {
        fetchIngredientes();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Helpers
  const isStockLow = (item) => item.stock_actual <= item.stock_minimo;
  const isExpiring = (item) => {
    if (!item.fecha_caducidad) return false;
    const diff = (new Date(item.fecha_caducidad) - new Date()) / (1000 * 60 * 60 * 24);
    return diff <= 7 && diff >= 0;
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="font-label-sm uppercase tracking-wider text-secondary font-bold">
            Módulo 8 • Almacén Central & Mise en Place
          </span>
          <h1 className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight mt-0.5">
            Inventario de Insumos y Materiales
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleOpenHistory(null)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container text-primary hover:bg-surface-container-high font-label-md font-semibold shadow-sm transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">history</span>
            <span>Historial Global</span>
          </button>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-[#853406] text-on-primary font-label-md font-semibold shadow-sm transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">add_circle</span>
            <span>Registrar Insumo</span>
          </button>
        </div>
      </div>

      {/* Search and Category Filters */}
      <div className="bg-surface-container-lowest p-4 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col gap-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[20px]">
              search
            </span>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, código..."
              className="w-full h-11 pl-11 pr-4 bg-surface rounded-xl border border-outline-variant/50 text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => {
                setOnlyLowStock(!onlyLowStock);
                setOnlyExpiring(false);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                onlyLowStock
                  ? 'bg-error text-white shadow-sm'
                  : 'bg-error-container/50 text-error hover:bg-error-container'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">warning</span>
              <span>Stock Bajo</span>
            </button>

            <button
              onClick={() => {
                setOnlyExpiring(!onlyExpiring);
                setOnlyLowStock(false);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                onlyExpiring
                  ? 'bg-secondary text-white shadow-sm'
                  : 'bg-secondary-container text-on-secondary-container hover:bg-secondary-container/80'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">event_busy</span>
              <span>Por Vencer</span>
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'Harinas y Azúcares', label: 'Harinas y Azúcares' },
            { id: 'Lácteos y Huevos', label: 'Lácteos y Huevos' },
            { id: 'Chocolates', label: 'Chocolates' },
            { id: 'Empaques y Bases', label: 'Empaques y Bases' },
            { id: 'Frutas y Esencias', label: 'Frutas y Esencias' },
            { id: 'Decoración', label: 'Decoración' },
            { id: 'Varios', label: 'Varios' },
          ].map((cat) => {
            const isCatActive = cat.id === 'all'
              ? (category === 'all' && !onlyLowStock && !onlyExpiring)
              : (category === cat.id && !onlyLowStock && !onlyExpiring);

            return (
              <button
                key={cat.id}
                onClick={() => {
                  setCategory(cat.id);
                  setOnlyLowStock(false);
                  setOnlyExpiring(false);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  isCatActive
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Ingredients Grid Cards */}
      {loading ? (
        <div className="text-center py-16 text-secondary flex flex-col items-center gap-2">
          <span className="material-symbols-outlined animate-spin text-[36px] text-primary">progress_activity</span>
          <span>Cargando catálogo de insumos...</span>
        </div>
      ) : ingredientes.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-2xl p-12 text-center text-secondary border border-outline-variant/30">
          <span className="material-symbols-outlined text-[54px] text-outline mb-2">inventory_2</span>
          <h3 className="font-title-lg font-bold text-on-surface">No hay ingredientes registrados</h3>
          <p className="text-sm mt-1">Agrega los insumos utilizados en las recetas y costeos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {ingredientes.map((item) => {
            const low = isStockLow(item);
            const expiring = isExpiring(item);

            return (
              <div
                key={item.id}
                className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/30 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4"
              >
                <div>
                  {/* Top Bar with Badge */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-label-sm uppercase tracking-wider text-secondary font-bold">
                      {item.categoria}
                    </span>
                    {low ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-error-container text-error text-[11px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-error animate-pulse"></span> Stock Crítico
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> Stock Óptimo
                      </span>
                    )}
                  </div>

                  <h3 className="font-title-lg text-title-lg text-on-surface font-bold leading-snug">
                    {item.nombre}
                  </h3>
                  {item.codigo && (
                    <span className="text-xs font-mono text-secondary">{item.codigo}</span>
                  )}
                  {item.descripcion && (
                    <p className="text-xs text-secondary mt-1 line-clamp-1">{item.descripcion}</p>
                  )}
                </div>

                {/* Stock Level Display */}
                <div className="bg-surface-container-low p-3.5 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-secondary font-bold uppercase">Existencia Actual</span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className={`text-2xl font-bold ${low ? 'text-error' : 'text-on-surface'}`}>
                        {item.stock_actual}
                      </span>
                      <span className="text-xs font-bold text-secondary uppercase">{item.unidad_base}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-secondary font-bold uppercase">Costo Unitario Ref.</span>
                    <div className="text-base font-bold text-primary mt-0.5 font-mono">
                      ${item.costo_unitario?.toFixed(2)} / {item.unidad_base}
                    </div>
                    <span className="text-[11px] text-outline">Mínimo: {item.stock_minimo} {item.unidad_base}</span>
                  </div>
                </div>

                {/* Warning details (expiring or low) */}
                {expiring && (
                  <div className="p-2 bg-secondary-container/40 rounded-lg text-xs text-secondary flex items-center gap-1.5 font-medium">
                    <span className="material-symbols-outlined text-[16px] text-secondary">schedule</span>
                    <span>Vence pronto: {item.fecha_caducidad?.split('T')[0]}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenMerma(item)}
                      title="Registrar Merma"
                      className="px-2.5 py-1 text-xs font-semibold bg-error-container/60 hover:bg-error-container text-error rounded-lg transition-colors"
                    >
                      Merma
                    </button>
                    <button
                      onClick={() => handleOpenHistory(item)}
                      title="Ver Movimientos"
                      className="p-1.5 text-secondary hover:text-primary hover:bg-surface-container rounded-lg"
                    >
                      <span className="material-symbols-outlined text-[18px]">history</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      title="Editar"
                      className="p-1.5 text-secondary hover:text-primary hover:bg-surface-container rounded-lg"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODALS */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/40 w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 sm:p-8">
            <div className="flex items-center justify-between pb-4 border-b border-surface-variant mb-6">
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                {modalType === 'create' && 'Registrar Nuevo Insumo'}
                {modalType === 'edit' && `Editar Insumo: ${formData.nombre}`}
                {modalType === 'merma' && `Registrar Merma: ${selectedItem?.nombre}`}
                {modalType === 'ajuste' && `Ajuste Físico: ${selectedItem?.nombre}`}
                {modalType === 'history' && (selectedItem ? `Movimientos: ${selectedItem.nombre}` : 'Historial Global de Movimientos')}
              </h2>
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

            {/* MERMA MODAL FORM */}
            {modalType === 'merma' && (
              <form onSubmit={handleSubmitMerma} className="flex flex-col gap-4 text-on-surface">
                <div className="p-3 bg-surface-container-low rounded-xl text-sm">
                  <span>Existencia actual: </span>
                  <strong className="text-primary">{selectedItem?.stock_actual} {selectedItem?.unidad_base}</strong>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-secondary mb-1">Cantidad de Merma *</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={mermaData.cantidad}
                      onChange={(e) => setMermaData({ ...mermaData, cantidad: e.target.value })}
                      placeholder="0.00"
                      className="w-full h-11 px-3 bg-surface rounded-xl border border-outline-variant/60 font-body-md focus:outline-none focus:ring-2 focus:ring-primary shadow-sm font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-secondary mb-1">Unidad</label>
                    <select
                      value={mermaData.unidad}
                      onChange={(e) => setMermaData({ ...mermaData, unidad: e.target.value })}
                      className="w-full h-11 px-3 bg-surface rounded-xl border border-outline-variant/60 font-body-md font-semibold"
                    >
                      {selectedItem?.unidad_base === 'kg' && (
                        <>
                          <option value="kg">Kilogramos (kg)</option>
                          <option value="g">Gramos (g)</option>
                        </>
                      )}
                      {selectedItem?.unidad_base === 'g' && (
                        <>
                          <option value="g">Gramos (g)</option>
                          <option value="kg">Kilogramos (kg)</option>
                        </>
                      )}
                      {selectedItem?.unidad_base === 'L' && (
                        <>
                          <option value="L">Litros (L)</option>
                          <option value="ml">Mililitros (ml)</option>
                        </>
                      )}
                      {selectedItem?.unidad_base === 'ml' && (
                        <>
                          <option value="ml">Mililitros (ml)</option>
                          <option value="L">Litros (L)</option>
                        </>
                      )}
                      {selectedItem?.unidad_base === 'pza' && (
                        <option value="pza">Piezas (pza)</option>
                      )}
                      {selectedItem?.unidad_base === 'paquete' && (
                        <option value="paquete">Paquete</option>
                      )}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-secondary mb-1">Motivo de la Merma *</label>
                  <textarea
                    rows="2"
                    required
                    value={mermaData.motivo}
                    onChange={(e) => setMermaData({ ...mermaData, motivo: e.target.value })}
                    placeholder="Ej. Caducidad vencida, quemado de prueba, empaque roto..."
                    className="w-full p-3 bg-surface rounded-xl border border-outline-variant/60 font-body-md focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                  ></textarea>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-surface-variant">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 rounded-xl border border-outline-variant text-secondary font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-error hover:bg-[#93000a] text-white font-semibold shadow-sm"
                  >
                    Confirmar y Descontar Merma
                  </button>
                </div>
              </form>
            )}

            {/* AJUSTE MODAL FORM */}
            {modalType === 'ajuste' && (
              <form onSubmit={handleSubmitAjuste} className="flex flex-col gap-4 text-on-surface">
                <div className="p-3 bg-surface-container-low rounded-xl text-sm">
                  <span>Existencia actual en sistema: </span>
                  <strong className="text-primary">{selectedItem?.stock_actual} {selectedItem?.unidad_base}</strong>
                </div>

                <div>
                  <label className="block text-xs font-bold text-secondary mb-1">
                    Nueva Existencia Real ({selectedItem?.unidad_base}) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    min="0"
                    value={ajusteData.nueva_existencia}
                    onChange={(e) => setAjusteData({ ...ajusteData, nueva_existencia: e.target.value })}
                    className="w-full h-11 px-3 bg-surface rounded-xl border border-outline-variant/60 font-body-md focus:outline-none focus:ring-2 focus:ring-primary shadow-sm font-bold text-lg"
                  />
                  <p className="text-[11px] text-secondary mt-1">
                    No se admiten existencias negativas. El sistema registrará un movimiento de ajuste con la diferencia.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-secondary mb-1">Motivo o Autorización *</label>
                  <textarea
                    rows="2"
                    required
                    value={ajusteData.motivo}
                    onChange={(e) => setAjusteData({ ...ajusteData, motivo: e.target.value })}
                    placeholder="Ej. Conteo físico de almacén semanal autorizado..."
                    className="w-full p-3 bg-surface rounded-xl border border-outline-variant/60 font-body-md focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                  ></textarea>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-surface-variant">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 rounded-xl border border-outline-variant text-secondary font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-primary hover:bg-[#853406] text-white font-semibold shadow-sm"
                  >
                    Aplicar Ajuste
                  </button>
                </div>
              </form>
            )}

            {/* CREATE / EDIT INGREDIENT FORM */}
            {(modalType === 'create' || modalType === 'edit') && (
              <form onSubmit={handleSubmitIngredient} className="flex flex-col gap-4 text-on-surface">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-secondary mb-1">Código o Lote</label>
                    <input
                      type="text"
                      value={formData.codigo}
                      onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                      placeholder="#HR-01"
                      className="w-full h-11 px-3.5 bg-surface rounded-xl border border-outline-variant/60 font-body-md focus:ring-2 focus:ring-primary shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-secondary mb-1">Categoría</label>
                    <select
                      value={formData.categoria}
                      onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                      className="w-full h-11 px-3 bg-surface rounded-xl border border-outline-variant/60 font-body-md font-semibold"
                    >
                      <option value="Harinas y Azúcares">Harinas y Azúcares</option>
                      <option value="Lácteos y Huevos">Lácteos y Huevos</option>
                      <option value="Chocolates">Chocolates</option>
                      <option value="Empaques y Bases">Empaques y Bases</option>
                      <option value="Frutas y Esencias">Frutas y Esencias</option>
                      <option value="Decoración">Decoración</option>
                      <option value="Varios">Varios</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-secondary mb-1">Nombre del Ingrediente *</label>
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Ej. Harina de Trigo Selecta W280"
                    className="w-full h-11 px-3.5 bg-surface rounded-xl border border-outline-variant/60 font-body-md focus:ring-2 focus:ring-primary shadow-sm font-semibold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-secondary mb-1">Unidad Base *</label>
                    <select
                      value={formData.unidad_base}
                      onChange={(e) => setFormData({ ...formData, unidad_base: e.target.value })}
                      className="w-full h-11 px-3 bg-surface rounded-xl border border-outline-variant/60 font-body-md font-semibold"
                    >
                      <option value="kg">kg (Kilogramos)</option>
                      <option value="g">g (Gramos)</option>
                      <option value="L">L (Litros)</option>
                      <option value="ml">ml (Mililitros)</option>
                      <option value="pza">pza (Pieza)</option>
                      <option value="paquete">paquete</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-secondary mb-1">Stock Inicial</label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      disabled={modalType === 'edit'}
                      value={formData.stock_actual}
                      onChange={(e) => setFormData({ ...formData, stock_actual: e.target.value })}
                      className="w-full h-11 px-3 bg-surface rounded-xl border border-outline-variant/60 font-body-md focus:ring-2 focus:ring-primary shadow-sm font-mono disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-secondary mb-1">Stock Mínimo</label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={formData.stock_minimo}
                      onChange={(e) => setFormData({ ...formData, stock_minimo: e.target.value })}
                      className="w-full h-11 px-3 bg-surface rounded-xl border border-outline-variant/60 font-body-md focus:ring-2 focus:ring-primary shadow-sm font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-secondary mb-1">Costo Unitario Ref. ($)</label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={formData.costo_unitario}
                      onChange={(e) => setFormData({ ...formData, costo_unitario: e.target.value })}
                      placeholder="0.00"
                      className="w-full h-11 px-3.5 bg-surface rounded-xl border border-outline-variant/60 font-body-md focus:ring-2 focus:ring-primary shadow-sm font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-secondary mb-1">Fecha de Caducidad</label>
                    <input
                      type="date"
                      value={formData.fecha_caducidad}
                      onChange={(e) => setFormData({ ...formData, fecha_caducidad: e.target.value })}
                      className="w-full h-11 px-3 bg-surface rounded-xl border border-outline-variant/60 font-body-md focus:ring-2 focus:ring-primary shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-secondary mb-1">Descripción / Ficha Técnica</label>
                  <textarea
                    rows="2"
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    placeholder="Marca, procedencia, porcentaje graso o proteína..."
                    className="w-full p-3 bg-surface rounded-xl border border-outline-variant/60 font-body-md focus:ring-2 focus:ring-primary shadow-sm"
                  ></textarea>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-surface-variant">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 rounded-xl border border-outline-variant text-secondary font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-primary hover:bg-[#853406] text-white font-semibold shadow-sm"
                  >
                    {modalType === 'create' ? 'Guardar en Catálogo' : 'Actualizar Insumo'}
                  </button>
                </div>
              </form>
            )}

            {/* HISTORY OF MOVEMENTS MODAL */}
            {modalType === 'history' && (
              <div className="flex flex-col gap-4">
                {loadingMovs ? (
                  <div className="text-center py-8 text-secondary flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined animate-spin text-[24px]">progress_activity</span>
                    <span>Cargando movimientos...</span>
                  </div>
                ) : movimientos.length === 0 ? (
                  <p className="text-center py-8 text-secondary">No hay movimientos registrados para este criterio.</p>
                ) : (
                  <div className="overflow-x-auto max-h-[60vh] divide-y divide-outline-variant/20">
                    {movimientos.map((mov) => (
                      <div key={mov.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                              mov.tipo_movimiento === 'entrada_compra'
                                ? 'bg-emerald-100 text-emerald-800'
                                : mov.tipo_movimiento === 'salida_costeo'
                                ? 'bg-orange-100 text-orange-800'
                                : mov.tipo_movimiento === 'merma'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-surface-container text-on-surface-variant'
                            }`}>
                              {mov.tipo_movimiento}
                            </span>
                            <span className="font-semibold text-on-surface">{mov.ingrediente?.nombre}</span>
                          </div>
                          <p className="text-secondary mt-1">{mov.motivo || 'Sin motivo especificado'}</p>
                          <span className="text-[10px] text-outline">{new Date(mov.created_at).toLocaleString('es-MX')}</span>
                        </div>

                        <div className="text-right">
                          <span className="font-bold text-sm text-primary font-mono">
                            {mov.tipo_movimiento.includes('salida') || mov.tipo_movimiento === 'merma' || mov.tipo_movimiento === 'ajuste_negativo' ? '-' : '+'}
                            {mov.cantidad} {mov.unidad}
                          </span>
                          <div className="text-[10px] text-secondary mt-0.5">
                            {mov.existencia_anterior} ➔ <strong className="text-on-surface">{mov.existencia_posterior} {mov.unidad}</strong>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InventarioModule;
