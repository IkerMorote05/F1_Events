const mongoose = require('mongoose');
const slugify = require('../utils/slug');

const categoriaCircuitosSchema = new mongoose.Schema(
  {
    desgaste: {
      type: String,
      trim: true,
    },
    tipo: {
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

categoriaCircuitosSchema.pre('validate', function (next) {
  if (!this.slug && (this.desgaste || this.tipo)) {
    this.slug = slugify(`${this.desgaste || ''}-${this.tipo || ''}`) || 'categoria-circuitos';
  }
  next();
});

module.exports = mongoose.model('CategoriaCircuitos', categoriaCircuitosSchema);
