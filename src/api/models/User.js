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
    image: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true, 
        enum: roleEnum,
        default: 'user'
    },
    assignedCases: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Case'
    }]
}, { timestamps: true });


userSchema.pre('save', function () {
    this.password = bcrypt.hashSync(this.password, 10);

});

const User = mongoose.model('User', userSchema, 'users');

module.exports = User;
