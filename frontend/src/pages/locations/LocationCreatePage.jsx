import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LocationForm } from '../../features/locations/LocationForm';
import { useLocations } from '../../hooks/useLocations';
import { showApiError, showSuccess } from '../../utils/sweetAlert';

export const LocationCreatePage = () => {
  const navigate = useNavigate();
  const { createItem } = useLocations();
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async (payload) => {
    setSubmitting(true);
    try {
      await createItem(payload);
      await showSuccess('Ubicación creada correctamente');
      navigate('/locations');
    } catch (requestError) {
      await showApiError(requestError, 'No se pudo guardar la ubicación');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="page-container piloto-form-page">
      <header>
        <p className="piloto-eyebrow">Administración</p>
        <h1>Nueva ubicación</h1>
      </header>
      <LocationForm
        submitting={submitting}
        onSubmit={handleCreate}
        onCancel={() => navigate('/locations')}
      />
    </section>
  );
};

export default LocationCreatePage;
