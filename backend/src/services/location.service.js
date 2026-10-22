const locationRepository = require('../repositories/location.repository');
const imageRepository = require('../repositories/image.repository');
const AppError = require('../utils/appError');
const { findByIdentifier, uniqueSlug } = require('./crud.helpers');

const locationSlugSource = (location) =>
  `${location.ciudad}-${location.capital}-${location.pais}`;

class LocationService {
  obtenerTodas(includeDeleted = false) {
    return locationRepository.findAll(includeDeleted);
  }

  obtenerPorIdentificador(identifier) {
    return findByIdentifier(locationRepository, identifier, 'Ubicación');
  }

  async crearLocation(payload) {
    const data = { ...payload };
    delete data.slug;
    delete data.deletedAt;
    data.slug = await uniqueSlug(locationRepository, locationSlugSource(data), null, 'location');
    return locationRepository.create(data);
  }

  async actualizarLocation(id, payload) {
    const current = await this.obtenerPorIdentificador(id);
    const data = { ...payload };
    delete data.slug;
    delete data.deletedAt;
    const source = locationSlugSource({ ...current.toObject(), ...data });
    if (data.ciudad || data.capital || data.pais) {
      data.slug = await uniqueSlug(locationRepository, source, current._id.toString(), 'location');
    }
    const updated = await locationRepository.update(current._id, data);
    if (!updated) throw new AppError('Ubicación no encontrada', 404);
    return updated;
  }

  async eliminarLocation(id) {
    const location = await locationRepository.findById(id);
    if (!location) throw new AppError('Ubicación no encontrada', 404);
    const images = await imageRepository.findByEntity('Location', location._id);
    if (images.length) throw new AppError('No se puede eliminar la ubicación porque tiene imágenes asociadas', 400);
    return locationRepository.softDelete(location._id);
  }
}

module.exports = new LocationService();
