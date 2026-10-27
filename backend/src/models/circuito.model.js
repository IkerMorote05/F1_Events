const mongoose = require('mongoose');
const slugify = require('../utils/slug');

const vueltaRapidaSchema = new mongoose.Schema(
  {
    tiempo: {
      type: String,
      trim:true,
    },
    piloto: {
      type: String,
      trim: true,
    },
    anio: {
      type: Date,
    },
  },
  { _id: false }
);

const circuitoSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre del circuito es obligatorio'],
      trim: true,
    },
    categoria: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CategoriaGlobal',
      required: [true, 'La categoría del circuito es obligatoria'],
    },
    tipo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CategoriaCircuitos',
      required: [true, 'El tipo de circuito es obligatorio'],
    },
    slug: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    longitud: {
      type: Number,
      required: [true, 'La longitud del circuito es obligatoria'],
      min: [0, 'La longitud no puede ser negativa'],
    },
    ultimoGanador: {
      type: String,
      trim: true,
    },
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      required: [true, 'La ubicación es obligatoria'],
    },
    vueltaRapida: {
      type: vueltaRapidaSchema,
    },
    desgaste: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CategoriaCircuitos',
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

circuitoSchema.pre('validate', function (next) {
  if (!this.slug && this.nombre) {
    this.slug = slugify(this.nombre) || 'circuito';
  }
  next();
});

module.exports = mongoose.model('Circuito', circuitoSchema);
