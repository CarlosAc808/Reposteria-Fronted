import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const PedidosModule = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [viewMode, setViewMode] = useState('lista'); // 'lista' | 'calendario'
  const [calendarViewType, setCalendarViewType] = useState('mes'); // 'mes' | 'semana' | 'dia'
  const [alertas, setAlertas] = useState([]);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit' | 'detail'

  // Form state
  const [formData, setFormData] = useState({
    folio: '',
    cliente_nombre: '',
    cliente_telefono: '',
    fecha_registro: new Date().toISOString().split('T')[0],
    fecha_entrega: new Date().toISOString().split('T')[0],
    hora_entrega: '14:00',
    descripcion: '',
    sabor: 'Vainilla Clásica',
    tamano: 'Mediano (15-20 personas)',
    relleno: '',
    decoracion_tipo: '',
    dedicatoria: '',
    foto_referencia: '',
    cantidad: 1,
    precio_sugerido: '',
    observaciones: '',
    estado: 'pendiente',
  });

  const [formError, setFormError] = useState('');

  // Fetch orders
  const fetchPedidos = async () => {
    try {
      setLoading(true);
      const res = await api.get('/pedidos', {
        params: {
          buscar: search,
          estado: filterStatus,
        },
      });
      if (res.data.success) {
        setPedidos(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch upcoming alerts
  const fetchAlertas = async () => {
    try {
      const res = await api.get('/pedidos/calendario-alertas');
      if (res.data.success) {
        setAlertas(res.data.alertas_urgentes || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPedidos();
    fetchAlertas();
  }, [search, filterStatus]);

  // Open modal for create
  const handleOpenCreate = () => {
    const today = new Date().toISOString().split('T')[0];
    setFormData({
      folio: '',
      cliente_nombre: '',
      cliente_telefono: '',
      fecha_registro: today,
      fecha_entrega: today,
      hora_entrega: '14:00',
      descripcion: '',
      sabor: 'Vainilla Clásica',
      tamano: 'Mediano (15-20 personas)',
      relleno: '',
      decoracion_tipo: '',
      dedicatoria: '',
      foto_referencia: '',
      cantidad: 1,
      precio_sugerido: '',
      observaciones: '',
      estado: 'pendiente',
    });
    setFormError('');
    setModalMode('create');
    setShowModal(true);
  };

  // Open modal for edit
  const handleOpenEdit = (pedido) => {
    setSelectedPedido(pedido);
    setFormData({
      ...pedido,
      precio_sugerido: pedido.precio_sugerido || '',
    });
    setFormError('');
    setModalMode('edit');
    setShowModal(true);
  };

  // Open modal for detail
  const handleOpenDetail = (pedido) => {
    setSelectedPedido(pedido);
    setModalMode('detail');
    setShowModal(true);
  };

  // Submit order form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Validations
    if (!formData.cliente_nombre.trim() || !formData.fecha_entrega || !formData.hora_entrega) {
      setFormError('Nombre del cliente, fecha y hora de entrega son obligatorios.');
      return;
    }

    if (new Date(formData.fecha_entrega) < new Date(formData.fecha_registro)) {
      setFormError('La fecha de entrega no puede ser anterior a la fecha de registro.');
      return;
    }

    try {
      if (modalMode === 'create') {
        const res = await api.post('/pedidos', formData);
        if (res.data.success) {
          setShowModal(false);
          fetchPedidos();
          fetchAlertas();
        }
      } else if (modalMode === 'edit') {
        const res = await api.put(`/pedidos/${selectedPedido.id}`, formData);
        if (res.data.success) {
          setShowModal(false);
          fetchPedidos();
          fetchAlertas();
        }
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error al guardar el pedido.');
    }
  };

  // Quick change status
  const handleStatusChange = async (id, nuevoEstado) => {
    try {
      const res = await api.patch(`/pedidos/${id}/estado`, { estado: nuevoEstado });
      if (res.data.success) {
        fetchPedidos();
        fetchAlertas();
        if (selectedPedido && selectedPedido.id === id) {
          setSelectedPedido(res.data.data);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Status badge styling helper
  const getStatusBadge = (estado) => {
    switch (estado) {
      case 'listo':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E6FFFA] text-[#234E52] border border-[#81E6D9] text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#38A169]"></span> Listo para entregar
          </span>
        );
      case 'en_preparacion':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FEFCBF] text-[#744210] border border-[#F6E05E] text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D69E2E] animate-pulse"></span> En preparación
          </span>
        );
      case 'entregado':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> Entregado
          </span>
        );
      case 'cancelado':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FFF5F5] text-[#9B2C2C] border border-[#FEB2B2] text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E53E3E]"></span> Cancelado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F4EFEA] text-[#4A3E38] border border-[#D6C7B2] text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#A0AEC0]"></span> Pendiente
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-16">
      {/* Dynamic Operational Alert */}
      {alertas.length > 0 && (
        <aside className="w-full bg-secondary-container text-on-secondary-container rounded-2xl p-4 shadow-sm border border-secondary/30 flex items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="material-symbols-outlined text-primary text-[24px] flex-shrink-0">alarm</span>
            <p className="font-title-md truncate text-on-secondary-container font-medium">
              <strong>{alertas.length} entregas</strong> programadas para las próximas 2 horas: {alertas.map(a => `${a.folio} (${a.cliente_nombre})`).join(', ')}
            </p>
          </div>
          <span className="text-xs uppercase bg-surface-container-lowest text-primary px-3 py-1 rounded-full font-bold shadow-sm">
            Atención Inmediata
          </span>
        </aside>
      )}

      {/* Header with Title and New Order Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="font-label-sm uppercase tracking-wider text-secondary font-bold">
            Módulo 6 • Atención y Vitrina
          </span>
          <h1 className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight mt-0.5">
            Gestión de Pedidos y Calendario
          </h1>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary hover:bg-[#853406] active:scale-95 text-on-primary font-label-md font-semibold shadow-sm transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">add_circle</span>
          <span>Registrar Nuevo Pedido</span>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <section className="bg-surface-container-lowest p-4 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[20px]">
            search
          </span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por cliente, folio o tel..."
            className="w-full h-11 pl-11 pr-4 bg-surface rounded-xl border border-outline-variant/50 text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
          />
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto no-scrollbar py-1">
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'pendiente', label: 'Pendientes' },
            { id: 'en_preparacion', label: 'En Preparación' },
            { id: 'listo', label: 'Listos' },
            { id: 'entregado', label: 'Entregados' },
            { id: 'cancelado', label: 'Cancelados' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setFilterStatus(st.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                filterStatus === st.id
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* View Switcher (Lista vs Calendario) */}
        <div className="bg-surface-container p-1 rounded-xl flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => setViewMode('lista')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'lista'
                ? 'bg-surface-container-lowest text-primary shadow-sm'
                : 'text-secondary hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">format_list_bulleted</span>
            <span>Tabla</span>
          </button>
          <button
            onClick={() => setViewMode('calendario')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'calendario'
                ? 'bg-surface-container-lowest text-primary shadow-sm'
                : 'text-secondary hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">calendar_month</span>
            <span>Calendario</span>
          </button>
        </div>
      </section>

      {/* Main Content Area */}
      {loading ? (
        <div className="text-center py-16 text-secondary flex flex-col items-center gap-2">
          <span className="material-symbols-outlined animate-spin text-[36px] text-primary">progress_activity</span>
          <span>Cargando pedidos...</span>
        </div>
      ) : viewMode === 'lista' ? (
        /* TABLE / LIST VIEW */
        <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 overflow-hidden">
          {pedidos.length === 0 ? (
            <div className="text-center py-16 text-secondary">
              <span className="material-symbols-outlined text-[48px] text-outline mb-2">cake</span>
              <p className="font-title-md">No se encontraron pedidos registrados con los filtros aplicados.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant/40 text-secondary text-xs uppercase tracking-wider font-semibold">
                    <th className="py-3.5 px-4">Folio</th>
                    <th className="py-3.5 px-4">Cliente</th>
                    <th className="py-3.5 px-4">Pastel & Sabor</th>
                    <th className="py-3.5 px-4">Fecha y Hora Entrega</th>
                    <th className="py-3.5 px-4">Estado</th>
                    <th className="py-3.5 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20 text-sm font-body-md text-on-surface">
                  {pedidos.map((pedido) => (
                    <tr key={pedido.id} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="py-4 px-4 font-mono font-bold text-primary">
                        {pedido.folio}
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-semibold text-on-surface">{pedido.cliente_nombre}</div>
                        <div className="text-xs text-secondary">{pedido.cliente_telefono || 'Sin teléfono'}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-medium text-on-surface">{pedido.sabor}</div>
                        <div className="text-xs text-secondary">{pedido.tamano} • {pedido.cantidad} pza(s)</div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-semibold text-on-surface">
                          {pedido.fecha_entrega?.split('T')[0]}
                        </div>
                        <div className="text-xs text-secondary flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">schedule</span>
                          {pedido.hora_entrega?.substring(0, 5)} hrs
                        </div>
                        {pedido.fecha_entrega_real && (
                          <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                            Real: {new Date(pedido.fecha_entrega_real).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        {getStatusBadge(pedido.estado)}
                      </td>
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenDetail(pedido)}
                            title="Ver Detalle"
                            className="p-1.5 text-secondary hover:text-primary hover:bg-surface-container rounded-lg transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                          </button>
                          <button
                            onClick={() => handleOpenEdit(pedido)}
                            title="Editar Pedido"
                            className="p-1.5 text-secondary hover:text-primary hover:bg-surface-container rounded-lg transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>

                          {/* Quick status dropdown or next step action */}
                          {pedido.estado === 'pendiente' && (
                            <button
                              onClick={() => handleStatusChange(pedido.id, 'en_preparacion')}
                              className="px-2.5 py-1 text-xs bg-[#FEFCBF] text-[#744210] hover:bg-yellow-200 rounded-lg font-semibold border border-yellow-300 transition-colors"
                            >
                              Hornear
                            </button>
                          )}
                          {pedido.estado === 'en_preparacion' && (
                            <button
                              onClick={() => handleStatusChange(pedido.id, 'listo')}
                              className="px-2.5 py-1 text-xs bg-[#E6FFFA] text-[#234E52] hover:bg-teal-100 rounded-lg font-semibold border border-teal-300 transition-colors"
                            >
                              Listo
                            </button>
                          )}
                          {pedido.estado === 'listo' && (
                            <button
                              onClick={() => handleStatusChange(pedido.id, 'entregado')}
                              className="px-2.5 py-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-sm transition-colors"
                            >
                              Entregar
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
      ) : (
        /* CALENDAR VIEW (Monthly Grid) */
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-surface-variant">
            <h3 className="font-title-lg text-title-lg text-on-surface font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">calendar_month</span>
              Calendario de Entregas Programadas
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-secondary font-medium">
                Haga clic en cualquier pedido para ver o actualizar su estado.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pedidos.map((pedido) => (
              <div
                key={pedido.id}
                onClick={() => handleOpenDetail(pedido)}
                className="bg-surface-container-low/70 hover:bg-surface-container p-4 rounded-xl border border-outline-variant/40 shadow-sm cursor-pointer transition-all flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-primary">{pedido.folio}</span>
                    {getStatusBadge(pedido.estado)}
                  </div>
                  <h4 className="font-title-md text-title-md font-bold text-on-surface mt-1 truncate">
                    {pedido.cliente_nombre}
                  </h4>
                  <p className="text-xs text-secondary mt-0.5">
                    {pedido.sabor} • {pedido.tamano}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-outline-variant/30 text-xs">
                  <div className="flex items-center gap-1 text-secondary font-semibold">
                    <span className="material-symbols-outlined text-[16px] text-primary">event</span>
                    <span>{pedido.fecha_entrega?.split('T')[0]}</span>
                  </div>
                  <div className="flex items-center gap-1 font-bold text-on-surface">
                    <span className="material-symbols-outlined text-[16px]">schedule</span>
                    <span>{pedido.hora_entrega?.substring(0, 5)} hrs</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CREATE / EDIT / DETAIL MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/40 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8">
            <div className="flex items-center justify-between pb-4 border-b border-surface-variant mb-6">
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                {modalMode === 'create' && 'Registrar Nuevo Pedido'}
                {modalMode === 'edit' && `Editar Pedido #${formData.folio}`}
                {modalMode === 'detail' && `Detalle del Pedido #${selectedPedido?.folio}`}
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
                <div className="grid grid-cols-2 gap-4 bg-surface-container-low p-4 rounded-xl">
                  <div>
                    <span className="text-xs uppercase text-secondary font-bold">Cliente</span>
                    <p className="font-semibold text-base mt-0.5">{selectedPedido?.cliente_nombre}</p>
                    <p className="text-xs text-secondary mt-0.5">{selectedPedido?.cliente_telefono || 'Sin teléfono'}</p>
                  </div>
                  <div>
                    <span className="text-xs uppercase text-secondary font-bold">Estado Actual</span>
                    <div className="mt-1">{getStatusBadge(selectedPedido?.estado)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-secondary font-bold uppercase">Fecha de Entrega</span>
                    <p className="font-semibold">{selectedPedido?.fecha_entrega?.split('T')[0]} a las {selectedPedido?.hora_entrega?.substring(0, 5)} hrs</p>
                  </div>
                  <div>
                    <span className="text-xs text-secondary font-bold uppercase">Fecha de Entrega Real</span>
                    <p className="font-semibold text-emerald-800">
                      {selectedPedido?.fecha_entrega_real
                        ? new Date(selectedPedido.fecha_entrega_real).toLocaleString('es-MX')
                        : 'Aún no entregado'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-secondary font-bold uppercase">Sabor & Tamaño</span>
                    <p className="font-semibold">{selectedPedido?.sabor}</p>
                    <p className="text-xs text-secondary">{selectedPedido?.tamano} • {selectedPedido?.cantidad} pieza(s)</p>
                  </div>
                  <div>
                    <span className="text-xs text-secondary font-bold uppercase">Relleno & Decoración</span>
                    <p className="font-semibold">{selectedPedido?.relleno || 'Estándar'}</p>
                    <p className="text-xs text-secondary">{selectedPedido?.decoracion_tipo || 'Tradicional'}</p>
                  </div>
                </div>

                {selectedPedido?.dedicatoria && (
                  <div className="p-3 bg-secondary-container/40 rounded-xl">
                    <span className="text-xs text-secondary font-bold uppercase">Dedicatoria para el pastel</span>
                    <p className="font-serif italic text-base mt-0.5 text-primary font-medium">"{selectedPedido.dedicatoria}"</p>
                  </div>
                )}

                {selectedPedido?.observaciones && (
                  <div>
                    <span className="text-xs text-secondary font-bold uppercase">Observaciones</span>
                    <p className="text-sm mt-0.5">{selectedPedido.observaciones}</p>
                  </div>
                )}

                {/* State Changing Action Buttons */}
                <div className="pt-4 border-t border-surface-variant flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-secondary font-bold">Cambiar Estado:</span>
                    <button
                      onClick={() => handleStatusChange(selectedPedido.id, 'pendiente')}
                      className="px-3 py-1.5 rounded-lg bg-[#F4EFEA] text-[#4A3E38] border border-[#D6C7B2] text-xs font-semibold hover:bg-[#e9e2d8] transition-colors"
                    >
                      Pendiente
                    </button>
                    <button
                      onClick={() => handleStatusChange(selectedPedido.id, 'en_preparacion')}
                      className="px-3 py-1.5 rounded-lg bg-[#FEFCBF] text-[#744210] text-xs font-semibold hover:bg-yellow-200 transition-colors"
                    >
                      En preparación
                    </button>
                    <button
                      onClick={() => handleStatusChange(selectedPedido.id, 'listo')}
                      className="px-3 py-1.5 rounded-lg bg-[#E6FFFA] text-[#234E52] text-xs font-semibold hover:bg-teal-100 transition-colors"
                    >
                      Listo
                    </button>
                    <button
                      onClick={() => handleStatusChange(selectedPedido.id, 'entregado')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 shadow-sm transition-colors"
                    >
                      Registrar Entrega
                    </button>
                    <button
                      onClick={() => handleStatusChange(selectedPedido.id, 'cancelado')}
                      className="px-3 py-1.5 rounded-lg bg-error-container text-error text-xs font-semibold hover:bg-red-200 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setShowModal(false);
                      handleOpenEdit(selectedPedido);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface-container text-primary font-semibold text-xs"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                    <span>Editar Pedido</span>
                  </button>
                </div>
              </div>
            ) : (
              /* CREATE / EDIT FORM */
              <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-on-surface">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-secondary mb-1">Nombre del Cliente *</label>
                    <input
                      type="text"
                      required
                      value={formData.cliente_nombre}
                      onChange={(e) => setFormData({ ...formData, cliente_nombre: e.target.value })}
                      placeholder="Ej. Sofía Hernández"
                      className="w-full h-11 px-3.5 bg-surface rounded-xl border border-outline-variant/60 font-body-md focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-secondary mb-1">Teléfono de Contacto</label>
                    <input
                      type="tel"
                      value={formData.cliente_telefono}
                      onChange={(e) => setFormData({ ...formData, cliente_telefono: e.target.value })}
                      placeholder="55 1234 5678"
                      className="w-full h-11 px-3.5 bg-surface rounded-xl border border-outline-variant/60 font-body-md focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-secondary mb-1">Fecha de Entrega *</label>
                    <input
                      type="date"
                      required
                      value={formData.fecha_entrega}
                      onChange={(e) => setFormData({ ...formData, fecha_entrega: e.target.value })}
                      className="w-full h-11 px-3 bg-surface rounded-xl border border-outline-variant/60 font-body-md focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-secondary mb-1">Hora de Entrega *</label>
                    <input
                      type="time"
                      required
                      value={formData.hora_entrega}
                      onChange={(e) => setFormData({ ...formData, hora_entrega: e.target.value })}
                      className="w-full h-11 px-3 bg-surface rounded-xl border border-outline-variant/60 font-body-md focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-secondary mb-1">Cantidad de Pasteles</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.cantidad}
                      onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
                      className="w-full h-11 px-3 bg-surface rounded-xl border border-outline-variant/60 font-body-md focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-secondary mb-1">Sabor del Pastel</label>
                    <input
                      type="text"
                      value={formData.sabor}
                      onChange={(e) => setFormData({ ...formData, sabor: e.target.value })}
                      placeholder="Ej. Red Velvet, Chocolate Belga, Tres Leches"
                      className="w-full h-11 px-3.5 bg-surface rounded-xl border border-outline-variant/60 font-body-md focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-secondary mb-1">Tamaño / Porciones</label>
                    <input
                      type="text"
                      value={formData.tamano}
                      onChange={(e) => setFormData({ ...formData, tamano: e.target.value })}
                      placeholder="Ej. Mediano (15-20 personas)"
                      className="w-full h-11 px-3.5 bg-surface rounded-xl border border-outline-variant/60 font-body-md focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-secondary mb-1">Relleno</label>
                    <input
                      type="text"
                      value={formData.relleno}
                      onChange={(e) => setFormData({ ...formData, relleno: e.target.value })}
                      placeholder="Ej. Queso crema con fresas, Crema de avellana"
                      className="w-full h-11 px-3.5 bg-surface rounded-xl border border-outline-variant/60 font-body-md focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-secondary mb-1">Tipo de Decoración</label>
                    <input
                      type="text"
                      value={formData.decoracion_tipo}
                      onChange={(e) => setFormData({ ...formData, decoracion_tipo: e.target.value })}
                      placeholder="Ej. Drip de chocolate, Fondant floral, Merengue"
                      className="w-full h-11 px-3.5 bg-surface rounded-xl border border-outline-variant/60 font-body-md focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-secondary mb-1">Dedicatoria para el Pastel</label>
                  <input
                    type="text"
                    value={formData.dedicatoria}
                    onChange={(e) => setFormData({ ...formData, dedicatoria: e.target.value })}
                    placeholder="Ej. ¡Feliz Cumpleaños María!"
                    className="w-full h-11 px-3.5 bg-surface rounded-xl border border-outline-variant/60 font-body-md focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-secondary mb-1">Observaciones / Detalles Especiales</label>
                  <textarea
                    rows="2"
                    value={formData.observaciones}
                    onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                    placeholder="Instrucciones de empaque, intolerancias, detalles de entrega..."
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
                    {modalMode === 'create' ? 'Guardar Pedido' : 'Actualizar Pedido'}
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

export default PedidosModule;
