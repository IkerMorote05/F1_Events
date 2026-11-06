import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, Power, Trash2 } from 'lucide-react';
import { DataTable } from '../../components/DataTable';
import { PilotoError } from '../../components/PilotoError';
import { PilotoSkeleton } from '../../components/PilotoSkeleton';
import { useTicketTypes } from '../../hooks/useTicketTypes';
import { confirmDeletion, showApiError, showSuccess } from '../../utils/sweetAlert';

const formatPrice = (price) => Number(price).toLocaleString('es-ES', {
  style: 'currency',
  currency: 'EUR'
});
const getTotalPrice = (ticket) => (
  ticket.basePrice !== undefined
    && ticket.basePrice !== null
    && Number.isFinite(Number(ticket.basePrice))
    ? Number(ticket.basePrice) * Number(ticket.duration) + (Number(ticket.category?.price) || 0)
    : Number(ticket.price) + (Number(ticket.category?.price) || 0)
);

export const TicketTypesListPage = () => {
  const navigate = useNavigate();
  const { items: ticketTypes, loading, error, load, updateItem, removeItem } = useTicketTypes();

  const handleToggleActive = async (ticketType) => {
    try {
      await updateItem(ticketType._id, { isActive: ticketType.isActive === false });
      await showSuccess(ticketType.isActive === false
        ? 'Tipo de entrada activado correctamente'
        : 'Tipo de entrada desactivado correctamente');
    } catch (requestError) {
      await showApiError(requestError, 'No se pudo cambiar el estado del tipo de entrada');
    }
  };

  const handleDelete = async (ticketType) => {
    if (!await confirmDeletion(`el tipo de entrada "${ticketType.sku}"`)) return;
    try {
      await removeItem(ticketType._id);
      await showSuccess('Tipo de entrada eliminado correctamente');
    } catch (requestError) {
      await showApiError(requestError, 'No se pudo eliminar el tipo de entrada');
    }
  };

  if (loading) return <PilotoSkeleton resourceName="tipos de entrada" />;
  if (error) return <PilotoError resourceName="tipos de entrada" message={error} onRetry={load} />;

  const columns = [
    { key: 'sku', label: 'SKU', render: (ticket) => ticket.sku || '—' },
    { key: 'circuit', label: 'Circuito', render: (ticket) => ticket.circuit?.nombre || '—' },
    { key: 'race', label: 'Carrera', render: (ticket) => ticket.race?.nombre || '—' },
    {
      key: 'price',
      label: 'Precio',
      render: (ticket) => Number.isFinite(getTotalPrice(ticket)) ? formatPrice(getTotalPrice(ticket)) : '—'
    },
    { key: 'duration', label: 'Duración', render: (ticket) => `${ticket.duration} ${ticket.duration === 1 ? 'día' : 'días'}` },
    {
      key: 'category',
      label: 'Variante',
      render: (ticket) => (
        <div>
          <strong>{ticket.category?.sku || '—'}</strong>
          {ticket.category?.descripcion ? <p>{ticket.category.descripcion}</p> : null}
        </div>
      )
    },
    {
      key: 'availability',
      label: 'Disponibles',
      render: (ticket) => `${ticket.availableQuantity ?? 0} entradas`
    },
    {
      key: 'status',
      label: 'Estado',
      render: (ticket) => {
        const deleted = Boolean(ticket.deletedAt);
        const active = ticket.isActive !== false;
        return (
          <button
            type="button"
            className={`team-status-button ${deleted ? 'is-deleted' : active ? 'is-active' : 'is-inactive'}`}
            onClick={() => !deleted && handleToggleActive(ticket)}
            disabled={deleted}
            aria-pressed={!deleted && active}
            aria-label={deleted
              ? `Tipo de entrada ${ticket.sku} eliminado`
              : `${active ? 'Desactivar' : 'Activar'} tipo de entrada ${ticket.sku}`}
          >
            <Power size={15} aria-hidden="true" />
            {deleted ? 'Eliminado' : active ? 'Activo' : 'Inactivo'}
          </button>
        );
      }
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (ticket) => ticket.deletedAt ? '—' : (
        <div className="piloto-row-actions">
          <button
            type="button"
            className="btn-edit team-action-button"
            onClick={() => navigate(`/ticket-types/${ticket._id}/editar`)}
            aria-label={`Editar tipo de entrada ${ticket.sku}`}
            title="Editar"
          >
            <Pencil size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="btn-delete team-action-button"
            onClick={() => handleDelete(ticket)}
            aria-label={`Eliminar tipo de entrada ${ticket.sku}`}
            title="Eliminar"
          >
            <Trash2 size={16} aria-hidden="true" />
          </button>
        </div>
      )
    }
  ];

  const activeCount = ticketTypes.filter(
    (ticket) => !ticket.deletedAt && ticket.isActive !== false
  ).length;
  const deletedCount = ticketTypes.filter((ticket) => ticket.deletedAt).length;

  return (
    <section className="page-container piloto-dashboard">
      <header className="page-header">
        <div>
          <p className="piloto-eyebrow">Administración</p>
          <h1>Tipos de entrada</h1>
          <p>Gestiona las entradas, su precio, duración, circuito, carrera y variante.</p>
        </div>
        <button type="button" className="btn-primary" onClick={() => navigate('/ticket-types/nuevo')}>
          + Nuevo tipo de entrada
        </button>
      </header>

      <div className="piloto-dashboard-stats" aria-label="Resumen de tipos de entrada">
        <article className="piloto-stat"><span>Tipos registrados</span><strong>{ticketTypes.length}</strong></article>
        <article className="piloto-stat"><span>Activos</span><strong>{activeCount}</strong></article>
        <article className="piloto-stat"><span>Eliminados</span><strong>{deletedCount}</strong></article>
      </div>

      <h2>Gestión de tipos de entrada</h2>
      <DataTable
        columns={columns}
        rows={ticketTypes}
        rowKey={(ticket) => ticket._id}
        emptyMessage="No hay tipos de entrada registrados."
      />
    </section>
  );
};

export default TicketTypesListPage;
