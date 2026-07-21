// Configures the Cloudinary SDK with environment credentials for file uploads.

require('dotenv').config();
const cloudinary = require('cloudinary').v2;


/**
 * Sets the Cloudinary runtime configuration.
 */
const connectCloudinary = () => {
    try {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });
        console.log("Conectado con éxito a Cloudinary");

    } catch (error) {
        console.log("No se puede conectar a Cloudinary", error.message);
    }
}

module.exports = { connectCloudinary };


