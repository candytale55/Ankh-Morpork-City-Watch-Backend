const Case = require('../models/Case');
const User = require('../models/User');

const getCases = async (req, res) => {
    try {
        const cases = await Case.find()
            .populate('assignedTo', 'name email role')
            .populate('assignedAgents', 'name title');
        return res.status(200).json(cases);
    } catch (error) {
        return res.status(400).json({ message: 'Error getting cases', error: error.message });
    }
}

const getCase = async (req, res) => {
    try {
        const { id } = req.params;
        const oneCase = await Case.findById(id)
            .populate('assignedTo', 'name email role')
            .populate('assignedAgents', 'name title');

        if (!oneCase) {
            return res.status(404).json({ message: 'Case not found' });
        }
        return res.status(200).json(oneCase);

    } catch (error) {
        return res.status(400).json({ message: 'Error getting case', error: error.message });
    }
};


const postCase = async (req, res) => {
    try {
        delete req.body.assignedTo; // Prevent assigning users during case creation
        delete req.body.createdBy; // Prevent setting createdBy during case creation

        const newCase = new Case({
            ...req.body,
            createdBy: req.user._id // Set to the authenticated user's ID
        });
        const savedCase = await newCase.save();
        return res.status(201).json(savedCase);
    } catch (error) {
        return res.status(400).json({ message: 'Error posting case', error: error.message });

    }
}

const updateCase = async (req, res) => {
    try {
        const { id } = req.params;
        delete req.body.assignedTo; // Prevent assigning users during case update
        delete req.body.createdBy; // Prevent setting createdBy during case update
        const updatedCase = await Case.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true });

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

        await User.updateMany(
            { assignedCases: id },
            { $pull: { assignedCases: id } }
        ); // Remove the case from assignedCases array in all users

        return res.status(200).json({
            message: 'Case deleted successfully',
            element: deletedCase
        });
    } catch (error) {
        return res.status(400).json({ message: 'Error deleting case', error: error.message });
    }
}

const assignCaseToUser = async (req, res) => {
    try {
        const { caseId, userId } = req.params;

        const caseToAssign = await Case.findById(caseId);
        if (!caseToAssign) {
            return res.status(404).json({ message: 'Case not found' });
        }
        const userToAssign = await User.findById(userId);
        if (!userToAssign) {
            return res.status(404).json({ message: 'User not found' });
        }
        const updatedCase = await Case.findByIdAndUpdate(
            caseId,
            { $addToSet: { assignedTo: userId } },
            { new: true }
        )
            .populate('assignedTo', 'name email role')
            .populate('assignedAgents', 'name title');
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $addToSet: { assignedCases: caseId } },
            { new: true }
        )
        return res.status(200).json({
            message: 'Case assigned to user successfully',
            case: updatedCase,
            user: updatedUser
        });

    } catch (error) {
        return res.status(400).json({ message: 'Error assigning case to user', error: error.message });
    }
}

module.exports = {
    getCases,
    getCase,
    postCase,
    updateCase,
    deleteCase,
    assignCaseToUser
};