require('dotenv').config(); 
const express = require('express');
const { connectDB } = require('./src/config/db');

const charactersRouter = require('./src/api/routes/characters.routes');
const booksRouter = require('./src/api/routes/books.routes');

const PORT = process.env.PORT || 3000;
const app = express();

connectDB(); // Connect to the database

// Middleware to parse JSON requests
app.use(express.json());


// Routes
app.use("/api/v1/characters", charactersRouter);
app.use("/api/v1/books", booksRouter);

app.use("/", (req, res) => {
    return res.status(404).json({ message: "Route not found" });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});