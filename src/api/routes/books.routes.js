// Declares the HTTP routes for book CRUD operations.

const express = require('express');
const { isAuth } = require('../../middlewares/isAuth');
const { requireRole } = require('../../middlewares/requireRole');
const { validateObjectId } = require('../../middlewares/validateObjectId');
const {
    getBooks,
    getBook,
    postBook,
    updateBook,
    deleteBook,
    addAgentToBook,
    removeAgentFromBook
} = require('../controllers/book.controller');

const booksRouter = express.Router();

booksRouter.get('/', getBooks);
booksRouter.get('/:id', validateObjectId('id'), getBook);
booksRouter.post('/', isAuth, requireRole('admin'), postBook);
booksRouter.put('/:id', isAuth, requireRole('admin'), validateObjectId('id'), updateBook);
booksRouter.put('/:bookId/agents/:agentId', isAuth, requireRole('admin'), validateObjectId('bookId', 'agentId'), addAgentToBook);
booksRouter.delete('/:bookId/agents/:agentId', isAuth, requireRole('admin'), validateObjectId('bookId', 'agentId'), removeAgentFromBook);
booksRouter.delete('/:id', isAuth, requireRole('admin'), validateObjectId('id'), deleteBook);

module.exports = booksRouter;