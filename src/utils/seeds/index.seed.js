// Seeds the database by running the agents and cases seed scripts in order.

require('dotenv').config();
const mongoose = require('mongoose');
const { launchAgentsSeed } = require('./agents.seed');
const { launchCasesSeed } = require('./cases.seed');

/**
 * Connects to MongoDB and executes the seed scripts.
 */
const launchSeeds = async () => {
    try {
        await mongoose.connect(process.env.DB_URL);
        console.log("Connected to the database successfully for seeding");


        await launchAgentsSeed();
        await launchCasesSeed();

        await mongoose.connection.close(); // Close the connection after seeding
        console.log("Database connection closed after seeding all data");
    } catch (error) {
        console.error("Error connecting to the database when seeding", error.message);
    }
};

launchSeeds();