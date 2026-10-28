import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const ComprasModule = () => {
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [ingredientesCatalogo, setIngredientesCatalogo] = useState([]);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'detail'
  const [selectedCompra, setSelectedCompra] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    establecimiento: '',
    fecha_compra: new Date().toISOString().split('T')[0],
    folio_ticket: '',
    observaciones: '',
    items: [
      { ingrediente_id: '', cantidad: 10, unidad: 'kg', costo_unitario: 25, subtotal: 250 },
    ],
  });

  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchCompras = async () => {
    try {
      setLoading(true);
      const res = await api.get('/compras', { params: { buscar: search } });
      if (res.data.success) {
        setCompras(res.data.data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchIngredientes = async () => {
    try {
      const res = await api.get('/ingredientes');
      if (res.data.success) {
        setIngredientesCatalogo(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCompras();
    fetchIngredientes();
  }, [search]);

  // Open create modal
  const handleOpenCreate = () => {
    const defaultIng = ingredientesCatalogo[0];
    setFormData({
      establecimiento: '',
      fecha_compra: new Date().toISOString().split('T')[0],
      folio_ticket: '',
      observaciones: '',
      items: [
        {
          ingrediente_id: defaultIng ? defaultIng.id : '',
          cantidad: 10,
          unidad: defaultIng ? defaultIng.unidad_base : 'kg',
          costo_unitario: defaultIng ? defaultIng.costo_unitario : 25,
          subtotal: defaultIng ? defaultIng.costo_unitario * 10 : 250,
        },
      ],
    });
    setFormError('');
    setModalMode('create');
    setShowModal(true);
  };

  // Open detail modal
  const handleOpenDetail = (compra) => {
    setSelectedCompra(compra);
    setModalMode('detail');
    setShowModal(true);
  };

  // Add / remove item row in purchase form
  const addItemRow = () => {
    const defaultIng = ingredientesCatalogo[0];
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          ingrediente_id: defaultIng ? defaultIng.id : '',
          cantidad: 1,
          unidad: defaultIng ? defaultIng.unidad_base : 'kg',
          costo_unitario: defaultIng ? defaultIng.costo_unitario : 0,
          subtotal: defaultIng ? defaultIng.costo_unitario : 0,
        },
      ],
    });
  };

  const removeItemRow = (index) => {
    const updated = [...formData.items];
    updated.splice(index, 1);
    setFormData({ ...formData, items: updated });
  };

  const updateItemField = (index, field, value) => {
    const updated = [...formData.items];
    updated[index][field] = value;

    // Auto-update default unit and cost if ingredient changes
    if (field === 'ingrediente_id') {
      const ing = ingredientesCatalogo.find((i) => i.id === parseInt(value));
      if (ing) {
        updated[index].unidad = ing.unidad_base;
        updated[index].costo_unitario = ing.costo_unitario;
      }
    }

    // Auto-calculate subtotal
    const cant = parseFloat(updated[index].cantidad) || 0;
    const costo = parseFloat(updated[index].costo_unitario) || 0;
    updated[index].subtotal = roundToTwo(cant * costo);

    setFormData({ ...formData, items: updated });
  };

  const roundToTwo = (num) => Math.round((num + Number.EPSILON) * 100) / 100;

  const calculateTotal = () => {
    return formData.items.reduce((acc, curr) => acc + (parseFloat(curr.subtotal) || 0), 0);
  };

  // Submit purchase
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.establecimiento.trim() || !formData.fecha_compra) {
      setFormError('Establecimiento y fecha de compra son obligatorios.');
      return;
    }

    if (formData.items.length === 0) {
      setFormError('Debe agregar al menos un producto adquirido.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        importe_total: calculateTotal(),
      };
      const res = await api.post('/compras', payload);
      if (res.data.success) {
        setShowModal(false);
        fetchCompras();
        fetchIngredientes();
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error al registrar la compra.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="font-label-sm uppercase tracking-wider text-secondary font-bold">
            Módulo 10 • Proveeduría & Abastecimiento
          </span>
          <h1 className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight mt-0.5">
            Registro de Compras a Proveedores
          </h1>
          <p className="text-xs text-secondary mt-1">
            Cada compra ingresada incrementa automáticamente el inventario y actualiza precios de referencia.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary hover:bg-[#853406] active:scale-95 text-on-primary font-label-md font-semibold shadow-sm transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">add_shopping_cart</span>
          <span>Registrar Nueva Compra</span>
        </button>
      </div>

      {/* Search Bar */}
      <section className="bg-surface-container-lowest p-4 rounded-2xl shadow-sm border border-outline-variant/30 flex items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[20px]">
            search
          </span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por establecimiento o folio ticket..."
            className="w-full h-11 pl-11 pr-4 bg-surface rounded-xl border border-outline-variant/50 text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
          />
        </div>
        <span className="text-xs text-secondary font-semibold">
          {compras.length} compras registradas
        </span>
      </section>

      {/* Compras Table */}
      {loading ? (
        <div className="text-center py-16 text-secondary flex flex-col items-center gap-2">
          <span className="material-symbols-outlined animate-spin text-[36px] text-primary">progress_activity</span>
          <span>Cargando compras...</span>
        </div>
      ) : compras.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-2xl p-12 text-center text-secondary border border-outline-variant/30">
          <span className="material-symbols-outlined text-[54px] text-outline mb-2">shopping_bag</span>
          <h3 className="font-title-lg font-bold text-on-surface">No hay compras registradas</h3>
          <p className="text-sm mt-1">Registra tickets de compra para surtir el inventario del taller.</p>
        </div>
      ) : (
        <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-surface-container-low text-secondary text-xs uppercase tracking-wider font-semibold border-b border-outline-variant/30">
                  <th className="py-3 px-4">Fecha</th>
                  <th className="py-3 px-4">Establecimiento / Proveedor</th>
                  <th className="py-3 px-4">Folio / Ticket</th>
                  <th className="py-3 px-4">Insumos Surtidos</th>
                  <th className="py-3 px-4 text-right">Importe Total</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 text-on-surface font-body-md">
                {compras.map((compra) => (
                  <tr key={compra.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="py-4 px-4 font-semibold text-xs whitespace-nowrap">
                      {compra.fecha_compra}
                    </td>
                    <td className="py-4 px-4 font-bold text-on-surface">
                      {compra.establecimiento}
                    </td>
                    <td className="py-4 px-4 font-mono text-secondary text-xs">
                      {compra.folio_ticket || 'S/N'}
                    </td>
                    <td className="py-4 px-4 text-xs text-secondary">
                      {compra.detalles?.map(d => `${d.ingrediente?.nombre} (${d.cantidad} ${d.unidad})`).join(', ') || 'Sin detalles'}
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-primary text-right text-base whitespace-nowrap">
                      ${compra.importe_total?.toFixed(2)}
                    </td>
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleOpenDetail(compra)}
                        className="text-xs font-bold text-primary hover:underline"
                      >
                        Ver Detalle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE / DETAIL MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/40 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8">
            <div className="flex items-center justify-between pb-4 border-b border-surface-variant mb-6">
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                {modalMode === 'create' ? 'Registrar Compra a Proveedor' : `Detalle de Compra #${selectedCompra?.id}`}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full text-secondary hover:text-on-surface hover:bg-surface-container flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-error-container text-on-error-container rounded-xl text-sm font-medium flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{formError}</span>
              </div>
            )}

            {modalMode === 'detail' ? (
              /* DETAIL VIEW */
              <div className="flex flex-col gap-4 text-on-surface">
                <div className="grid grid-cols-2 gap-4 bg-surface-container-low p-4 rounded-xl">
                  <div>
                    <span className="text-xs text-secondary font-bold uppercase">Establecimiento</span>
                    <p className="font-bold text-base mt-0.5">{selectedCompra?.establecimiento}</p>
                    <p className="text-xs text-secondary font-mono">Ticket: {selectedCompra?.folio_ticket || 'Sin comprobante'}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-secondary font-bold uppercase">Importe Total</span>
                    <div className="text-xl font-bold text-primary font-mono mt-0.5">
                      ${selectedCompra?.importe_total?.toFixed(2)}
                    </div>
                    <span className="text-xs text-secondary">{selectedCompra?.fecha_compra}</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase text-secondary mb-2">Insumos Ingresados al Inventario:</h4>
                  <div className="divide-y divide-outline-variant/20 border border-outline-variant/30 rounded-xl overflow-hidden">
                    {selectedCompra?.detalles?.map((det, i) => (
                      <div key={i} className="p-3 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-semibold text-on-surface">{det.ingrediente?.nombre}</span>
                          <div className="text-secondary mt-0.5">
                            {det.cantidad} {det.unidad} a ${det.costo_unitario?.toFixed(2)} /{det.unidad}
                          </div>
                        </div>
                        <span className="font-mono font-bold text-sm text-primary">
                          ${det.subtotal?.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-3 border-t border-surface-variant">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2 rounded-xl border border-outline-variant text-secondary text-xs font-semibold"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            ) : (
              /* CREATE PURCHASE FORM */
              <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-on-surface">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-secondary mb-1">Nombre del Establecimiento *</label>
                    <input
                      type="text"
                      required
                      value={formData.establecimiento}
                      onChange={(e) => setFormData({ ...formData, establecimiento: e.target.value })}
                      placeholder="Ej. Central de Abastos, City Club, Callebaut México"
                      className="w-full h-11 px-3.5 bg-surface rounded-xl border border-outline-variant/60 font-body-md focus:ring-2 focus:ring-primary shadow-sm font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-secondary mb-1">Número de Ticket / Folio Comprobante</label>
                    <input
                      type="text"
                      value={formData.folio_ticket}
                      onChange={(e) => setFormData({ ...formData, folio_ticket: e.target.value })}
                      placeholder="Ej. FAC-10294"
                      className="w-full h-11 px-3.5 bg-surface rounded-xl border border-outline-variant/60 font-body-md focus:ring-2 focus:ring-primary shadow-sm font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-secondary mb-1">Fecha de Compra *</label>
                  <input
                    type="date"
                    required
                    value={formData.fecha_compra}
                    onChange={(e) => setFormData({ ...formData, fecha_compra: e.target.value })}
                    className="w-full h-11 px-3 bg-surface rounded-xl border border-outline-variant/60 font-body-md focus:ring-2 focus:ring-primary shadow-sm"
                  />
                </div>

                {/* Items Purchased List */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-secondary uppercase">Productos Adquiridos (Surtido)</label>
                    <button
                      type="button"
                      onClick={addItemRow}
                      className="text-xs font-bold text-primary flex items-center gap-1 hover:underline"
                    >
                      <span className="material-symbols-outlined text-[16px]">add</span>
                      <span>Añadir Producto</span>
                    </button>
                  </div>

                  <div className="flex flex-col gap-2.5 max-h-52 overflow-y-auto pr-1">
                    {formData.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2.5 bg-surface-container-low rounded-xl">
                        <select
                          value={item.ingrediente_id}
                          onChange={(e) => updateItemField(idx, 'ingrediente_id', e.target.value)}
                          className="flex-1 h-10 px-2.5 bg-surface rounded-lg border border-outline-variant/50 text-xs font-semibold"
                        >
                          {ingredientesCatalogo.map((ing) => (
                            <option key={ing.id} value={ing.id}>
                              {ing.nombre} ({ing.unidad_base})
                            </option>
                          ))}
                        </select>

                        <input
                          type="number"
                          step="any"
                          min="0"
                          value={item.cantidad}
                          onChange={(e) => updateItemField(idx, 'cantidad', e.target.value)}
                          placeholder="Cant."
                          className="w-20 h-10 px-2 bg-surface rounded-lg border border-outline-variant/50 text-xs font-mono font-bold text-center"
                        />

                        <span className="text-xs font-bold text-secondary w-8 text-center">{item.unidad}</span>

                        <div className="flex items-center gap-1 w-24">
                          <span className="text-xs text-secondary">$</span>
                          <input
                            type="number"
                            step="any"
                            min="0"
                            value={item.costo_unitario}
                            onChange={(e) => updateItemField(idx, 'costo_unitario', e.target.value)}
                            placeholder="C.U."
                            className="w-full h-10 px-2 bg-surface rounded-lg border border-outline-variant/50 text-xs font-mono font-bold text-right"
                          />
                        </div>

                        <div className="w-24 text-right font-mono font-bold text-xs text-primary">
                          ${item.subtotal?.toFixed(2)}
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItemRow(idx)}
                          disabled={formData.items.length <= 1}
                          className="w-8 h-8 rounded-lg text-outline hover:text-error hover:bg-error-container/40 flex items-center justify-center disabled:opacity-20"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 p-3 bg-surface-container rounded-xl flex items-center justify-between text-sm">
                    <span className="font-bold text-secondary uppercase">Importe Total Calculado:</span>
                    <span className="font-mono text-xl font-bold text-primary">
                      ${calculateTotal().toFixed(2)}
                    </span>
                  </div>
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
                    disabled={saving}
                    className="px-6 py-2.5 rounded-xl bg-primary hover:bg-[#853406] text-white font-semibold shadow-sm flex items-center gap-2"
                  >
                    {saving && <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>}
                    <span>Guardar y Aumentar Inventario</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ComprasModule;
