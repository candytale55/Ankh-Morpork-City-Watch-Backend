// Deletes Cloudinary assets using the public id extracted from their stored URL.

const cloudinary = require('cloudinary').v2;

/**
 * Extracts the Cloudinary public id from a stored file URL.
 */
const getPublicIdFromUrl = (url) => {
    const uploadMarker = '/upload/';
    const uploadIndex = url.indexOf(uploadMarker);

    if (uploadIndex === -1) {
        throw new Error(`Invalid Cloudinary URL: ${url}`);
    }

    let pathAfterUpload = url.slice(uploadIndex + uploadMarker.length);

    // Remove query params, the version prefix, and the file extension.
    pathAfterUpload = pathAfterUpload.split('?')[0];
    pathAfterUpload = pathAfterUpload.replace(/^v\d+\//, '');

    return pathAfterUpload.replace(/\.[^/.]+$/, '');
};

/**
 * Deletes a file from Cloudinary when a URL is available.
 */
const deleteFile = async (url) => {
    if (!url) {
        return;
    }

    const publicId = getPublicIdFromUrl(url);
    const result = await cloudinary.uploader.destroy(publicId);

    console.log('Cloudinary delete URL:', url);
    console.log('Cloudinary delete publicId:', publicId);
    console.log('Cloudinary delete result:', result);


    /* // TODO: Remove comment after the implementation is fixed
    si Cloudinary responde algo diferente de 'ok' (por ejemplo, si la imagen ya no existe en el servidor remoto o las credenciales fallan), se lanza una excepción directa */

    if (result.result !== 'ok') {
        throw new Error(`Failed to delete file from Cloudinary for ${publicId}: ${result.result}`);
    }
    /* Este throw provoca que la ejecución saltara al catch de deleteUser, retornando 400 Error in deleting User. Como consecuencia:   Los casos en la base de datos ya habían perdido la referencia al usuario ($pull).   La cuenta de usuario seguía existiendo en MongoDB porque deletedUser.deleteOne() nunca llegó a ejecutarse.   La base de datos quedaba en un estado inconsistente y con datos a medias. */
    /* FIX in user.controller.js: handle the error gracefully without interrupting the main flow */
};

module.exports = { deleteFile };
