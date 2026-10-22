const Image = require('../models/image.model');
const CrudRepository = require('./crud.repository');

class ImageRepository extends CrudRepository {
  constructor() {
    super(Image, ['entity_id']);
  }

  async findByEntity(entityType, entityId, includeDeleted = false) {
    const filter = { entity_type: entityType, entity_id: entityId };
    if (!includeDeleted) filter.deletedAt = null;
    return this.populate(Image.find(filter));
  }

  async findByUsuarioAvatar(imageId, includeDeleted = false) {
    const Usuario = require('../models/usuarios.model');
    const filter = { avatar: imageId };
    if (!includeDeleted) filter.deletedAt = null;
    return Usuario.find(filter);
  }
}

module.exports = new ImageRepository();
