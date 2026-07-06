const Agent = require('../../api/models/Agent');
const agents = require('../../api/data/agents.data');

const launchAgentsSeed = async () => {
    try {
        // TODO: Old code to drop the collection, but can create issues if the collection doesn't exist. Using deleteMany instead to clear the collection. Remove once I tested the new approach and confirmed it works as expected.
        // await Agent.collection.drop();
        // Drop the collection to avoid duplicates
        // console.log("Agents collection dropped");

        await Agent.deleteMany({});
        console.log("Agents collection cleared");

        await Agent.insertMany(agents);
        console.log("Agents seeded successfully");    
    
    } catch (error) {
        console.error("Error connecting to the database when seeding Agents", error);
    }
};
 
module.exports = { launchAgentsSeed };
