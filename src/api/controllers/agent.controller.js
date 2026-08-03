// Handles the agent CRUD endpoints used by the public catalog and admin actions.

const Agent = require("../models/Agent");
const Case = require("../models/Case");
const { deleteFile } = require("../../utils/deleteFile");


/* --------------------------------------------- */

/**
 * Escapes special characters in a string to safely use it in a regular expression.
 * @param {string} value - The string to escape.
 * @returns {string} - The escaped string.
 */
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Rolls back the uploaded image by deleting it from Cloudinary if an error occurs during agent creation or update.
 * @param {Object} file - The uploaded file object containing the path to the image.
 * @returns {Promise<void>} - A promise that resolves when the rollback is complete.
 */
const rollbackUploadedImage = async (file) => {
    if (!file?.path) {
        return;
    }

    try {
        await deleteFile(file.path);
    } catch (cleanupError) {
        console.error("Uploaded agent image could not be rolled back", cleanupError.message);
    }
};

/* --------------------------------------------- */


/**
 * Returns every agent stored in the database.
 */
const getAgents = async (req, res) => {
    try {
        const agents = await Agent.find().lean();
        const cases = await Case.find({ assignedAgents: { $exists: true, $ne: [] } })
            .select('title status priority assignedAgents')
            .lean();

        const casesByAgent = new Map();

        cases.forEach((caseItem) => {
            (caseItem.assignedAgents || []).forEach((agentId) => {
                const key = String(agentId);
                if (!casesByAgent.has(key)) {
                    casesByAgent.set(key, []);
                }

                casesByAgent.get(key).push({
                    _id: caseItem._id,
                    title: caseItem.title,
                    status: caseItem.status,
                    priority: caseItem.priority
                });
            });
        });

        const agentsWithCases = agents.map((agent) => ({
            ...agent,
            assignedCases: casesByAgent.get(String(agent._id)) || []
        }));

        return res.status(200).json(agentsWithCases);

    } catch (error) {
        console.error("Error in getting Agents", error);
        return res.status(400).json({ message: "Error in getting Agents", error: error.message });
    }
};

/* --------------------------------------------- */

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

/* --------------------------------------------- */

/**
 * Creates a new agent and stores its uploaded image path when present.
 */
const postAgent = async (req, res) => {
    try {
        // Normalize the agent name to ensure consistent storage and comparison
        const normalizedName = req.body?.name?.trim();
        if (!normalizedName) {
            await rollbackUploadedImage(req.file);
            return res.status(400).json({ message: "Agent name is required" });
        }
        // Check for duplicate agent names (case-insensitive)
        const duplicatedAgent = await Agent.findOne({
            name: { $regex: `^${escapeRegExp(normalizedName)}$`, $options: 'i' }
        });
        // If a duplicate is found, rollback the uploaded image and return a conflict response
        if (duplicatedAgent) {
            await rollbackUploadedImage(req.file);
            return res.status(409).json({ message: `Agent \"${normalizedName}\" already exists` });
        }

        
        const newAgent = new Agent(req.body);
        newAgent.name = normalizedName;

        if (req.file) {
            newAgent.image = req.file.path; // Save the file path to the image field
        }

        // Save the new agent to the database
        const savedAgent = await newAgent.save();
        return res.status(201).json(savedAgent);

    } catch (error) {
        await rollbackUploadedImage(req.file);
        return res.status(400).json({ message: "Error in posting Agent", error: error.message })
    }
}

/* --------------------------------------------- */

/**
 * Updates an existing agent and manages its Cloudinary image when a new one is uploaded.
 */
const updateAgent = async (req, res) => {
    try {
        const { id } = req.params;

        // Retrieve the current agent to verify its existence
        // and preserve the previous image URL.
        const currentAgent = await Agent.findById(id);

        if (!currentAgent) {
            await rollbackUploadedImage(req.file);

            return res.status(404).json({
                message: "Agent not found"
            });
        }

        const updateData = { ...req.body };

        // Check if the name field is provided in the update data
        const nameWasProvided = Object.prototype.hasOwnProperty.call(
            updateData,
            "name"
        );

        if (nameWasProvided) {
            // Validate that the name is a string and not empty after trimming
            if (typeof updateData.name !== "string") {
                await rollbackUploadedImage(req.file);

                return res.status(400).json({
                    message: "Agent name must be a string"
                });
            }

            // Normalize the name to ensure consistent storage and comparison
            const normalizedName = updateData.name.trim();

            // If the normalized name is empty, rollback the uploaded image 
            if (!normalizedName) {
                await rollbackUploadedImage(req.file);

                return res.status(400).json({
                    message: "Agent name is required"
                });
            }

            // Check for duplicate agent names (case-insensitive) excluding the current agent
            const duplicatedAgent = await Agent.findOne({
                _id: { $ne: id },
                name: {
                    $regex: `^${escapeRegExp(normalizedName)}$`,
                    $options: "i"
                }
            });

            // If a duplicate is found, rollback the uploaded image and return a conflict response
            if (duplicatedAgent) {
                await rollbackUploadedImage(req.file);

                return res.status(409).json({
                    message: `Agent "${normalizedName}" already exists`
                });
            }

            // Update the name in the update data with the normalized name
            updateData.name = normalizedName;
        }

        // Save the new Cloudinary image URL when an image was uploaded.
        if (req.file) {
            updateData.image = req.file.path;
        }

        /**
         * Update the agent, return the updated document, and validate the new values.
         *
         * new: true returns the agent after the update
         * Default = new:false. It would return the agent as it was before the update
         * 
         * runValidators: true checks the updated values against the Agent schema.
         */
        const updatedAgent = await Agent.findByIdAndUpdate(
            id,
            updateData,
            {
                new: true,
                runValidators: true
            }
        );

        // This is unlikely because the agent was found previously,
        // but protects against deletion between both database operations.
        if (!updatedAgent) {
            await rollbackUploadedImage(req.file);

            return res.status(404).json({
                message: "Agent not found"
            });
        }

        // Delete the previous image only after MongoDB was updated successfully.
        if (
            req.file &&
            currentAgent.image &&
            currentAgent.image !== updatedAgent.image
        ) {
            try {
                await deleteFile(currentAgent.image);
            } catch (deleteError) {
                console.error(
                    "Old agent image could not be deleted",
                    deleteError.message
                );
            }
        }

        return res.status(200).json({
            message: "Agent updated successfully",
            agent: updatedAgent
        });

    } catch (error) {
        // Remove the newly uploaded image if the database update failed.
        await rollbackUploadedImage(req.file);

        return res.status(400).json({
            message: "Error in updating Agent",
            error: error.message
        });
    }
};

/* --------------------------------------------- */

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

/* --------------------------------------------- */

module.exports = {
    getAgents,
    getAgentByName,
    postAgent,
    updateAgent,
    deleteAgent
};
