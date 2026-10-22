class CrudRepository {
  constructor(Model, populatePaths = []) {
    this.Model = Model;
    this.populatePaths = populatePaths;
  }

  populate(query) {
    return this.populatePaths.reduce((result, path) => result.populate(path), query);
  }

  async findAll(includeDeleted = false) {
    const filter = includeDeleted ? {} : { deletedAt: null };
    return this.populate(this.Model.find(filter));
  }

  async findById(id, includeDeleted = false) {
    const filter = { _id: id };
    if (!includeDeleted) filter.deletedAt = null;
    return this.populate(this.Model.findOne(filter));
  }

  async findBySlug(slug, includeDeleted = false) {
    const filter = { slug };
    if (!includeDeleted) filter.deletedAt = null;
    return this.populate(this.Model.findOne(filter));
  }

  async create(data) {
    const document = await this.Model.create(data);
    return this.findById(document._id);
  }

  async update(id, data) {
    const query = this.Model.findOneAndUpdate(
      { _id: id, deletedAt: null },
      data,
      { new: true, runValidators: true }
    );
    return this.populate(query);
  }

  async softDelete(id) {
    const query = this.Model.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { deletedAt: new Date() },
      { new: true }
    );
    return this.populate(query);
  }
}

module.exports = CrudRepository;
