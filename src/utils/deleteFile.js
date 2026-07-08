const cloudinary = require('cloudinary').v2;

const getPublicIdFromUrl = (url) => {
    const uploadMarker = '/upload/';
    const uploadIndex = url.indexOf(uploadMarker);

    if (uploadIndex === -1) {
        throw new Error(`Invalid Cloudinary URL: ${url}`);
    }

    let pathAfterUpload = url.slice(uploadIndex + uploadMarker.length);

    pathAfterUpload = pathAfterUpload.split('?')[0];
    pathAfterUpload = pathAfterUpload.replace(/^v\d+\//, '');

    return pathAfterUpload.replace(/\.[^/.]+$/, '');
};

const deleteFile = async (url) => {
    if (!url) {
        return;
    }

    const publicId = getPublicIdFromUrl(url);
    const result = await cloudinary.uploader.destroy(publicId);

    console.log('Cloudinary delete URL:', url);
    console.log('Cloudinary delete publicId:', publicId);
    console.log('Cloudinary delete result:', result);

    if (result.result !== 'ok') {
        throw new Error(`Failed to delete file from Cloudinary for ${publicId}: ${result.result}`);
    }
};

module.exports = { deleteFile };
