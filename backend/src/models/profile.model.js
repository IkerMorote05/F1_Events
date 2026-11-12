const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: true,
    },
    nombre: {
      type: String,
      required: [true, 'No se pueden crear perfiles sin nombre'],
      trim: true,
    },
    apellidos: {
      type: String,
      required: [true, 'Los apellidos son obligatorios'],
      trim: true,
    },
    avatar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Image',
      default: null,
    },
    settings: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({}),
    },
  },
  { timestamps: true }
);

profileSchema.index(
  { user: 1 },
  { unique: true, partialFilterExpression: { user: { $type: 'objectId' } } }
);

module.exports = mongoose.model('Profile', profileSchema);
