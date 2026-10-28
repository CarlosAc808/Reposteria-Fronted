import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const RecetarioModule = () => {
  const [recetas, setRecetas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit' | 'detail'
  const [selectedReceta, setSelectedReceta] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    nombre: '',
    fotografia: '',
    descripcion: '',
    sabor: '',
    tamano_rendimiento: '',
    tiempo_preparacion: 30,
    tiempo_horneado: 25,
    instrucciones: '',
    ingredientes: [
      { nombre_ingrediente: '', cantidad: '', unidad: 'g' }
    ],
  });

  const [formError, setFormError] = useState('');

  const fetchRecetas = async () => {
    try {
      setLoading(true);
      const res = await api.get('/recetas', { params: { buscar: search } });
      if (res.data.success) {
        setRecetas(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecetas();
  }, [search]);

  // Open create modal
  const handleOpenCreate = () => {
    setFormData({
      nombre: '',
      fotografia: '',
      descripcion: '',
      sabor: '',
      tamano_rendimiento: '',
      tiempo_preparacion: 30,
      tiempo_horneado: 25,
      instrucciones: '',
      ingredientes: [
        { nombre_ingrediente: '', cantidad: '', unidad: 'g' }
      ],
    });
    setFormError('');
    setModalMode('create');
    setShowModal(true);
  };

  // Open edit modal
  const handleOpenEdit = (receta) => {
    setSelectedReceta(receta);
    setFormData({
      nombre: receta.nombre,
      fotografia: receta.fotografia || '',
      descripcion: receta.descripcion || '',
      sabor: receta.sabor || '',
      tamano_rendimiento: receta.tamano_rendimiento || '',
      tiempo_preparacion: receta.tiempo_preparacion || 0,
      tiempo_horneado: receta.tiempo_horneado || 0,
      instrucciones: receta.instrucciones || '',
      ingredientes: receta.ingredientes?.length > 0
        ? receta.ingredientes.map(i => ({
            nombre_ingrediente: i.nombre_ingrediente,
            cantidad: i.cantidad,
            unidad: i.unidad,
          }))
        : [{ nombre_ingrediente: '', cantidad: '', unidad: 'g' }],
    });
    setFormError('');
    setModalMode('edit');
    setShowModal(true);
  };

  // Open detail modal
  const handleOpenDetail = (receta) => {
    setSelectedReceta(receta);
    setModalMode('detail');
    setShowModal(true);
  };

  // Delete recipe
  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar esta receta del recetario?')) return;
    try {
      const res = await api.delete(`/recetas/${id}`);
      if (res.data.success) {
        fetchRecetas();
        if (showModal) setShowModal(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Add / remove ingredient row in form
  const addIngredientRow = () => {
    setFormData({
      ...formData,
      ingredientes: [...formData.ingredientes, { nombre_ingrediente: '', cantidad: '', unidad: 'g' }]
    });
  };

  const removeIngredientRow = (index) => {
    const updated = [...formData.ingredientes];
    updated.splice(index, 1);
    setFormData({ ...formData, ingredientes: updated });
  };

  const updateIngredientField = (index, field, value) => {
    const updated = [...formData.ingredientes];
    updated[index][field] = value;
    setFormData({ ...formData, ingredientes: updated });
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.nombre.trim()) {
      setFormError('El nombre de la receta es obligatorio.');
      return;
    }

    try {
      if (modalMode === 'create') {
        const res = await api.post('/recetas', formData);
        if (res.data.success) {
          setShowModal(false);
          fetchRecetas();
        }
      } else if (modalMode === 'edit') {
        const res = await api.put(`/recetas/${selectedReceta.id}`, formData);
        if (res.data.success) {
          setShowModal(false);
          fetchRecetas();
        }
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error al guardar la receta.');
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="font-label-sm uppercase tracking-wider text-secondary font-bold">
            Módulo 7 • Libro Maestro
          </span>
          <h1 className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight mt-0.5">
            Recetario Digital del Atelier
          </h1>
          <p className="text-xs text-secondary mt-1">
            Fichas técnicas y documentación de preparación (no afecta el inventario).
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary hover:bg-[#853406] active:scale-95 text-on-primary font-label-md font-semibold shadow-sm transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">add_circle</span>
          <span>Nueva Receta</span>
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
            placeholder="Buscar por nombre de receta o sabor..."
            className="w-full h-11 pl-11 pr-4 bg-surface rounded-xl border border-outline-variant/50 text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
          />
        </div>
        <span className="text-xs text-secondary font-semibold">
          {recetas.length} recetas documentadas
        </span>
      </section>

      {/* Recipes Visual Grid */}
      {loading ? (
        <div className="text-center py-16 text-secondary flex flex-col items-center gap-2">
          <span className="material-symbols-outlined animate-spin text-[36px] text-primary">progress_activity</span>
          <span>Cargando recetario...</span>
        </div>
      ) : recetas.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-2xl p-12 text-center text-secondary border border-outline-variant/30">
          <span className="material-symbols-outlined text-[54px] text-outline mb-2">menu_book</span>
          <h3 className="font-title-lg text-title-lg font-bold text-on-surface">No hay recetas encontradas</h3>
          <p className="text-sm mt-1">Empieza agregando la primera receta maestra a la pastelería.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recetas.map((receta) => (
            <div
              key={receta.id}
              className="bg-surface-container-lowest rounded-2xl overflow-hidden border border-outline-variant/30 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              {/* Recipe Photo */}
              <div className="h-48 w-full bg-surface-container relative overflow-hidden group">
                <img
                  src={
                    receta.fotografia ||
                    'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80'
                  }
                  alt={receta.nombre}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {receta.sabor && (
                  <span className="absolute bottom-2 left-2 px-2.5 py-1 rounded-full bg-inverse-surface/80 text-inverse-on-surface text-xs font-semibold backdrop-blur-sm">
                    {receta.sabor}
                  </span>
                )}
              </div>

              {/* Recipe Body */}
              <div className="p-5 flex-1 flex flex-col justify-between gap-3">
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold leading-tight">
                    {receta.nombre}
                  </h3>
                  <p className="text-xs text-secondary mt-1 line-clamp-2">
                    {receta.descripcion || 'Sin descripción detallada.'}
                  </p>
                </div>

                <div className="flex items-center justify-between py-2 border-y border-outline-variant/20 text-xs text-secondary font-medium">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-primary">timer</span>
                    <span>Prep: {receta.tiempo_preparacion}m</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-primary">outdoor_grill</span>
                    <span>Horno: {receta.tiempo_horneado}m</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-primary">view_in_ar</span>
                    <span>{receta.ingredientes?.length || 0} insumos</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => handleOpenDetail(receta)}
                    className="text-primary hover:underline text-xs font-bold flex items-center gap-1"
                  >
                    <span>Ver Ficha Técnica</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(receta)}
                      title="Editar Receta"
                      className="p-1.5 text-secondary hover:text-primary hover:bg-surface-container rounded-lg transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(receta.id)}
                      title="Eliminar Receta"
                      className="p-1.5 text-secondary hover:text-error hover:bg-error-container/40 rounded-lg transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* RECIPE DETAIL / CREATE / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/40 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8">
            <div className="flex items-center justify-between pb-4 border-b border-surface-variant mb-6">
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                {modalMode === 'create' && 'Nueva Receta Maestra'}
                {modalMode === 'edit' && `Editar: ${formData.nombre}`}
                {modalMode === 'detail' && selectedReceta?.nombre}
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
              <div className="flex flex-col gap-6 text-on-surface">
                {selectedReceta?.fotografia && (
                  <div className="h-60 w-full rounded-xl overflow-hidden shadow-sm">
                    <img
                      src={selectedReceta.fotografia}
                      alt={selectedReceta.nombre}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-surface-container-low p-4 rounded-xl text-center">
                  <div>
                    <span className="text-[11px] text-secondary font-bold uppercase">Sabor</span>
                    <p className="font-semibold text-sm mt-0.5">{selectedReceta?.sabor || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-[11px] text-secondary font-bold uppercase">Rendimiento</span>
                    <p className="font-semibold text-sm mt-0.5">{selectedReceta?.tamano_rendimiento || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-[11px] text-secondary font-bold uppercase">Tiempo Prep</span>
                    <p className="font-semibold text-sm mt-0.5">{selectedReceta?.tiempo_preparacion} min</p>
                  </div>
                  <div>
                    <span className="text-[11px] text-secondary font-bold uppercase">Tiempo Horno</span>
                    <p className="font-semibold text-sm mt-0.5">{selectedReceta?.tiempo_horneado} min</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-title-md font-bold mb-2 flex items-center gap-1.5 text-primary">
                    <span className="material-symbols-outlined text-[18px]">inventory_2</span>
                    Ingredientes Necesarios
                  </h4>
                  <div className="bg-surface rounded-xl border border-outline-variant/30 divide-y divide-outline-variant/20 overflow-hidden">
                    {selectedReceta?.ingredientes?.map((ing, i) => (
                      <div key={i} className="p-3 flex items-center justify-between text-sm">
                        <span className="font-medium text-on-surface">{ing.nombre_ingrediente}</span>
                        <span className="font-mono font-bold text-primary">
                          {ing.cantidad} {ing.unidad}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedReceta?.instrucciones && (
                  <div>
                    <h4 className="font-title-md font-bold mb-2 flex items-center gap-1.5 text-primary">
                      <span className="material-symbols-outlined text-[18px]">receipt</span>
                      Paso a Paso de Preparación
                    </h4>
                    <div className="bg-surface-container-low p-4 rounded-xl text-sm leading-relaxed whitespace-pre-line text-on-surface">
                      {selectedReceta.instrucciones}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t border-surface-variant">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      handleOpenEdit(selectedReceta);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white font-semibold text-xs"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                    <span>Editar Ficha Técnica</span>
                  </button>
                </div>
              </div>
            ) : (
              /* CREATE / EDIT FORM */
              <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-on-surface">
                <div>
                  <label className="block text-xs font-bold text-secondary mb-1">Nombre de la Receta *</label>
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Ej. Pastel de Ópera Francés"
                    className="w-full h-11 px-3.5 bg-surface rounded-xl border border-outline-variant/60 font-body-md focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-secondary mb-1">Sabor Característico</label>
                    <input
                      type="text"
                      value={formData.sabor}
                      onChange={(e) => setFormData({ ...formData, sabor: e.target.value })}
                      placeholder="Ej. Café & Chocolate, Fresa Salvaje"
                      className="w-full h-11 px-3.5 bg-surface rounded-xl border border-outline-variant/60 font-body-md focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-secondary mb-1">Rendimiento / Tamaño</label>
                    <input
                      type="text"
                      value={formData.tamano_rendimiento}
                      onChange={(e) => setFormData({ ...formData, tamano_rendimiento: e.target.value })}
                      placeholder="Ej. Molde 22 cm (12 porciones)"
                      className="w-full h-11 px-3.5 bg-surface rounded-xl border border-outline-variant/60 font-body-md focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-secondary mb-1">Tiempo Preparación (min)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.tiempo_preparacion}
                      onChange={(e) => setFormData({ ...formData, tiempo_preparacion: e.target.value })}
                      className="w-full h-11 px-3 bg-surface rounded-xl border border-outline-variant/60 font-body-md focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-secondary mb-1">Tiempo Horneado (min)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.tiempo_horneado}
                      onChange={(e) => setFormData({ ...formData, tiempo_horneado: e.target.value })}
                      className="w-full h-11 px-3 bg-surface rounded-xl border border-outline-variant/60 font-body-md focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-secondary mb-1">URL de Fotografía</label>
                  <input
                    type="url"
                    value={formData.fotografia}
                    onChange={(e) => setFormData({ ...formData, fotografia: e.target.value })}
                    placeholder="https://..."
                    className="w-full h-11 px-3.5 bg-surface rounded-xl border border-outline-variant/60 font-body-md focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-secondary mb-1">Descripción Breve</label>
                  <textarea
                    rows="2"
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    placeholder="Resumen del sabor, texturas y ocasión ideal..."
                    className="w-full p-3 bg-surface rounded-xl border border-outline-variant/60 font-body-md focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                  ></textarea>
                </div>

                {/* Dynamic Ingredients Adder */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-secondary uppercase">Ingredientes y Cantidades</label>
                    <button
                      type="button"
                      onClick={addIngredientRow}
                      className="text-xs font-bold text-primary flex items-center gap-1 hover:underline"
                    >
                      <span className="material-symbols-outlined text-[16px]">add</span>
                      <span>Añadir Ingrediente</span>
                    </button>
                  </div>

                  <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                    {formData.ingredientes.map((ing, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          required
                          value={ing.nombre_ingrediente}
                          onChange={(e) => updateIngredientField(idx, 'nombre_ingrediente', e.target.value)}
                          placeholder="Nombre ingrediente"
                          className="flex-1 h-10 px-3 bg-surface rounded-lg border border-outline-variant/50 text-xs focus:ring-1 focus:ring-primary"
                        />
                        <input
                          type="number"
                          step="any"
                          required
                          value={ing.cantidad}
                          onChange={(e) => updateIngredientField(idx, 'cantidad', e.target.value)}
                          placeholder="Cant."
                          className="w-20 h-10 px-2 bg-surface rounded-lg border border-outline-variant/50 text-xs focus:ring-1 focus:ring-primary font-mono"
                        />
                        <select
                          value={ing.unidad}
                          onChange={(e) => updateIngredientField(idx, 'unidad', e.target.value)}
                          className="w-20 h-10 px-2 bg-surface rounded-lg border border-outline-variant/50 text-xs font-semibold"
                        >
                          <option value="g">g</option>
                          <option value="kg">kg</option>
                          <option value="ml">ml</option>
                          <option value="L">L</option>
                          <option value="pza">pza</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => removeIngredientRow(idx)}
                          className="w-8 h-8 rounded-lg text-outline hover:text-error hover:bg-error-container/40 flex items-center justify-center"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-secondary mb-1">Instrucciones de Elaboración</label>
                  <textarea
                    rows="4"
                    value={formData.instrucciones}
                    onChange={(e) => setFormData({ ...formData, instrucciones: e.target.value })}
                    placeholder="1. Batir claras a punto de nieve...&#10;2. Incorporar harina tamizada..."
                    className="w-full p-3 bg-surface rounded-xl border border-outline-variant/60 font-body-md focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                  ></textarea>
                </div>

                <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-surface-variant">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 rounded-xl border border-outline-variant text-secondary font-semibold hover:bg-surface-container transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-primary hover:bg-[#853406] text-on-primary font-semibold shadow-sm transition-all"
                  >
                    {modalMode === 'create' ? 'Guardar Receta' : 'Actualizar Receta'}
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

export default RecetarioModule;
