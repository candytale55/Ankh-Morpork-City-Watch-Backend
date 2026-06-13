const express = require('express');
const app = express();

// Middleware to parse JSON requests
app.use(express.json());

app.use('/saludar', (req, res) => {
    res.send('¡Hola! Bienvenido a nuestro servidor Express.');
});

app.listen(3000, () => {
    console.log('Servidor levantado en http://localhost:3000');
});