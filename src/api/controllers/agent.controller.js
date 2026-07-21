// Handles the agent CRUD endpoints used by the public catalog and admin actions.

const Agent = require("../models/Agent");
const { deleteFile } = require("../../utils/deleteFile");


/**
 * Escapes user input before embedding it in a regular expression.
 */
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');



/**
 * Returns every agent stored in the database.
 */
const getAgents = async (req, res) => {
    try {
        const agents = await Agent.find();
        return res.status(200).json(agents);

    } catch (error) {
        console.error("Error in getting Agents", error);
        return res.status(400).json({ message: "Error in getting Agents", error: error.message });
    }
};

/**
 * Finds agents whose name matches the query string, ignoring case.
 */
const getAgentByName = async (req, res) => {
    try {
        const { name } = req.query;

        if (!name || name.trim() === "") {
            return res.status(400).json({ message: "Agent name is required" });
        }

        const normalizedName = name.trim();
        const agents = await Agent.find({
            name: { $regex: escapeRegExp(normalizedName), $options: 'i' }
        });

        if (!agents.length) {
            return res.status(404).json({ message: `No agents found matching "${normalizedName}"` });
        }

        return res.status(200).json({
            message: `Found ${agents.length} agent(s) matching "${normalizedName}"`,
            agents
        });
    } catch (error) {
        console.error("Error in searching Agent by name", error);
        return res.status(400).json({ message: "Error in searching Agent by name", error: error.message });
    }
};

/**
 * Creates a new agent and stores its uploaded image path when present.
 */
const postAgent = async (req, res) => {
    try {
        const newAgent = new Agent(req.body);

        if (req.file) {
            newAgent.image = req.file.path; // Save the file path to the image field
        }

        const savedAgent = await newAgent.save();
        return res.status(201).json(savedAgent);
    } catch (error) {
        return res.status(400).json("Error in posting Agent")
    }
}

/**
 * Updates an existing agent by id.
 */
const updateAgent = async (req, res) => {
    try {
        const { id } = req.params;
        const newAgent = new Agent(req.body);
        newAgent._id = id;
        const updatedAgent = await Agent.findByIdAndUpdate(
            id,
            newAgent,
            { new: true }
        );
        return res.status(200).json(updatedAgent);
    } catch (error) {
        return res.status(400).json("Error in updating Agent")
    }
}

/**
 * Deletes an agent and removes its Cloudinary image when one exists.
 */
const deleteAgent = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedAgent = await Agent.findById(id);

        if (!deletedAgent) {
            return res.status(404).json("Agent not found");
        }

        await deleteFile(deletedAgent.image);
        await deletedAgent.deleteOne();

        return res.status(200).json({
            message: "Agent deleted successfully", element: deletedAgent
        });

    } catch (error) {
        console.error("Error deleting agent", error);
        return res.status(400).json("Error in deleting Agent")
    }
}

module.exports = {
    getAgents,
    getAgentByName,
    postAgent,
    updateAgent,
    deleteAgent
};
