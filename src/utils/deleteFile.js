const cloudinary = require('cloudinary').v2;

const deleteFile = async (url) => {
    if (!url) {
        return;
    }

    /* https://res.cloudinary.com/zaeweyxf/image/upload/v1783263507/agent_portrait/dhbbcuz2oa0xskzujwvx.jpg */

    const array = url.split('/');
    const cloudinaryFolder = array.at(-2);

    const publicId = `${cloudinaryFolder}/${array.at(-1).split('.')[0]}`;

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result !== 'ok' && result.result !== 'not found') {
        throw new Error(`Cloudinary deletion failed for ${publicId}`);
    }

    console.log(`File deleted successfully from Cloudinary: ${publicId}`);
}

module.exports = { deleteFile };