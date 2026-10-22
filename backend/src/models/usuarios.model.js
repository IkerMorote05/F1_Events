const mongoose = require('mongoose');

const usuarioSchema = new mongoolse.Schema(
    {
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
            required:[true, "Contraseña obligatoria"],
        },
        avatar:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Images",
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