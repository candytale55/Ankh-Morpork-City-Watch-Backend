// Defines the MongoDB schema for users and their assigned cases.

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { roleEnum } = require('../../utils/enums');

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


/**
 * Hashes the password before saving a user document.
 */
userSchema.pre('save', function () {

    if (!this.isModified('password')) return; // Only hash the password if it has been modified or is new

    this.password = bcrypt.hashSync(this.password, 10);

});

const User = mongoose.model('User', userSchema, 'users');

module.exports = User;
