const mongoose = require('mongoose');
const slugify = require('../utils/slug');

const categoriaGlobalSchema = new mongoose.Schema(
  {
    competicion: {
      type: String,
      trim: true,
    },
    slug: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      trim: true,
      default: 'active',
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'lastUpdate',
    },
  }
);

categoriaGlobalSchema.pre('validate', function (next) {
  if (!this.slug && this.competicion) {
    this.slug = slugify(this.competicion) || 'categoria-global';
  }
  next();
});

module.exports = mongoose.model('CategoriaGlobal', categoriaGlobalSchema);
