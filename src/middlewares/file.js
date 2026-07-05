const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'agentPortrait', 
        allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'webp', 'jfif']
    }
});

const upload = multer({ storage });


module.exports = upload;