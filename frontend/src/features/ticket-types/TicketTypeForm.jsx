import React, { useEffect, useMemo, useState } from 'react';
import { ticketTypeSchema } from './ticketTypeSchema';
import { generateTicketTypeSku } from '../../utils/sku';

const getId = (value) => value?._id || value || '';
const formatPrice = (price) => Number(price).toLocaleString('es-ES', {
  style: 'currency',
  currency: 'EUR'
});

export const TicketTypeForm = ({
  initialData,
  circuitos,
  carreras,
  variants,
  submitting,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    sku: '',
    circuit: '',
    race: '',
    price: '',
    duration: '1',
    category: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setFormData(initialData
      ? {
          sku: initialData.sku || '',
          circuit: getId(initialData.circuit),
          race: getId(initialData.race),
          price: String(initialData.basePrice ?? initialData.price ?? ''),
          duration: String(initialData.duration ?? 1),
          category: getId(initialData.category)
        }
      : {
          sku: '',
          circuit: '',
          race: '',
          price: '',
          duration: '1',
          category: ''
        });
    setErrors({});
  }, [initialData]);

  const carrerasDisponibles = useMemo(() => carreras.filter((carrera) => (
    (
      String(getId(carrera.circuito)) === String(formData.circuit)
      || String(carrera._id) === String(formData.race)
    ) && (!carrera.deletedAt || String(carrera._id) === String(formData.race))
  )), [carreras, formData.circuit, formData.race]);

  const variantesDisponibles = variants.filter((variant) => (
    !variant.deletedAt
      && Boolean(variant.categoriaEntrada?.categoriaEntrada)
      && Boolean(variant.categoriaGrada?.categoriaGrada)
      && variant.percentage !== undefined
      && variant.percentage !== null
      && String(variant.percentage).trim() !== ''
      && Number.isFinite(Number(variant.percentage))
      && Number(variant.percentage) >= 0
      && Number(variant.percentage) <= 100
  ));
  const selectedCircuit = circuitos.find(
    (circuito) => String(circuito._id) === String(formData.circuit)
  );
  const selectedRace = carreras.find(
    (carrera) => String(carrera._id) === String(formData.race)
  );
  const selectedVariant = variantesDisponibles.find(
    (variant) => String(variant._id) === String(formData.category)
  );
  const sku = generateTicketTypeSku(
    selectedRace?.nombre,
    selectedCircuit?.nombre,
    formData.duration,
    selectedVariant?.sku
  );
  const variantExtra = Number(selectedVariant?.price) || 0;
  const basePrice = Number(formData.price);
  const duration = Number(formData.duration);
  const totalPrice = Number.isFinite(basePrice)
    ? basePrice * duration + variantExtra
    : null;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
      ...(name === 'circuit' ? { race: '' } : {})
    }));
    setErrors((current) => ({
      ...current,
      [name]: undefined,
      ...(name === 'circuit' ? { race: undefined } : {}),
      ...(['circuit', 'race', 'duration', 'category'].includes(name) ? { sku: undefined } : {})
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = ticketTypeSchema.safeParse({ ...formData, sku });
    if (!result.success) {
      setErrors(Object.fromEntries(
        result.error.issues.map((issue) => [issue.path[0], issue.message])
      ));
      return;
    }

    setErrors({});
    await onSubmit(result.data);
  };

  const fieldError = (name) => errors[name]
    ? <p className="piloto-field-error" id={`${name}-error`}>{errors[name]}</p>
    : null;
  const fieldProps = (name) => ({
    'aria-invalid': Boolean(errors[name]),
    'aria-describedby': errors[name] ? `${name}-error` : undefined,
    disabled: submitting
  });

  return (
    <form className="piloto-form" onSubmit={handleSubmit} noValidate>
      <label htmlFor="ticket-type-sku">SKU</label>
      <input
        id="ticket-type-sku"
        name="sku"
        value={sku}
        placeholder="Se genera al seleccionar carrera, circuito, duración y variante"
        readOnly
        aria-label="SKU generado automáticamente"
        {...fieldProps('sku')}
      />
      {fieldError('sku')}

      <label htmlFor="ticket-type-circuit">Circuito</label>
      <select
        id="ticket-type-circuit"
        name="circuit"
        value={formData.circuit}
        onChange={handleChange}
        {...fieldProps('circuit')}
      >
        <option value="">Selecciona un circuito</option>
        {circuitos.map((circuito) => (
          <option key={circuito._id} value={circuito._id} disabled={Boolean(circuito.deletedAt)}>
            {circuito.nombre}{circuito.deletedAt ? ' (eliminado)' : ''}
          </option>
        ))}
      </select>
      {fieldError('circuit')}

      <label htmlFor="ticket-type-race">Carrera</label>
      <select
        id="ticket-type-race"
        name="race"
        value={formData.race}
        onChange={handleChange}
        {...fieldProps('race')}
        disabled={submitting || !formData.circuit}
      >
        <option value="">Selecciona una carrera</option>
        {carrerasDisponibles.map((carrera) => (
          <option key={carrera._id} value={carrera._id} disabled={Boolean(carrera.deletedAt)}>
            {carrera.nombre}{carrera.deletedAt ? ' (eliminada)' : ''}
          </option>
        ))}
      </select>
      {fieldError('race')}

      <label htmlFor="ticket-type-price">Precio base por día</label>
      <input
        id="ticket-type-price"
        name="price"
        type="number"
        min="0"
        step="0.01"
        value={formData.price}
        onChange={handleChange}
        {...fieldProps('price')}
      />
      {fieldError('price')}
      {selectedVariant ? (
        <div className="piloto-field-hint" aria-live="polite">
          <p>Extra de la variante: {formatPrice(variantExtra)}</p>
          <p>Base: {formatPrice(Number.isFinite(basePrice) ? basePrice : 0)} × {duration} {duration === 1 ? 'día' : 'días'}</p>
          <p><strong>Precio total: {totalPrice === null ? '—' : formatPrice(totalPrice)}</strong></p>
        </div>
      ) : null}

      <label htmlFor="ticket-type-duration">Duración</label>
      <select
        id="ticket-type-duration"
        name="duration"
        value={formData.duration}
        onChange={handleChange}
        {...fieldProps('duration')}
      >
        <option value="1">1 día</option>
        <option value="2">2 días</option>
        <option value="3">3 días</option>
      </select>
      {fieldError('duration')}

      <label htmlFor="ticket-type-category">Variante</label>
      <select
        id="ticket-type-category"
        name="category"
        value={formData.category}
        onChange={handleChange}
        {...fieldProps('category')}
      >
        <option value="">Selecciona una variante</option>
        {variantesDisponibles.map((variant) => (
          <option key={variant._id} value={variant._id}>
            {variant.sku} (+{formatPrice(variant.price)}){variant.descripcion ? ` - ${variant.descripcion}` : ''}
          </option>
        ))}
      </select>
      {fieldError('category')}
      {variantesDisponibles.length === 0 ? (
        <p className="piloto-field-hint">
          No hay variantes con categorías de entrada y grada y porcentaje configurado. Completa una variante antes de crear entradas.
        </p>
      ) : null}
      {selectedVariant?.descripcion ? (
        <p className="piloto-field-hint" aria-live="polite">
          {selectedVariant.descripcion}
        </p>
      ) : null}

      <div className="modal-actions">
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Guardando...' : 'Guardar'}
        </button>
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={submitting}>
          Cancelar
        </button>
      </div>
    </form>
  );
};
