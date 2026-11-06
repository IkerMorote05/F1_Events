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
    categoriaEntrada: {
      type: String,
      trim: true,
    },
    categoriaGrada: {
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
  const categoryFields = ['tipo', 'desgaste', 'categoriaEntrada', 'categoriaGrada']
    .filter((field) => this[field]);
  if (categoryFields.length !== 1) {
    this.invalidate(
      'tipo',
      'Debe indicar solo una clase de categoría: tipo, desgaste, categoría de entrada o categoría de grada'
    );
  }
  if (!this.slug && categoryFields.length === 1) {
    const field = categoryFields[0];
    this.slug = slugify(`${field}-${this[field]}`) || 'categoria-circuitos';
  }
  next();
});

module.exports = mongoose.model('CategoriaCircuitos', categoriaCircuitosSchema);
