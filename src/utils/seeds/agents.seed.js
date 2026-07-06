require('dotenv').config();
const mongoose = require('mongoose');
const Agent = require('../../api/models/Agent');
const agents = require('../../api/data/agents.data');

const launchAgentsSeed = async () => {
    try {
        await mongoose.connect(process.env.DB_URL);
        console.log("Connected to the database successfully for seeding Agents");

        await Agent.collection.drop(); // Drop the collection to avoid duplicates
        console.log("Agents collection dropped");

        await Agent.insertMany(agents);
        console.log("Agents seeded successfully");
        
        await mongoose.connection.close(); // Close the connection after seeding
        //process.exit(0); // Exit the process after seeding
        console.log("Database connection closed after seeding Agents");

    } catch (error) {
        console.error("Error connecting to the database when seeding Agents", error);
    }
};
 
launchAgentsSeed();
