const mongoose = require('mongoose');
const slugify = require('../utils/slug');

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
        }
);

usuarioSchema.pre('validate', function (next) {
    if (!this.slug && this.nombre && this.apellidos) {
        this.slug = slugify(`${this.nombre}-${this.apellidos}`) || 'usuario';
    }
    next();
});

module.exports = mongoose.model("Usuario", usuarioSchema);