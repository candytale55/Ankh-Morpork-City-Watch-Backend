const Case = require('../../api/models/Case');
const cases = require('../../api/data/cases.data');

// Para buscar el agente(s) y usuario y asignarlo al caso
const User = require('../../api/models/User');
const Agent = require('../../api/models/Agent');



const launchCasesSeed = async () => {
    try {
 
        // TODO: Old code to drop the collection, but can create issues if the collection doesn't exist. Using deleteMany instead to clear the collection. Remove once I tested the new approach and confirmed it works as expected.
        // await Case.collection.drop();
        // Drop the collection to avoid duplicates
        // console.log("Cases collection dropped");


        /* --- Para incluir elementos de las otras colecciones en los casos --- */
        const adminUser = await User.findOne({ email: 'admin@example.com' });
        if (!adminUser) {
            throw new Error('Admin user not found. Create the admin user before seeding cases.');
        }
        const vimes = await Agent.findOne({ name: 'Samuel Vimes' });
        const carrot = await Agent.findOne({ name: 'Carrot Ironfoundersson' });
        const cheery = await Agent.findOne({ name: 'Cheery Littlebottom' });
        const detritus = await Agent.findOne({ name: 'Detritus' });

        const casesWithRelations = cases.map((caseItem) => {
            if (caseItem.title === 'Dragon Sightings in the Shades') {
                return {
                    ...caseItem,
                    createdBy: adminUser._id,
                    assignedAgents: [vimes._id, carrot._id]
                };
            }

            if (caseItem.title === 'Suspicious Deaths at the Dwarf Bread Museum') {
                return {
                    ...caseItem,
                    createdBy: adminUser._id,
                    assignedAgents: [vimes._id, cheery._id]
                };
            }

            if (caseItem.title === 'Riot Prevention: Troll and Dwarf Altercation at Treacle Mine Road') {
                return {
                    ...caseItem,
                    createdBy: adminUser._id,
                    assignedAgents: [detritus._id, carrot._id]
                };
            }

            return {
                ...caseItem,
                createdBy: adminUser._id,
                assignedAgents: []
            };
        });

        /* --- Termina Datos --- */

        await Case.deleteMany({});
        console.log("Cases collection cleared");

        await Case.insertMany(casesWithRelations);
        console.log("Cases seeded successfully");

    } catch (error) {
        console.error("Error connecting to the database when seeding Cases", error);
    }
};
 
module.exports = { launchCasesSeed };
