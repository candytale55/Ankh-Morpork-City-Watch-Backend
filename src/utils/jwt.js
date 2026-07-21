// Generates and validates JSON Web Tokens for authentication.

const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');


/**
 * Creates a signed JWT for the provided user id.
 */
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

/**
 * Verifies a JWT and returns its decoded payload.
 */
const verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = { generateToken, verifyToken };