import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PilotoError } from '../../components/PilotoError';
import { PilotoSkeleton } from '../../components/PilotoSkeleton';
import { LocationForm } from '../../features/locations/LocationForm';
import { useLocations } from '../../hooks/useLocations';
import { syncLocationImages } from '../../services/locationService';
import { normalizeApiError } from '../../utils/errorHandler';
import { showApiError, showSuccess } from '../../utils/sweetAlert';

export const LocationEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getById, updateItem } = useLocations();
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const loadLocation = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setLocation(await getById(id));
    } catch (requestError) {
      setError(normalizeApiError(requestError).message);
    } finally {
      setLoading(false);
    }
  }, [getById, id]);

  useEffect(() => {
    loadLocation();
  }, [loadLocation]);

  const handleUpdate = async (payload, images) => {
    setSubmitting(true);
    try {
      await updateItem(id, payload);
      try {
        await syncLocationImages(id, images, location.images || []);
      } catch (imageError) {
        await loadLocation();
        await showApiError(imageError, 'La ubicación se actualizó, pero no se pudieron guardar todas las imágenes');
        return;
      }
      await showSuccess('Ubicación actualizada correctamente');
      navigate('/locations');
    } catch (requestError) {
      await showApiError(requestError, 'No se pudo actualizar la ubicación');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PilotoSkeleton resourceName="ubicaciones" />;
  if (error) return <PilotoError resourceName="ubicaciones" message={error} onRetry={loadLocation} />;
  if (!location) {
    return <PilotoError resourceName="ubicaciones" message="No se encontró la ubicación solicitada." />;
  }
  if (location.deletedAt) {
    return <PilotoError resourceName="ubicaciones" message="No se puede editar una ubicación eliminada." />;
  }

  return (
    <section className="page-container piloto-form-page">
      <header>
        <p className="piloto-eyebrow">Administración</p>
        <h1>Editar ubicación</h1>
      </header>
      <LocationForm
        initialData={location}
        submitting={submitting}
        onSubmit={handleUpdate}
        onCancel={() => navigate('/locations')}
      />
    </section>
  );
};

export default LocationEditPage;
