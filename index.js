require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const { connectDB } = require('./src/config/db');
const charactersRouter = require('./src/api/routes/characters.routes');

const PORT = process.env.PORT;
const app = express();
const router = express.Router();

connectDB(); // Connect to the database

// Middleware to parse JSON requests
app.use(express.json());

app.use("/api/v1/characters", charactersRouter);


// Routes
router.get('/', (req, res) => {
    //res.send('¡Hola! Bienvenido a nuestro servidor Express.');
    return res.status(200).json({ message: '¡Hola! Bienvenido a nuestro servidor Express.' });
});

router.get('/characters', (req, res) => {
    const characters = ["Vimes", "Carrot", "Nanny Ogg", "Granny Weatherwax"];
    res.send(characters);
});


app.use('/', router);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});