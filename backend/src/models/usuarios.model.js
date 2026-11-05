const mongoose = require('mongoose');
const slugify = require('../utils/slug');
const Image = require('./image.model');

const usuarioSchema = new mongoose.Schema(
    {
        slug: {
            type: String,
            trim: true,
            unique: true,
            sparse: true,
        },
        nombre: {
            type: String,
            required:[true, 'No se pueden crear usuarios sin nombre'],
            trim:true,
        },
        apellidos:{
            type:String,
            required:[true, "Es necesario almenos la inicial"],
            trim:true
        },
        email:{
            type:String,
            required:[true,"Email requerido"],
            unique:true,
            trim:true
        },
        password:{
            type: String,
            select: false,
            required:[true, "Contraseña obligatoria"],
        },
        avatar:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Image",
            required:[false]
        },
        roles:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Rol',
            required:[true,'Rol necesario']
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

usuarioSchema.virtual('images', {
    ref: Image,
    localField: '_id',
    foreignField: 'entity_id',
    match: { entity_type: 'Usuario', deletedAt: null },
    options: { sort: { position: 1, _id: 1 } },
});

usuarioSchema.pre('validate', function (next) {
    if (!this.slug && this.nombre && this.apellidos) {
        this.slug = slugify(`${this.nombre}-${this.apellidos}`) || 'usuario';
    }
    next();
});

module.exports = mongoose.model("Usuario", usuarioSchema);