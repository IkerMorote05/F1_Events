import React, { useEffect, useState } from 'react';
import { circuitoSchema } from './circuitoSchema';

const emptyForm = {
  nombre: '',
  categoria: '',
  tipo: '',
  longitud: '',
  location: '',
  ultimoGanador: '',
  desgaste: '',
  tiempoVueltaRapida: '',
  pilotoVueltaRapida: '',
  anioVueltaRapida: ''
};

const getReferenceId = (value) => value?._id || value || '';

export const CircuitoForm = ({
  initialData,
  locations,
  categoriasGlobales,
  categoriasCircuitos,
  submitting,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const vueltaRapida = initialData?.vueltaRapida;
    setFormData(initialData
      ? {
          nombre: initialData.nombre || '',
          categoria: getReferenceId(initialData.categoria),
          tipo: initialData.tipo?.tipo || initialData.tipo || '',
          longitud: String(initialData.longitud ?? ''),
          location: initialData.location?._id || initialData.location || '',
          ultimoGanador: initialData.ultimoGanador || '',
          desgaste: initialData.desgaste?.desgaste || initialData.desgaste || '',
          tiempoVueltaRapida: vueltaRapida?.tiempo || '',
          pilotoVueltaRapida: vueltaRapida?.piloto || '',
          anioVueltaRapida: vueltaRapida?.anio
            ? String(new Date(vueltaRapida.anio).getUTCFullYear())
            : ''
        }
      : { ...emptyForm });
    setErrors({});
  }, [initialData]);

  useEffect(() => {
    if (initialData) return;
    setFormData((current) => (
      current.categoria || !categoriasGlobales.length
        ? current
        : { ...current, categoria: categoriasGlobales[0]._id }
    ));
  }, [categoriasGlobales, initialData]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = circuitoSchema.safeParse(formData);

    if (!result.success) {
      const nextErrors = {};
      result.error.issues.forEach((issue) => {
        nextErrors[issue.path[0]] = issue.message;
      });
      setErrors(nextErrors);
      return;
    }

    await onSubmit(result.data);
  };

  const fieldError = (name) => errors[name]
    ? <p className="piloto-field-error" id={`${name}-error`}>{errors[name]}</p>
    : null;
  const fieldProps = (name) => ({
    'aria-invalid': Boolean(errors[name]),
    'aria-describedby': errors[name] ? `${name}-error` : undefined
  });
  const canSubmit = !submitting && categoriasGlobales.length > 0 && locations.length > 0
    && categoriasCircuitos.length > 0;
  const circuitCategoryOptions = (field, currentValue) => {
    const options = [...new Set(categoriasCircuitos
      .map((category) => category[field])
      .filter((value) => typeof value === 'string' && value.trim()))];
    return currentValue && !options.includes(currentValue)
      ? [currentValue, ...options]
      : options;
  };

  return (
    <form className="piloto-form" onSubmit={handleSubmit} noValidate>
      {categoriasGlobales.length === 0
        ? <p className="piloto-field-error">No hay categorías globales disponibles.</p>
        : null}
      {categoriasCircuitos.length === 0
        ? <p className="piloto-field-error">No hay categorías de circuitos disponibles.</p>
        : null}

      <label htmlFor="nombre">Nombre</label>
      <input id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} {...fieldProps('nombre')} />
      {fieldError('nombre')}

      <label htmlFor="categoria">Competición</label>
      <select id="categoria" name="categoria" value={formData.categoria} onChange={handleChange}
        {...fieldProps('categoria')}>
        <option value="">-- Selecciona una competición --</option>
        {categoriasGlobales.map((categoria) => (
          <option key={categoria._id} value={categoria._id}
            disabled={Boolean(categoria.deletedAt && categoria._id !== formData.categoria)}>
            {categoria.competicion}{categoria.deletedAt ? ' (eliminada)' : ''}
          </option>
        ))}
      </select>
      {fieldError('categoria')}

      <label htmlFor="tipo">Tipo de circuito</label>
      <select id="tipo" name="tipo" value={formData.tipo} onChange={handleChange}
        {...fieldProps('tipo')}>
        <option value="">-- Selecciona un tipo de circuito --</option>
        {circuitCategoryOptions('tipo', formData.tipo).map((tipo) => (
          <option key={tipo} value={tipo}>{tipo}</option>
        ))}
      </select>
      {fieldError('tipo')}

      <label htmlFor="longitud">Longitud (km)</label>
      <input id="longitud" name="longitud" type="number" min="0" step="any" value={formData.longitud}
        onChange={handleChange} {...fieldProps('longitud')} />
      {fieldError('longitud')}

      <label htmlFor="location">Ubicación</label>
      <select id="location" name="location" value={formData.location} onChange={handleChange}
        {...fieldProps('location')}>
        <option value="">Selecciona una ubicación</option>
        {locations.map((location) => (
          <option key={location._id} value={location._id}>
            {location.ciudad}, {location.pais}
          </option>
        ))}
      </select>
      {fieldError('location')}
      {locations.length === 0
        ? <p className="piloto-field-error">Registra una ubicación antes de crear un circuito.</p>
        : null}

      <label htmlFor="ultimoGanador">Último ganador</label>
      <input id="ultimoGanador" name="ultimoGanador" value={formData.ultimoGanador} onChange={handleChange} />

      <label htmlFor="desgaste">Desgaste</label>
      <select id="desgaste" name="desgaste" value={formData.desgaste} onChange={handleChange}
        {...fieldProps('desgaste')}>
        <option value="">-- Selecciona un nivel de desgaste --</option>
        {circuitCategoryOptions('desgaste', formData.desgaste).map((desgaste) => (
          <option key={desgaste} value={desgaste}>{desgaste}</option>
        ))}
      </select>

      <fieldset className="circuito-form-fieldset">
        <legend>Vuelta rápida (opcional)</legend>
        <label htmlFor="tiempoVueltaRapida">Tiempo</label>
        <input id="tiempoVueltaRapida" name="tiempoVueltaRapida" value={formData.tiempoVueltaRapida}
          onChange={handleChange} {...fieldProps('tiempoVueltaRapida')} />
        {fieldError('tiempoVueltaRapida')}

        <label htmlFor="pilotoVueltaRapida">Piloto</label>
        <input id="pilotoVueltaRapida" name="pilotoVueltaRapida" value={formData.pilotoVueltaRapida}
          onChange={handleChange} {...fieldProps('pilotoVueltaRapida')} />
        {fieldError('pilotoVueltaRapida')}

        <label htmlFor="anioVueltaRapida">Año</label>
        <input id="anioVueltaRapida" name="anioVueltaRapida" type="number" min="1900" max="9999" step="1"
          value={formData.anioVueltaRapida} onChange={handleChange} {...fieldProps('anioVueltaRapida')} />
        {fieldError('anioVueltaRapida')}
      </fieldset>

      <div className="modal-actions">
        <button type="submit" className="btn-primary" disabled={!canSubmit}>
          {submitting ? 'Guardando...' : 'Guardar'}
        </button>
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={submitting}>
          Cancelar
        </button>
      </div>
    </form>
  );
};
