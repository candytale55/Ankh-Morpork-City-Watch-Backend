const express = require('express');
const {
    getBooks,
    postBook,
    updateBook,
    deleteBook
} = require('../controllers/book.controller');

const booksRouter = express.Router();

booksRouter.get('/', getBooks);
booksRouter.post('/', postBook);
booksRouter.put('/:id', updateBook);
booksRouter.delete('/:id', deleteBook);

module.exports = booksRouter;