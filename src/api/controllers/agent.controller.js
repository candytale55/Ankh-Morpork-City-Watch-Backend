// CRUD - Create, Read, Update, Delete
const Agent = require("../models/Agent");
const { deleteFile } = require("../../utils/deleteFile");



const getAgents = async (req, res) => {
    try {
        const agents = await Agent.find();
        return res.status(200).json(agents);

    } catch (error) {
        return res.status(400).json("Error in getting Agents")
    }
};

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
    postAgent,
    updateAgent,
    deleteAgent
};
