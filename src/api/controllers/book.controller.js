// Handles the book CRUD endpoints for the saga catalog.

const Book = require('../models/Book');
const Agent = require('../models/Agent');

/**
 * Returns every book stored in the database.
 */
const getBooks = async (req, res) => {
    try {
        const books = await Book.find().populate('agents', 'name title image');
        return res.status(200).json(books);
    } catch (error) {
        return res.status(400).json("Error in getting Books")
    }
};

/**
 * Creates a new book document.
 */
const postBook = async (req, res) => {
    try {
        const newBook = new Book(req.body);
        const savedBook = await newBook.save();
        const populatedBook = await Book.findById(savedBook._id).populate('agents', 'name title image');
        return res.status(201).json(populatedBook);
    } catch (error) {
        return res.status(400).json("Error in creating Book");
    }
};

/**
 * Updates a book by id and returns the updated document.
 */
const updateBook = async (req, res) => {
    try {
        const { id } = req.params;

        const updatedBook = await Book.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        ).populate('agents', 'name title image');

        if (!updatedBook) {
            return res.status(404).json("Book not found");
        }

        return res.status(200).json(updatedBook);

    } catch (error) {

        return res.status(400).json("Error in updating Book");
    }
};

/**
 * Adds an agent to a book. Any authenticated user can do this.
 */
const addAgentToBook = async (req, res) => {
    try {
        const { bookId, agentId } = req.params;

        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json("Book not found");
        }

        const agent = await Agent.findById(agentId);
        if (!agent) {
            return res.status(404).json("Agent not found");
        }

        const updatedBook = await Book.findByIdAndUpdate(
            bookId,
            { $addToSet: { agents: agentId } },
            { new: true, runValidators: true }
        ).populate('agents', 'name title image');

        return res.status(200).json({
            message: 'Agent added to book successfully',
            book: updatedBook
        });
    } catch (error) {
        return res.status(400).json("Error in adding Agent to Book");
    }
};

/**
 * Removes an agent from a book. Only admins can do this.
 */
const removeAgentFromBook = async (req, res) => {
    try {
        const { bookId, agentId } = req.params;

        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json("Book not found");
        }

        const agent = await Agent.findById(agentId);
        if (!agent) {
            return res.status(404).json("Agent not found");
        }

        const updatedBook = await Book.findByIdAndUpdate(
            bookId,
            { $pull: { agents: agentId } },
            { new: true, runValidators: true }
        ).populate('agents', 'name title image');

        return res.status(200).json({
            message: 'Agent removed from book successfully',
            book: updatedBook
        });
    } catch (error) {
        return res.status(400).json("Error in removing Agent from Book");
    }
};

/**
 * Deletes a book by id.
 */
const deleteBook = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedBook = await Book.findByIdAndDelete(id);
        return res.status(200).json({ message: "Book deleted successfully", element: deletedBook });
    } catch (error) {
        return res.status(400).json("Error in deleting Book");
    }
};

module.exports = {
    getBooks,
    postBook,
    updateBook,
    deleteBook,
    addAgentToBook,
    removeAgentFromBook
};
