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

variantSchema.pre('validate', function (next) {
  if (!this.slug && this.sku) {
    this.slug = slugify(this.sku) || 'variant';
  }
  next();
});

module.exports = mongoose.model('Variant', variantSchema);
