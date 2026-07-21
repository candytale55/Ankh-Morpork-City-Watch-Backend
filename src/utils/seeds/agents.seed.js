// Seeds the agents collection with the canonical watch roster.

const Agent = require('../../api/models/Agent');
const agents = require('../../api/data/agents.data');

/**
 * Clears and repopulates the agents collection.
 */
const launchAgentsSeed = async () => {
    try {
        // await Agent.collection.drop();
        // Clear the collection before inserting the static seed data.

        await Agent.deleteMany({});
        console.log("Agents collection cleared");

        await Agent.insertMany(agents);
        console.log("Agents seeded successfully");

    } catch (error) {
        console.error("Error connecting to the database when seeding Agents", error);
    }
};

module.exports = { launchAgentsSeed };
