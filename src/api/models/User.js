const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { speciesEnum, genderEnum, roleEnum } = require('../../utils/enums');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    organization: {
        type: String,
        required: true,
        trim: true
    },
    gender: {
        type: String,
        required: true,
        enum: genderEnum
    },
    species: {
        type: String,
        required: true,
        enum: speciesEnum
    },
    img: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true, 
        enum: roleEnum,
        default: 'user'
    }
}, { timestamps: true });


userSchema.pre('save', function () {
    this.password = bcrypt.hashSync(this.password, 10);

});

const User = mongoose.model('User', userSchema, 'users');

module.exports = User;