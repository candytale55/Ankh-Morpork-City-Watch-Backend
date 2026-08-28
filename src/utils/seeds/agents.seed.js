// Seeds the agents collection with the canonical watch roster.

const path = require('path');
const cloudinary = require('cloudinary').v2;
const Agent = require('../../api/models/Agent');
const { connectCloudinary } = require('../../config/cloudinary');
const agents = require('../../api/data/agents.data');

const imagesDir = path.join(__dirname, '../../assets/images');

const getLocalImagePath = (agentName) => {
    const normalized = agentName
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .replace(/[^a-zA-Z0-9 ]/g, '')
        .replace(/\s+/g, '_');

    return path.join(imagesDir, `${normalized}.jpg`);
};

/**
 * Uploads the local agent portrait into Cloudinary and returns the stored URL.
 */
const uploadAgentImage = async (agent) => {
    const localFilePath = getLocalImagePath(agent.name);

    const result = await cloudinary.uploader.upload(localFilePath, {
        folder: 'agentPortrait',
        public_id: agent.name
            .normalize('NFD')
            .replace(/\p{Diacritic}/gu, '')
            .replace(/[^a-zA-Z0-9 ]/g, '')
            .replace(/\s+/g, '_'),
        overwrite: true,
        resource_type: 'image'
    });

    return {
        ...agent,
        image: result.secure_url
    };
};

/**
 * Clears and repopulates the agents collection.
 */
const launchAgentsSeed = async () => {
    try {
        connectCloudinary();

        await Agent.deleteMany({});
        console.log("Agents collection cleared");

        const agentsWithCloudinaryImages = await Promise.all(
            agents.map((agent) => uploadAgentImage(agent))
        );

        await Agent.insertMany(agentsWithCloudinaryImages);
        console.log("Agents seeded successfully");

    } catch (error) {
        console.error("Error connecting to the database when seeding Agents", error.message || error);
    }
};

module.exports = { launchAgentsSeed };
