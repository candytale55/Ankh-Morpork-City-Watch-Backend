const Case = require('../models/Case');

const getCases = async (req, res) => {
    try {
        const cases = await Case.find();
        return res.status(200).json(cases);
    } catch (error) {
        return res.status(400).json({ message: 'Error getting cases', error: error.message });
    }
}

const postCase = async (req, res) => {
    try {
        const newCase = new Case(req.body);
        const savedCase = await newCase.save();
        return res.status(201).json(savedCase);
    } catch (error) {
        return res.status(400).json({ message: 'Error posting case', error: error.message });

    }
}

const updateCase = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedCase = await Case.findByIdAndUpdate(
            id,
            req.body,
            { new: true });

        if (!updatedCase) {
            return res.status(404).json({ message: 'Case not found' });
        }

        return res.status(200).json(updatedCase);
    } catch (error) {
        return res.status(400).json({ message: 'Error updating case', error: error.message });
    }
}

const deleteCase = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedCase = await Case.findByIdAndDelete(id);

        if (!deletedCase) {
            return res.status(404).json({ message: 'Case not found' });
        }

        return res.status(200).json({
            message: 'Case deleted successfully',
            element: deletedCase
        });
    } catch (error) {
        return res.status(400).json({ message: 'Error deleting case', error: error.message });
    }
}

module.exports = {
    getCases,
    postCase,
    updateCase,
    deleteCase
};