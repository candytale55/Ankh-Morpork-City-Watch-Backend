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
    characters: {
        type: [{type: mongoose.Types.ObjectId, ref: 'Character'}],
    }
}, {
    timestamps: true
});

const Books = moongoose.model('books', bookSchema, 'books');

module.exports = Books;

