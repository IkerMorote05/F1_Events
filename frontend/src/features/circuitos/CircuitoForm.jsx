import React, { useEffect, useState } from 'react';
import { circuitoSchema } from './circuitoSchema';
import { getLocations } from '../../services/locationService';

const emptyForm = {
  nombre: '',
  categoria: 'F1',
  tipo: '',
  longitud: '',
  location: '',
  ultimoGanador: '',
  desgaste: '',
  tiempoVueltaRapida: '',
  pilotoVueltaRapida: '',
  anioVueltaRapida: ''
};

export const CircuitoForm = ({ initialData, submitting, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [locations, setLocations] = useState([]);
  const [locationsLoading, setLocationsLoading] = useState(true);
  const [locationsError, setLocationsError] = useState('');

  useEffect(() => {
    let active = true;

    const loadLocations = async () => {
      try {
        const availableLocations = await getLocations();
        if (active) setLocations(availableLocations);
      } catch (error) {
        console.error('Error al cargar las ubicaciones:', error);
        if (active) setLocationsError('No se pudieron cargar las ubicaciones.');
      } finally {
        if (active) setLocationsLoading(false);
      }
    };

    loadLocations();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const vueltaRapida = initialData?.vueltaRapida;
    setFormData(initialData
      ? {
          nombre: initialData.nombre || '',
          categoria: initialData.categoria?.competicion || initialData.categoria || 'F1',
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

  return (
    <form className="piloto-form" onSubmit={handleSubmit} noValidate>
      <label htmlFor="nombre">Nombre</label>
      <input id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} {...fieldProps('nombre')} />
      {fieldError('nombre')}

      <label htmlFor="categoria">Competición</label>
      <input id="categoria" name="categoria" value={formData.categoria} onChange={handleChange}
        {...fieldProps('categoria')} />
      {fieldError('categoria')}

      <label htmlFor="tipo">Tipo de circuito</label>
      <input id="tipo" name="tipo" value={formData.tipo} onChange={handleChange} {...fieldProps('tipo')} />
      {fieldError('tipo')}

      <label htmlFor="longitud">Longitud (km)</label>
      <input id="longitud" name="longitud" type="number" min="0" step="any" value={formData.longitud}
        onChange={handleChange} {...fieldProps('longitud')} />
      {fieldError('longitud')}

      <label htmlFor="location">Ubicación</label>
      <select id="location" name="location" value={formData.location} onChange={handleChange}
        disabled={locationsLoading || Boolean(locationsError)} {...fieldProps('location')}>
        <option value="">{locationsLoading ? 'Cargando ubicaciones...' : 'Selecciona una ubicación'}</option>
        {locations.map((location) => (
          <option key={location._id} value={location._id}>
            {location.ciudad}, {location.pais}
          </option>
        ))}
      </select>
      {locationsError ? <p className="piloto-field-error">{locationsError}</p> : null}
      {fieldError('location')}

      <label htmlFor="ultimoGanador">Último ganador</label>
      <input id="ultimoGanador" name="ultimoGanador" value={formData.ultimoGanador} onChange={handleChange} />

      <label htmlFor="desgaste">Desgaste</label>
      <input id="desgaste" name="desgaste" value={formData.desgaste} onChange={handleChange} />

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
