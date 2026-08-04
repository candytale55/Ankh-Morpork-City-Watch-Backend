// Handles the book CRUD endpoints for the saga catalog.

const Book = require('../models/Book');
const Agent = require('../models/Agent');


/* ----------------------------------------------------------- */
/**
 * Escapes special characters in a string to safely use it in a regular expression.
 * @param {string} value - The string to escape.
 * @returns {string} - The escaped string.
 */
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/* ----------------------------------------------------------- */

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

/* ----------------------------------------------------------- */

/**
 * Creates a new book document.
 */
const postBook = async (req, res) => {
    try {
        const createData = { ...req.body };

        if (typeof createData.title !== 'string') {
            return res.status(400).json({
                message: "Book title must be a string"
            });
        }

        const normalizedTitle = createData.title.trim();
        if (!normalizedTitle) {
            return res.status(400).json("Book title cannot be empty");
        }

        const duplicateBook = await Book.findOne({
            title: {
                $regex: `^${escapeRegExp(normalizedTitle)}$`,
                $options: 'i'
            }
        });

        if (duplicateBook) {
            return res.status(409).json({
                message: `A book titled "${normalizedTitle}" already exists`
            });
        }

        createData.title = normalizedTitle;

        const newBook = new Book(createData);
        const savedBook = await newBook.save();
        const populatedBook = await Book.findById(savedBook._id).populate('agents', 'name title image');
        return res.status(201).json(populatedBook);
    } catch (error) {
        return res.status(400).json("Error in creating Book");
    }
};


/* ----------------------------------------------------------- */
/**
 * Updates a book by id. Only admins can do this.
 */
const updateBook = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if the book exists before attempting to update
        const currentBook = await Book.findById(id);
        if (!currentBook) {
            return res.status(404).json("Book not found");
        }

        const updateData = { ...req.body };

        // Check if the title is being updated and validate it
        const titleWasProvided = Object.prototype.hasOwnProperty.call(
            updateData,
            'title'
        );

        // If the title is provided, validate it and check for duplicates
        if (titleWasProvided) {
            if (typeof updateData.title !== 'string') {
                return res.status(400).json({
                    message: "Book title must be a string"
                });
            }

            // Normalize the title to trim and ensure case-insensitive comparison
            const normalizedTitle = updateData.title.trim();

            if (!normalizedTitle) {
                return res.status(400).json("Book title cannot be empty");
            }

            // Check for duplicate title (case-insensitive) excluding the current book
            const duplicateBook = await Book.findOne({
                _id: { $ne: id },
                title: {
                    $regex: `^${escapeRegExp(normalizedTitle)}$`,
                    $options: 'i'
                }
            });

            if (duplicateBook) {
                return res.status(409).json({
                    message: `A book titled "${normalizedTitle}" already exists`
                });

            }

            updateData.title = normalizedTitle;
        }

        /** Proceed with the update if all validations pass
         *  new: true option returns the updated document, and runValidators 
         *  ensures that the update adheres to the schema's validation rules.
         */
        const updatedBook = await Book.findByIdAndUpdate(
            id,
            updateData,
            {
                new: true,
                runValidators: true
            }
        ).populate('agents', 'name title image');

        // If the book was not found during the update, return a 404 error
        if (!updatedBook) {
            return res.status(404).json("Book not found");
        }

        return res.status(200).json(updatedBook);

    } catch (error) {

        return res.status(400).json({
            message: "Error updating Book",
            error: error.message
        });
    }
};

/* ----------------------------------------------------------- */

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


/* ----------------------------------------------------------- */
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


/* ----------------------------------------------------------- */
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

/* ----------------------------------------------------------- */

module.exports = {
    getBooks,
    postBook,
    updateBook,
    deleteBook,
    addAgentToBook,
    removeAgentFromBook
};
