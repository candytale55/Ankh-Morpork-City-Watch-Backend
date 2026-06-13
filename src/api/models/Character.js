const mongoose = require("mongoose");

// TODO: Enumeración de especies válidas - Move later to a separate file
const speciesEnum = [
    'human',
    'dwarf',
    'troll',
    'vampire',
    'werewolf',
    'zombie',
    'golem',
    'gnome',
    'goblin',
    'elf',
    'gargoyle',
    'pictsie',
    'igor',
    'orangutan',
    'other',
];


const characterSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    organization: { type: String, required: true, trim: true },
    gender: { type: String, required: true, enum: ['male', 'female', 'non-binary', 'unknown'] },
    species: { type: String, required: true, enum: speciesEnum },
}, { timestamps: true });

const Character = mongoose.model('character', characterSchema, 'characters');

module.exports = Character;