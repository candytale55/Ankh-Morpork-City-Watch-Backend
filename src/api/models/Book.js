// Defines the MongoDB schema for books that reference related agents.

const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    publishedDate: {
        type: Date,
        required: true
    },
    saga: {
        type: String,
        required: true
    },
    agents: {
        type: [{
            type: mongoose.Types.ObjectId,
            ref: 'Agent'
        }],
    }
}, {
    timestamps: true
});

const Book = mongoose.model('Book', bookSchema, 'books');

module.exports = Book;

