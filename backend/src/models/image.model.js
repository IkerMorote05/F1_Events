const mongoose = require('mongoose');
const slugify = require('../utils/slug');

const entityTypes = [
  'Piloto',
  'Escuderia',
  'Circuito',
  'Carrera',
  'Usuario',
  'Rol',
  'Location',
  'Variant',
];

const imageSchema = new mongoose.Schema(
  {
    entity_type: {
      type: String,
      enum: {
        values: entityTypes,
        message: 'El tipo de entidad no es válido',
      },
      required: [true, 'El tipo de entidad es obligatorio'],
      trim: true,
    },
    entity_id: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'entity_type',
      required: [true, 'La entidad relacionada es obligatoria'],
    },
    image_url: {
      type: String,
      required: [true, 'La URL de la imagen es obligatoria'],
      trim: true,
      validate: {
        validator: (value) => {
          try {
            const url = new URL(value);
            return url.protocol === 'http:' || url.protocol === 'https:';
          } catch {
            return false;
          }
        },
        message: 'La URL de la imagen debe ser válida',
      },
    },
    alt_text: {
      type: String,
      trim: true,
      default: '',
    },
    position: {
      type: Number,
      min: [0, 'La posición no puede ser negativa'],
      validate: {
        validator: Number.isInteger,
        message: 'La posición debe ser un número entero',
      },
      default: 0,
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
    toJSON: {
      virtuals: true,
    },
  }
);

imageSchema.index({ entity_type: 1, entity_id: 1, position: 1 });

imageSchema.pre('validate', function (next) {
  if (!this.slug && this.entity_type && this.entity_id) {
    this.slug =
      slugify(`${this.entity_type}-${this.entity_id}-${this.position}-${this._id}`) ||
      'image';
  }
  next();
});

module.exports = mongoose.model('Image', imageSchema);
