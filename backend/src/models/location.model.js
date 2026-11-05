const mongoose = require('mongoose');
const slugify = require('../utils/slug');
const Image = require('./image.model');

const locationSchema = new mongoose.Schema(
  {
    pais: {
      type: String,
      required: [true, 'El país es obligatorio'],
      trim: true,
    },
    ciudad: {
      type: String,
      required: [true, 'La ciudad es obligatoria'],
      trim: true,
    },
    capital: {
      type: String,
      required: [true, 'La capital es obligatoria'],
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

locationSchema.virtual('images', {
  ref: Image,
  localField: '_id',
  foreignField: 'entity_id',
  match: { entity_type: 'Location', deletedAt: null },
  options: { sort: { position: 1, _id: 1 } },
});

locationSchema.pre('validate', function (next) {
  if (!this.slug && this.ciudad) {
    this.slug = slugify(`${this.ciudad}-${this.capital}-${this.pais}`) || 'location';
  }
  next();
});

module.exports = mongoose.model('Location', locationSchema);
