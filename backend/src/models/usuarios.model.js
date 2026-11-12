const mongoose = require('mongoose');
const Image = require('./image.model');

const usuarioSchema = new mongoose.Schema(
    {
        slug: {
            type: String,
            trim: true,
            unique: true,
            sparse: true,
        },
        email:{
            type:String,
            required:[true,"Email requerido"],
            unique:true,
            lowercase:true,
            trim:true
        },
        password:{
            type: String,
            select: false,
            required:[true, "Contraseña obligatoria"],
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

usuarioSchema.virtual('profile', {
    ref: 'Profile',
    localField: '_id',
    foreignField: 'user',
    justOne: true,
});

usuarioSchema.virtual('images', {
    ref: Image,
    localField: '_id',
    foreignField: 'entity_id',
    match: { entity_type: 'Usuario', deletedAt: null },
    options: { sort: { position: 1, _id: 1 } },
});

module.exports = mongoose.model("Usuario", usuarioSchema);