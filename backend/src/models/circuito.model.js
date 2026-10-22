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
    tipo: {
      type: String,
      required: [true, 'El tipo de circuito es obligatorio'],
      trim: true,
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
    pais: {
      type: String,
      required: [true, 'El país es obligatorio'],
      trim: true,
    },
    vueltaRapida: {
      type: vueltaRapidaSchema,
    },
    desgaste: {
      type: String,
      trim: true,
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
