// Entry point for the backend API server and static frontend assets.

require('dotenv').config();
const express = require('express');
const path = require('path');
const { connectDB } = require('./src/config/db');
const { connectCloudinary } = require('./src/config/cloudinary');

const upload = require('./src/middlewares/file');

const agentsRouter = require('./src/api/routes/agents.routes');
const booksRouter = require('./src/api/routes/books.routes');
const usersRouter = require('./src/api/routes/user.routes');
const casesRouter = require('./src/api/routes/cases.routes');

const PORT = process.env.PORT || 3000;
const app = express();

// Connect to the database
connectDB();
// Connect to Cloudinary
connectCloudinary();


// Middleware to parse JSON requests
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));


// Routes
app.use("/api/v1/agents", agentsRouter);
app.use("/api/v1/books", booksRouter);
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/cases", casesRouter);

// Returns a 404 response for any route that is not registered above.
app.use("/", (req, res) => {
    return res.status(404).json({ message: "Route not found" });
});

// Starts the HTTP server on the configured port.
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
