// Handles the agent CRUD endpoints used by the public catalog and admin actions.

const Agent = require("../models/Agent");
const { deleteFile } = require("../../utils/deleteFile");


/**
 * Escapes user input before embedding it in a regular expression.
 */
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Deletes the file uploaded in the current request when an operation fails.
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



/**
 * Returns every agent stored in the database.
 */
const getAgents = async (req, res) => {
    try {
        console.log(`[AGENTS_DEBUG_CTRL] getAgents hit | ${req.method} ${req.originalUrl}`);
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
        const normalizedName = req.body?.name?.trim();
        if (!normalizedName) {
            await rollbackUploadedImage(req.file);
            return res.status(400).json({ message: "Agent name is required" });
        }

        const duplicatedAgent = await Agent.findOne({
            name: { $regex: `^${escapeRegExp(normalizedName)}$`, $options: 'i' }
        });

        if (duplicatedAgent) {
            await rollbackUploadedImage(req.file);
            return res.status(409).json({ message: `Agent \"${normalizedName}\" already exists` });
        }

        const newAgent = new Agent(req.body);
        newAgent.name = normalizedName;

        if (req.file) {
            newAgent.image = req.file.path; // Save the file path to the image field
        }

        const savedAgent = await newAgent.save();
        return res.status(201).json(savedAgent);
    } catch (error) {
        await rollbackUploadedImage(req.file);
        return res.status(400).json({ message: "Error in posting Agent", error: error.message })
    }
}

/**
 * Updates an existing agent by id.
 */
const updateAgent = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Buscar el agente actual
        const currentAgent = await Agent.findById(id);
        if (!currentAgent) {
            await rollbackUploadedImage(req.file);
            return res.status(404).json("Agent not found");
        }

        // 2. Crear un objeto con los nuevos datos del agente
        const updateData = { ...req.body };

        if (updateData.name) {
            updateData.name = updateData.name.trim();

            if (!updateData.name) {
                await rollbackUploadedImage(req.file);
                return res.status(400).json({ message: "Agent name is required" });
            }

            const duplicatedAgent = await Agent.findOne({
                _id: { $ne: id },
                name: { $regex: `^${escapeRegExp(updateData.name)}$`, $options: 'i' }
            });

            if (duplicatedAgent) {
                await rollbackUploadedImage(req.file);
                return res.status(409).json({ message: `Agent \"${updateData.name}\" already exists` });
            }
        }

        // 3. Añadir la nueva imagen si Multer recibió un archivo
        if (req.file) {
            updateData.image = req.file.path; // Guardar la nueva ruta de la imagen
        }

        // 4. Actualizar el agente en la base de datos.
        const updatedAgent = await Agent.findByIdAndUpdate(
            id,
            updateData,
            {
                new: true,
                runValidators: true
            }
        );

        // 5. Eliminar la imagen anterior solo después de una actualización exitosa.
        if (req.file && currentAgent.image && currentAgent.image !== updatedAgent.image) {
            try {
                await deleteFile(currentAgent.image);
            } catch (deleteError) {
                console.error("Old agent image could not be deleted", deleteError.message);
            }
        }

        return res.status(200).json({
            message: "Agent updated successfully",
            agent: updatedAgent
        });

    } catch (error) {
        // If validation fails after upload, remove the new image to avoid orphan files.
        await rollbackUploadedImage(req.file);
        return res.status(400).json({
            message: "Error in updating Agent",
            error: error.message
        });
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
