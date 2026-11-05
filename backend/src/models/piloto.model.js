const mongoose = require('mongoose');
const slugify = require('../utils/slug');
const Image = require('./image.model');

const pilotoSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre del piloto es obligatorio'],
      trim: true,
    },
    numero: {
      type: Number,
      required: [true, 'El número del piloto es obligatorio'],
      unique: true,
    },
    nacionalidad: {
      type: String,
      required: [true, 'La nacionalidad es obligatoria'],
      trim: true,
    },
    escuderia: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Escuderia',
      required: [true, 'La escudería es obligatoria'],
    },
    puntos: {
      type: Number,
      default: 0,
      min: [0, 'Los puntos no pueden ser negativos'],
    },
    victorias: {
      type: Number,
      default: 0,
      min: [0, 'Las victorias no pueden ser negativas'],
    },
    podios: {
      type: Number,
      default: 0,
      min: [0, 'Los podios no pueden ser negativos'],
    },
    fecha_nacimiento: {
      type: Date,
    },
    categoria:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CategoriaGlobal',
      required: [true, "La categoria es necesaria"],
    },
    slug: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
    },
    status: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

pilotoSchema.virtual('images', {
  ref: Image,
  localField: '_id',
  foreignField: 'entity_id',
  match: { entity_type: 'Piloto', deletedAt: null },
  options: { sort: { position: 1, _id: 1 } },
});

pilotoSchema.pre('validate', function (next) {
  if (!this.slug && this.nombre) {
    this.slug = slugify(this.nombre) || 'piloto';
  }
  next();
});

module.exports = mongoose.model('Piloto', pilotoSchema);