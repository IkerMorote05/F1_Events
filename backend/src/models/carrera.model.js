const mongoose = require('mongoose');
const slugify = require('../utils/slug');

const carreraSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    nombre: {
      type: String,
      required: [true, 'El nombre de la carrera es obligatorio'],
      trim: true,
    },
    fecha: {
      type: Date,
      required: [true, 'La fecha de la carrera es obligatoria'],
    },
    capacidad: {
      type: Number,
      required: [true, 'La capacidad de la carrera es obligatoria'],
      min: [0, 'La capacidad no puede ser negativa'],
      validate: {
        validator: Number.isInteger,
        message: 'La capacidad debe ser un número entero',
      },
    },
    circuito: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Circuito',
      required: [true, 'El circuito de la carrera es obligatorio'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      trim: true,
      default: 'active',
    },
  },
  {
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'lastUpdate',
    },
  }
);

carreraSchema.pre('validate', function (next) {
  if (!this.slug && this.nombre) {
    this.slug = slugify(this.nombre) || 'carrera';
  }
  next();
});

module.exports = mongoose.model('Carrera', carreraSchema);
