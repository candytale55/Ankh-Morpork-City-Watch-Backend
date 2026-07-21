// Declares the HTTP routes for book CRUD operations.

const express = require('express');
const { isAuth } = require('../../middlewares/isAuth');
const { requireRole } = require('../../middlewares/requireRole');
const {
    getBooks,
    postBook,
    updateBook,
    deleteBook
} = require('../controllers/book.controller');

const booksRouter = express.Router();

booksRouter.get('/', getBooks);
booksRouter.post('/', isAuth, requireRole('admin'), postBook);
booksRouter.put('/:id', isAuth, requireRole('admin'), updateBook);
booksRouter.delete('/:id', isAuth, requireRole('admin'), deleteBook);

module.exports = booksRouter;