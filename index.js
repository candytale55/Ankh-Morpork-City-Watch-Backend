const express = require('express');
const app = express();

// Middleware to parse JSON requests
app.use(express.json());

app.listen(3000, () => {
    console.log('http://localhost:3000');
});