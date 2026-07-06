const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const agentStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'agentPortrait', 
        allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'webp', 'jfif']
    }
});

const userStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'userPortrait',
        allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'webp', 'jfif']
    }
});

const uploadAgent = multer({ storage: agentStorage });
const uploadUser = multer({ storage: userStorage });

module.exports = { uploadAgent, uploadUser };