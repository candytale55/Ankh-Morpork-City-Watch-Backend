require('dotenv').config();
const mongoose = require('mongoose');
const Character = require('../../api/models/Character');
const characters = require('../../api/data/characters.data');

const launchSeed = async () => {
    try {
        await mongoose.connect(process.env.DB_URL);
        console.log("Connected to the database successfully for seeding");

        await Character.collection.drop(); // Drop the collection to avoid duplicates
        console.log("Characters collection dropped");

        await Character.insertMany(characters);
        console.log("Characters seeded successfully");
        
        await mongoose.connection.close(); // Close the connection after seeding
        //process.exit(0); // Exit the process after seeding
        console.log("Database connection closed after seeding");

    } catch (error) {
        console.error("Error connecting to the database when seeding", error);
    }
};
 
launchSeed();
