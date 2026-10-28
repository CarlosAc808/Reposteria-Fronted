import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const CosteoModule = () => {
  const [activeSubTab, setActiveSubTab] = useState('calculadora'); // 'calculadora' | 'historial'
  const [ingredientesCatalogo, setIngredientesCatalogo] = useState([]);
  const [pedidosList, setPedidosList] = useState([]);
  const [prepName, setPrepName] = useState('Pastel de Chocolate Fudge & Avellana (8 porciones)');
  const [porciones, setPorciones] = useState(8);
  const [observaciones, setObservaciones] = useState('');

  // Selected ingredients in the live free costing form
  const [items, setItems] = useState([
    { ingrediente_id: '', cantidad: 500, unidad: 'g' },
  ]);

  // Live calculation results from backend
  const [calculos, setCalculos] = useState({
    items_calculados: [],
    costo_total: 0,
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // History state
  const [historial, setHistorial] = useState([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  const [selectedCosteo, setSelectedCosteo] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Load ingredients catalogue
  const fetchIngredientes = async () => {
    try {
      const res = await api.get('/ingredientes', { params: { activo: 'true' } });
      if (res.data.success) {
        setIngredientesCatalogo(res.data.data);
        // Pre-select first item if list was empty
        if (items.length > 0 && !items[0].ingrediente_id && res.data.data.length > 0) {
          const first = res.data.data[0];
          setItems([{ ingrediente_id: first.id, cantidad: 500, unidad: first.unidad_base === 'kg' ? 'g' : first.unidad_base }]);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Load orders list for linking (excluir entregados y cancelados)
  const fetchPedidos = async () => {
    try {
      const res = await api.get('/pedidos');
      if (res.data.success) {
        const activos = (res.data.data || []).filter(
          (p) => p.estado !== 'entregado' && p.estado !== 'cancelado'
        );
        setPedidosList(activos);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Live simulation API call
  const simularCostos = async (currentItems) => {
    const validItems = currentItems.filter((i) => i.ingrediente_id && i.cantidad > 0);
    if (validItems.length === 0) {
      setCalculos({ items_calculados: [], costo_total: 0 });
      return;
    }

    try {
      const res = await api.post('/costeo/simular', { items: validItems });
      if (res.data.success) {
        setCalculos(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchIngredientes();
    fetchPedidos();
  }, []);

  useEffect(() => {
    simularCostos(items);
  }, [items]);

  // Handle adding ingredient row
  const handleAddIngredient = () => {
    if (ingredientesCatalogo.length === 0) return;
    const defaultIng = ingredientesCatalogo[0];
    const newItems = [
      ...items,
      {
        ingrediente_id: defaultIng.id,
        cantidad: 100,
        unidad: defaultIng.unidad_base === 'kg' ? 'g' : defaultIng.unidad_base,
      },
    ];
    setItems(newItems);
  };

  // Handle removing ingredient row
  const handleRemoveIngredient = (index) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  // Handle modifying ingredient row
  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;

    // When ingredient changes, set default compatible unit
    if (field === 'ingrediente_id') {
      const ing = ingredientesCatalogo.find((i) => i.id === parseInt(value));
      if (ing) {
        newItems[index].unidad = ing.unidad_base === 'kg' ? 'g' : ing.unidad_base;
      }
    }

    setItems(newItems);
  };

  // Get compatible units for selected ingredient
  const getUnitsForIngredient = (ingredienteId) => {
    const ing = ingredientesCatalogo.find((i) => i.id === parseInt(ingredienteId));
    if (!ing) return ['g', 'kg'];
    if (ing.unidad_base === 'kg' || ing.unidad_base === 'g') return ['g', 'kg'];
    if (ing.unidad_base === 'L' || ing.unidad_base === 'ml') return ['ml', 'L'];
    if (ing.unidad_base === 'pza') return ['pza'];
    if (ing.unidad_base === 'paquete') return ['paquete'];
    return [ing.unidad_base];
  };

  // Button: "Guardar y descontar inventario"
  const handleGuardarYDescontar = async () => {
    setMessage({ type: '', text: '' });
    setSaving(true);

    try {
      const res = await api.post('/costeo/guardar-descontar', {
        nombre_preparacion: prepName,
        porciones: parseInt(porciones) || 1,
        observaciones: observaciones,
        items: items,
      });

      if (res.data.success) {
        setMessage({
          type: 'success',
          text: `¡Costeo guardado con éxito! Folio: ${res.data.data.folio}. Se descontaron las existencias del inventario.`,
        });
        // Clear or reset form
        fetchIngredientes();
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Error al procesar el costeo.',
      });
    } finally {
      setSaving(false);
    }
  };

  // Fetch history
  const fetchHistorial = async () => {
    try {
      setLoadingHistorial(true);
      const res = await api.get('/costeo/historial');
      if (res.data.success) {
        setHistorial(res.data.data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistorial(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'historial') {
      fetchHistorial();
    }
  }, [activeSubTab]);

  // Revert costeo
  const handleRevertir = async (id) => {
    if (!window.confirm('¿Está seguro de revertir este costeo? Se regresarán los ingredientes al inventario.')) return;
    try {
      const res = await api.post(`/costeo/${id}/revertir`);
      if (res.data.success) {
        alert(res.data.message);
        fetchHistorial();
        if (showDetailModal) setShowDetailModal(false);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error al revertir.');
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="font-label-sm uppercase tracking-wider text-secondary font-bold">
            Módulo 9 • Taller de Producción Libre
          </span>
          <h1 className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight mt-0.5">
            Costeo Libre de Pasteles
          </h1>
          <p className="text-xs text-secondary mt-1">
            Calcula el costo real de cualquier preparación sin requerir receta previa.
          </p>
        </div>

        {/* Tab Switcher: Calculadora vs Historial */}
        <div className="bg-surface-container p-1 rounded-xl flex items-center gap-1 self-start sm:self-auto">
          <button
            onClick={() => setActiveSubTab('calculadora')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'calculadora'
                ? 'bg-surface-container-lowest text-primary shadow-sm'
                : 'text-secondary hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">calculate</span>
            <span>Calculadora en Vivo</span>
          </button>
          <button
            onClick={() => setActiveSubTab('historial')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'historial'
                ? 'bg-surface-container-lowest text-primary shadow-sm'
                : 'text-secondary hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">history</span>
            <span>Historial de Costeos</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'calculadora' ? (
        /* CALCULADORA LIBRE */
        <div className="flex flex-col gap-6">
          {/* Notification Alert Message */}
          {message.text && (
            <div
              className={`p-4 rounded-xl text-sm font-semibold flex items-center gap-2 ${
                message.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                  : 'bg-error-container text-on-error-container border border-error/30'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">
                {message.type === 'success' ? 'check_circle' : 'error'}
              </span>
              <span>{message.text}</span>
            </div>
          )}

          {/* Preparation Details Input */}
          <div className="bg-surface-container-low rounded-2xl p-5 shadow-sm border border-outline-variant/30 flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex-1 w-full">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-1.5">
                <label className="text-xs font-bold text-secondary flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary text-[16px]">cake</span>
                  <span>Nombre de la preparación (opcional)</span>
                </label>
                {pedidosList.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-secondary font-medium hidden sm:inline">Vincular pedido:</span>
                    <select
                      onChange={(e) => {
                        const pedidoId = e.target.value;
                        if (!pedidoId) return;
                        const p = pedidosList.find((item) => item.id === parseInt(pedidoId));
                        if (p) {
                          const desc = p.descripcion || [p.sabor, p.tamano].filter(Boolean).join(' - ') || 'Pastel';
                          setPrepName(`[${p.folio}] ${p.cliente_nombre} - ${desc}`);
                          if (p.cantidad && p.cantidad > 1) {
                            setPorciones(p.cantidad);
                          }
                        }
                      }}
                      defaultValue=""
                      className="text-xs py-1 px-2.5 rounded-lg border border-primary/40 bg-surface text-primary font-semibold focus:outline-primary cursor-pointer max-w-[280px] truncate shadow-sm hover:border-primary"
                    >
                      <option value="">📋 Seleccionar Folio / Cliente...</option>
                      {pedidosList.map((p) => {
                        const desc = p.descripcion || [p.sabor, p.tamano].filter(Boolean).join(' - ') || 'Pastel';
                        return (
                          <option key={p.id} value={p.id}>
                            {p.folio} • {p.cliente_nombre} ({desc})
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}
              </div>

              <div className="relative">
                <input
                  type="text"
                  list="pedidos-datalist"
                  value={prepName}
                  onChange={(e) => setPrepName(e.target.value)}
                  placeholder="Escribe el nombre libre o busca folio / cliente..."
                  className="w-full h-11 px-3.5 bg-surface rounded-xl border border-outline-variant/60 font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary shadow-sm font-semibold"
                />
                <datalist id="pedidos-datalist">
                  {pedidosList.map((p) => {
                    const desc = p.descripcion || [p.sabor, p.tamano].filter(Boolean).join(' - ') || 'Pastel';
                    return (
                      <option
                        key={p.id}
                        value={`[${p.folio}] ${p.cliente_nombre} - ${desc}`}
                      >
                        {p.folio} - {p.cliente_nombre} ({desc})
                      </option>
                    );
                  })}
                </datalist>
              </div>
            </div>

            <div className="w-full md:w-36">
              <label className="block text-xs font-bold text-secondary mb-1">Porciones / Rinde</label>
              <input
                type="number"
                min="1"
                value={porciones}
                onChange={(e) => setPorciones(e.target.value)}
                className="w-full h-11 px-3.5 bg-surface rounded-xl border border-outline-variant/60 font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary shadow-sm font-bold text-center"
              />
            </div>
          </div>

          {/* Cost Summary Banner (Live Real-Time) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-outline-variant/30 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-surface-container text-primary flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[26px]">inventory_2</span>
              </div>
              <div>
                <span className="text-[11px] text-secondary font-bold uppercase">Ingredientes</span>
                <div className="text-xl font-bold text-on-surface">{items.length} en preparación</div>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-outline-variant/30 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[26px]">payments</span>
              </div>
              <div>
                <span className="text-[11px] text-secondary font-bold uppercase">Costo Total</span>
                <div className="text-2xl font-bold text-primary font-mono">
                  ${(calculos.costo_total || 0).toFixed(2)}
                </div>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-outline-variant/30 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[26px]">pie_chart</span>
              </div>
              <div>
                <span className="text-[11px] text-secondary font-bold uppercase">Costo por Porción</span>
                <div className="text-xl font-bold text-on-surface font-mono">
                  ${porciones > 0 ? (calculos.costo_total / porciones).toFixed(2) : '0.00'}
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Ingredients List */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/30 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-surface-variant">
              <div className="flex items-center gap-2">
                <h3 className="font-title-lg text-title-lg text-on-surface font-bold">
                  Ingredientes Seleccionados del Inventario
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-xs font-bold">
                  {items.length} activos
                </span>
              </div>

              <button
                type="button"
                onClick={handleAddIngredient}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-fixed text-on-primary-fixed font-semibold text-xs hover:bg-primary hover:text-white transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>Añadir Ingrediente</span>
              </button>
            </div>

            {items.map((item, idx) => {
              const matchedIng = ingredientesCatalogo.find((i) => i.id === parseInt(item.ingrediente_id));
              const calcItem = calculos.items_calculados?.find((c) => c.ingrediente_id === parseInt(item.ingrediente_id));
              const hasEnough = calcItem ? calcItem.stock_suficiente : true;

              return (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    !hasEnough
                      ? 'bg-error-container/20 border-error/40'
                      : 'bg-surface-container-low/60 border-outline-variant/30 hover:bg-surface-container-low'
                  }`}
                >
                  {/* Selector & Stock info */}
                  <div className="flex-1">
                    <label className="block text-[11px] font-bold text-secondary uppercase mb-1">
                      Ingrediente del Almacén
                    </label>
                    <select
                      value={item.ingrediente_id}
                      onChange={(e) => handleItemChange(idx, 'ingrediente_id', e.target.value)}
                      className="w-full h-11 px-3 bg-surface rounded-xl border border-outline-variant/60 text-sm font-semibold text-on-surface shadow-sm"
                    >
                      {ingredientesCatalogo.map((ing) => (
                        <option key={ing.id} value={ing.id}>
                          {ing.nombre} (Stock: {ing.stock_actual} {ing.unidad_base} • Ref: ${ing.costo_unitario?.toFixed(2)}/{ing.unidad_base})
                        </option>
                      ))}
                    </select>

                    {matchedIng && (
                      <div className="flex items-center gap-2 mt-1.5 text-xs">
                        <span className="text-secondary font-medium">
                          Stock disponible: <strong className="text-on-surface">{matchedIng.stock_actual} {matchedIng.unidad_base}</strong>
                        </span>
                        {!hasEnough && (
                          <span className="text-error font-bold flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[14px]">warning</span>
                            ¡Stock insuficiente para esta cantidad!
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Quantity & Compatible Unit */}
                  <div className="flex items-center gap-3">
                    <div className="w-28">
                      <label className="block text-[11px] font-bold text-secondary uppercase mb-1">
                        Cantidad
                      </label>
                      <input
                        type="number"
                        step="any"
                        min="0"
                        value={item.cantidad}
                        onChange={(e) => handleItemChange(idx, 'cantidad', e.target.value)}
                        className="w-full h-11 px-3 bg-surface rounded-xl border border-outline-variant/60 font-mono font-bold text-sm shadow-sm"
                      />
                    </div>

                    <div className="w-32">
                      <label className="block text-[11px] font-bold text-secondary uppercase mb-1">
                        Unidad
                      </label>
                      <select
                        value={item.unidad}
                        onChange={(e) => handleItemChange(idx, 'unidad', e.target.value)}
                        className="w-full h-11 px-3 bg-surface rounded-xl border border-outline-variant/60 font-semibold text-sm shadow-sm"
                      >
                        {getUnitsForIngredient(item.ingrediente_id).map((u) => (
                          <option key={u} value={u}>
                            {u}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Cost Subtotal */}
                    <div className="w-28 text-right">
                      <span className="block text-[11px] font-bold text-secondary uppercase mb-1">
                        Costo
                      </span>
                      <div className="h-11 flex items-center justify-end font-mono font-bold text-base text-primary">
                        ${calcItem?.costo_calculado ? calcItem.costo_calculado.toFixed(2) : '0.00'}
                      </div>
                    </div>

                    {/* Delete button */}
                    <div className="pt-5">
                      <button
                        type="button"
                        onClick={() => handleRemoveIngredient(idx)}
                        disabled={items.length <= 1}
                        className="w-10 h-11 rounded-xl text-outline hover:text-error hover:bg-error-container/40 flex items-center justify-center transition-colors disabled:opacity-20"
                      >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="pt-2 flex justify-start">
              <button
                type="button"
                onClick={handleAddIngredient}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-dashed border-outline-variant text-primary hover:bg-surface-container font-semibold text-xs transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                <span>Agregar otro ingrediente al costeo</span>
              </button>
            </div>
          </div>

          {/* Action Footer: Mandatory Rule Button */}
          <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/40 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-start gap-3 text-secondary text-xs max-w-xl">
              <span className="material-symbols-outlined text-primary text-[24px] flex-shrink-0 mt-0.5">verified</span>
              <div>
                <strong className="text-on-surface block text-sm">Garantía de Control de Inventario:</strong>
                Mientras calculas, consultas o editas ingredientes, el inventario permanece inalterado. Solo al pulsar el botón se aplicará el descuento atómico.
              </div>
            </div>

            <button
              type="button"
              disabled={saving || calculos.costo_total <= 0}
              onClick={handleGuardarYDescontar}
              className="w-full md:w-auto px-8 py-4 rounded-xl bg-primary hover:bg-[#853406] active:scale-95 text-on-primary font-bold text-base shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                  <span>Descontando y Guardando...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[22px]">save</span>
                  <span>Guardar y descontar inventario</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* HISTORIAL DE COSTEOS GUARDADOS */
        <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 overflow-hidden">
          <div className="p-5 border-b border-surface-variant flex items-center justify-between">
            <h3 className="font-title-lg font-bold text-on-surface">Historial de Costeos Confirmados</h3>
            <span className="text-xs text-secondary font-medium">Los costos permanecen congelados al momento del registro.</span>
          </div>

          {loadingHistorial ? (
            <div className="text-center py-16 text-secondary flex flex-col items-center gap-2">
              <span className="material-symbols-outlined animate-spin text-[36px] text-primary">progress_activity</span>
              <span>Cargando historial...</span>
            </div>
          ) : historial.length === 0 ? (
            <div className="text-center py-16 text-secondary">
              <p>No hay costeos confirmados registrados todavía.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-surface-container-low text-secondary text-xs uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">Folio</th>
                    <th className="py-3 px-4">Preparación</th>
                    <th className="py-3 px-4">Fecha y Hora</th>
                    <th className="py-3 px-4">Costo Total</th>
                    <th className="py-3 px-4">Porción</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20 text-on-surface font-body-md">
                  {historial.map((costeo) => (
                    <tr key={costeo.id} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="py-4 px-4 font-mono font-bold text-primary">{costeo.folio}</td>
                      <td className="py-4 px-4 font-semibold">{costeo.nombre_preparacion}</td>
                      <td className="py-4 px-4 text-xs text-secondary">
                        {new Date(costeo.created_at).toLocaleString('es-MX')}
                      </td>
                      <td className="py-4 px-4 font-mono font-bold text-primary">
                        ${costeo.costo_total?.toFixed(2)}
                      </td>
                      <td className="py-4 px-4 font-mono text-secondary">
                        ${costeo.costo_por_porcion?.toFixed(2)} ({costeo.porciones} pz)
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                          costeo.estado === 'confirmado'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-error-container text-error'
                        }`}>
                          {costeo.estado}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedCosteo(costeo);
                              setShowDetailModal(true);
                            }}
                            className="text-xs text-primary font-bold hover:underline"
                          >
                            Ver Detalle
                          </button>
                          {costeo.estado === 'confirmado' && (
                            <button
                              onClick={() => handleRevertir(costeo.id)}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-error-container/50 hover:bg-error-container text-error transition-colors"
                            >
                              Revertir
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* HISTORICAL COSTEO DETAIL MODAL */}
      {showDetailModal && selectedCosteo && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/40 w-full max-w-xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between pb-4 border-b border-surface-variant mb-4">
              <div>
                <span className="font-mono text-xs font-bold text-primary">{selectedCosteo.folio}</span>
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                  {selectedCosteo.nombre_preparacion}
                </h3>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="w-8 h-8 rounded-full text-secondary hover:text-on-surface hover:bg-surface-container flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-4 text-on-surface">
              <div className="grid grid-cols-3 gap-3 bg-surface-container-low p-3.5 rounded-xl text-center">
                <div>
                  <span className="text-[11px] text-secondary font-bold uppercase">Costo Total</span>
                  <div className="text-lg font-bold text-primary font-mono">${selectedCosteo.costo_total?.toFixed(2)}</div>
                </div>
                <div>
                  <span className="text-[11px] text-secondary font-bold uppercase">Porciones</span>
                  <div className="text-lg font-bold">{selectedCosteo.porciones}</div>
                </div>
                <div>
                  <span className="text-[11px] text-secondary font-bold uppercase">Por Porción</span>
                  <div className="text-lg font-bold text-secondary font-mono">${selectedCosteo.costo_por_porcion?.toFixed(2)}</div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase text-secondary mb-2">Ingredientes con Precios Snapshot Congelados:</h4>
                <div className="divide-y divide-outline-variant/20 border border-outline-variant/30 rounded-xl overflow-hidden">
                  {selectedCosteo.detalles?.map((det, i) => (
                    <div key={i} className="p-3 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-on-surface">{det.ingrediente?.nombre}</span>
                        <div className="text-secondary mt-0.5 font-mono">
                          {det.cantidad} {det.unidad} (Snapshot Ref: ${det.costo_unitario_snapshot?.toFixed(2)})
                        </div>
                      </div>
                      <span className="font-mono font-bold text-sm text-primary">
                        ${det.costo_subtotal?.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-surface-variant">
                <button
                  type="button"
                  onClick={() => setShowDetailModal(false)}
                  className="px-5 py-2 rounded-xl border border-outline-variant text-secondary text-xs font-semibold"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CosteoModule;
