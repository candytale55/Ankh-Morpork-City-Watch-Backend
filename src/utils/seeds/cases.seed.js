require('dotenv').config();
const mongoose = require('mongoose');
const Case = require('../../api/models/Case');
const cases = require('../../api/data/cases.data');

const launchCasesSeed = async () => {
    try {
        await mongoose.connect(process.env.DB_URL);
        console.log("Connected to the database successfully for seeding Cases");  

        await Case.collection.drop(); // Drop the collection to avoid duplicates
        console.log("Cases collection dropped");

        await Case.insertMany(cases);
        console.log("Cases seeded successfully");
        
        await mongoose.connection.close(); // Close the connection after seeding
        console.log("Database connection closed after seeding Cases");

    } catch (error) {
        console.error("Error connecting to the database when seeding Cases", error);
    }
};
 
launchCasesSeed();
