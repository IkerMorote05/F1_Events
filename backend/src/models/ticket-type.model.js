const mongoose = require('mongoose');

const estadosTicket = ['Vendida', 'Disponible', 'Reservada', 'Cancelada', 'Reembolsada'];

const ticketTypeSchema = new mongoose.Schema(
  {
    sku: {
      type: String,
      required: [true, 'El SKU es obligatorio'],
      unique: true,
      trim: true,
    },
    circuit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Circuito',
      required: [true, 'El circuito es obligatorio'],
    },
    race: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Carrera',
      required: [true, 'La carrera es obligatoria'],
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
    basePrice: {
      type: Number,
      min: [0, 'El precio base no puede ser negativo'],
      validate: {
        validator: Number.isFinite,
        message: 'El precio base debe ser un número finito',
      },
    },
    duration: {
      type: Number,
      required: [true, 'La duración es obligatoria'],
      min: [1, 'La duración debe ser de al menos 1 día'],
      max: [3, 'La duración no puede superar 3 días'],
      validate: {
        validator: Number.isInteger,
        message: 'La duración debe ser un número entero de días',
      },
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Variant',
      required: [true, 'La variante es obligatoria'],
    },
    estado: {
      type: String,
      enum: estadosTicket,
      default: 'Disponible',
      required: [true, 'El estado del ticket es obligatorio'],
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
    toJSON: { virtuals: true },
  }
);

ticketTypeSchema.index({ category: 1 });

module.exports = mongoose.model('TicketType', ticketTypeSchema);
