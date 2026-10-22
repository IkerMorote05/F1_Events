const mongoose = require('mongoose');
const slugify = require('../utils/slug');

const rolSchema = new mongoose.Schema(
    {
        slug: {
            type: String,
            trim: true,
            unique: true,
            sparse: true,
        },
        nombre:{
            type:String,
            trim:true,
            unique:true,
            required:[true, "Es necesario el nombre"]
        },
        description:{
            type:String,
            trim:true,
            required:[true]
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
 
rolSchema.pre('validate', function (next) {
   if (!this.slug && this.nombre) {
     this.slug = slugify(this.nombre) || 'rol';
   }
   next();
 });
 module.exports = mongoose.model("Rol", rolSchema)