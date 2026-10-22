const mongoose = require('mongoose');
const imageRepository = require('../repositories/image.repository');
const AppError = require('../utils/appError');
const { findByIdentifier, uniqueSlug } = require('./crud.helpers');

const entityModels = {
  Piloto: require('../models/piloto.model'),
  Escuderia: require('../models/escuderia.model'),
  Circuito: require('../models/circuito.model'),
  Carrera: require('../models/carrera.model'),
  Usuario: require('../models/usuarios.model'),
  Rol: require('../models/roles.model'),
  Location: require('../models/location.model'),
  Variant: require('../models/variant.model'),
};

const imageSlugSource = (image) =>
  `${image.entity_type}-${image.entity_id}-${image.position ?? 0}`;

class ImageService {
  obtenerTodas(includeDeleted = false) {
    return imageRepository.findAll(includeDeleted);
  }

  obtenerPorIdentificador(identifier) {
    return findByIdentifier(imageRepository, identifier, 'Imagen');
  }

  obtenerPorEntidad(entityType, entityId, includeDeleted = false) {
    return imageRepository.findByEntity(entityType, entityId, includeDeleted);
  }

  async validarEntidad(entityType, entityId) {
    const Model = entityModels[entityType];
    if (!Model || !mongoose.Types.ObjectId.isValid(entityId)) {
      throw new AppError('La entidad relacionada no es válida', 400);
    }
    const entity = await Model.findOne({ _id: entityId, deletedAt: null });
    if (!entity) throw new AppError('La entidad relacionada no existe', 400);
  }

  async crearImage(payload) {
    await this.validarEntidad(payload.entity_type, payload.entity_id);
    const data = { ...payload };
    delete data.slug;
    delete data.deletedAt;
    data.slug = await uniqueSlug(imageRepository, imageSlugSource(data), null, 'image');
    return imageRepository.create(data);
  }

  async actualizarImage(id, payload) {
    const current = await this.obtenerPorIdentificador(id);
    const data = { ...payload };
    delete data.slug;
    delete data.deletedAt;
    const entityType = data.entity_type || current.entity_type;
    const entityId = data.entity_id || current.entity_id?._id || current.entity_id;
    if (data.entity_type || data.entity_id) {
      await this.validarEntidad(entityType, entityId);
    }
    if (data.entity_type || data.entity_id || data.position !== undefined) {
      data.slug = await uniqueSlug(
        imageRepository,
        imageSlugSource({
          entity_type: entityType,
          entity_id: entityId,
          position: data.position ?? current.position,
        }),
        current._id.toString(),
        'image'
      );
    }
    const updated = await imageRepository.update(current._id, data);
    if (!updated) throw new AppError('Imagen no encontrada', 404);
    return updated;
  }

  async eliminarImage(id) {
    const image = await imageRepository.findById(id);
    if (!image) throw new AppError('Imagen no encontrada', 404);
    const users = await imageRepository.findByUsuarioAvatar(image._id);
    if (users.length) throw new AppError('No se puede eliminar la imagen porque es avatar de un usuario', 400);
    return imageRepository.softDelete(image._id);
  }
}

module.exports = new ImageService();
