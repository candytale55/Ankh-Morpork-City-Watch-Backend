const mongoose = require("mongoose");
const { speciesEnum } = require("../../utils/enums");

const characterSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
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
        enum: ['male', 'female', 'non-binary', 'unknown']
    },
    species: {
        type: String,
        required: true,
        enum: speciesEnum
    },
    img: {
        type: String,
        required: true
    }
}, { timestamps: true });

const Character = mongoose.model('Character', characterSchema, 'characters');

module.exports = Character;
