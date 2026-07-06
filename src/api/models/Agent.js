const mongoose = require("mongoose");
const { speciesEnum, genderEnum } = require("../../utils/enums");

const agentSchema = new mongoose.Schema({
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
        enum: genderEnum
    },
    species: {
        type: String,
        required: true,
        enum: speciesEnum
    },
    image: {
        type: String,
        required: true
    }
}, { timestamps: true });

const Agent = mongoose.model('Agent', agentSchema, 'agents');

module.exports = Agent;
