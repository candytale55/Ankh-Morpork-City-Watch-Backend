require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const { connectDB } = require('./src/config/db');

const app = express();

connectDB(); // Connect to the database

// Middleware to parse JSON requests
app.use(express.json());


// Routes
app.use('/saludar', (req, res) => {
    //res.send('¡Hola! Bienvenido a nuestro servidor Express.');
    return res.status(200).json({ message: '¡Hola! Bienvenido a nuestro servidor Express.' });
});




app.listen(3000, () => {
    console.log('Servidor levantado en http://localhost:3000');
});