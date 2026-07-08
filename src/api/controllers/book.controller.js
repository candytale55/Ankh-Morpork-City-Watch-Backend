// CRUD - Create, Read, Update, Delete
const Book = require('../models/Book');
const Agent = require('../models/Agent');

const getBooks = async (req, res) => {
    try {
        const books = await Book.find().populate('agents');
        return res.status(200).json(books);
    } catch (error) {

        return res.status(400).json("Error in getting Books")
    }
};

const postBook = async (req, res) => {
    try {
        const newBook = new Book(req.body);
        const savedBook = await newBook.save();
        return res.status(201).json(savedBook);
    } catch (error) {
        return res.status(400).json("Error in creating Book");
    }
};

const updateBook = async (req, res) => {
    try {
        const { id } = req.params;
        
        const updatedBook = await Book.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        ).populate.name('agents'); 
        
        return res.status(200).json(updatedBook);

    } catch (error) {

        return res.status(400).json("Error in updating Book");
    }
};

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
    deleteBook
};
