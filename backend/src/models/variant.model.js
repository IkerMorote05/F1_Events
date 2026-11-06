const mongoose = require('mongoose');
const slugify = require('../utils/slug');

const variantSchema = new mongoose.Schema(
  {
    sku: {
      type: String,
      required: [true, 'El SKU es obligatorio'],
      unique: true,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'El precio es obligatorio'],
      min: [0, 'El precio no puede ser negativo'],
      validate: {
        validator: Number.isFinite,
        message: 'El precio debe ser un número finito',
      },
    },
    descripcion: {
      type: String,
      trim: true,
      default: '',
    },
    percentage: {
      type: Number,
      required: [true, 'El porcentaje de disponibilidad es obligatorio'],
      min: [0, 'El porcentaje no puede ser menor que 0'],
      max: [100, 'El porcentaje no puede superar 100'],
      validate: {
        validator: Number.isFinite,
        message: 'El porcentaje debe ser un número válido',
      },
    },
    categoriaEntrada: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CategoriaCircuitos',
      required: [true, 'La categoría de entrada es obligatoria'],
    },
    categoriaGrada: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CategoriaCircuitos',
      required: [true, 'La categoría de grada es obligatoria'],
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

variantSchema.index({ categoriaEntrada: 1 });
variantSchema.index({ categoriaGrada: 1 });

variantSchema.pre('validate', function (next) {
  if (!this.slug && this.sku) {
    this.slug = slugify(this.sku) || 'variant';
  }
  next();
});

module.exports = mongoose.model('Variant', variantSchema);
