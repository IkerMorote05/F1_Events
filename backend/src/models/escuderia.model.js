const mongoose = require('mongoose');
const slugify = require('../utils/slug');

const escuderiaSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre de la escudería es obligatorio'],
      unique: true,
      trim: true,
    },
    siglas:{
      type:String,
      required:[false],
      trim:false
    },
    pais: {
      type: String,
      required: [true, 'El país es obligatorio'],
      trim: true,
    },
    motor: {
      type: String,
      required: [true, 'El motor es obligatorio'],
      trim: true,
    },
    jefe:{
      type: String,
      require:[true, 'El jefe de equipo es necesario'],
      trim: true,
    },
    año:{
      type: Number,
      require:[true, 'El año de fundacion es necesario'],
      trim: true,
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
  { timestamps: true }
);

escuderiaSchema.pre('validate', function (next) {
  if (!this.slug && this.nombre) {
    this.slug = slugify(this.nombre) || 'escuderia';
  }
  next();
});

module.exports = mongoose.model('Escuderia', escuderiaSchema);