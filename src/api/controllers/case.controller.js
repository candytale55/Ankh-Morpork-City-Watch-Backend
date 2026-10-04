// Handles the case CRUD and assignment workflow for the backend API.

const Case = require('../models/Case');
const Agent = require('../models/Agent');
const User = require('../models/User');

/* ----------------------------------- */

/**
 * Escapes special characters in a string to safely use it in a regular expression. Used primarily for case title validation.
 */
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/* ----------------------------------- */
/* ------- CONSULT ALL CASES --------- */
/* ----------------------------------- */

/**
 * Returns all cases with the assigned users and agents populated.
 */
const getCases = async (req, res) => {
  try {
    const cases = await Case.find()
      .populate('assignedTo', 'name email role image')
      .populate('assignedAgents', 'name title image');
    return res.status(200).json(cases);
  } catch (error) {
    return res.status(400).json({ message: 'Error getting cases', error: error.message });
  }
}

/* ----------------------------------- */
/* --------- CONSULT CASE ------------ */
/* ----------------------------------- */
/**
 * Returns a single case by id with its related documents populated.
 */
const getCase = async (req, res) => {
  try {
    const { id } = req.params;
    const oneCase = await Case.findById(id)
      .populate('assignedTo', 'name email role image')
      .populate('assignedAgents', 'name title image');

    if (!oneCase) {
      return res.status(404).json({ message: 'Case not found' });
    }
    return res.status(200).json(oneCase);

  } catch (error) {
    return res.status(400).json({ message: 'Error getting case', error: error.message });
  }
};

/* ----------------------------------- */
/* ---------- CREATE CASE ------------ */
/* ----------------------------------- */
/**
 * Creates a new case for the authenticated user.
 */
const postCase = async (req, res) => {
  try {

    const createData = { ...req.body };

    // Prevent protected relationships from being set during creation.
    delete createData.assignedTo;
    delete createData.createdBy;

    // Validate title
    if (typeof createData.title !== 'string') {
      return res.status(400).json({
        message: 'Case title must be a string'
      });
    }

    // Normalize title
    const normalizedTitle = createData.title.trim();

    if (!normalizedTitle) {
      return res.status(400).json({
        message: 'Case title cannot be empty'
      });
    }

    // Check for duplicate title (case-insensitive)
    const duplicateCase = await Case.findOne({
      title: {
        $regex: `^${escapeRegExp(normalizedTitle)}$`,
        $options: 'i'
      }
    });

    if (duplicateCase) {
      return res.status(409).json({
        message: `A case titled "${normalizedTitle}" already exists`
      });
    }

    createData.title = normalizedTitle;


    const newCase = new Case({
      ...createData,
      createdBy: req.user._id // Set to the authenticated user's ID
    });

    const savedCase = await newCase.save();

    return res.status(201).json(savedCase);
  } catch (error) {
    return res.status(400).json({ message: 'Error posting case', error: error.message });

  }
}
/* --------------------------------------------- */
/* -------------- UPDATE CASE ------------------ */
/* --------------------------------------------- */
/**
 * Updates a case by id without allowing direct 
 * reassignment of protected fields.
 * 
 * Restricted to the creator of the case or an administrator.
 */
const updateCase = async (req, res) => {
  try {

    const { id } = req.params;

    // Check if the case exists before attempting to update
    const currentCase = await Case.findById(id);

    if (!currentCase) {
      return res.status(404).json({
        message: 'Case not found'
      });
    }

    // Check authorization: only the creator or an admin can update the case
    const isAdmin = req.user.role === 'admin';
    const isOwner = currentCase.createdBy //TODO: Boolean always? right now it could be undefined if case doesn't exists
      && currentCase.createdBy.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        message: 'Forbidden: You do not have permission to update this case'
      });
    }


    // Whitelist: Extract only allowed fields (assignedTo, createdBy and assignedAgents are ignored)

    const allowedFields = [
      'title',
      'description',
      'type',
      'status',
      'priority',
      'location',
      'reportedBy',
      'suspectName',
      'suspectSpecies'
    ];

    /*  //TODO: Remove comment after the update endpoint is finalized
    Only fields listed in allowedFields are copied into updateData, so only those fields can be updated through this endpoint.

    If you add a new field to the model, you add it to allowedFields only if users should be able to edit it through this endpoint. For example, you might allow title but keep createdBy out so a user cannot change who owns the case. */

    const updateData = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    /* ----------------------------------- */

    // Check whether title was included and validate it



    /*  // TODO: Remove this comment after the update endpoint is finalized
    This block validates a new title and checks for duplicates, but it runs only when title was included in updateData.

    1. hasOwnProperty checks whether this update actually includes title.
    2. It rejects values that are not strings or become empty after trim().
    3. Case.findOne(...) looks for another case with the same title. _id: { $ne: id } excludes the case being edited, so keeping its current title is allowed.
    4. ^...$ requires the whole title to match, and $options: 'i' ignores capitalization. escapeRegExp prevents characters in the title from acting as regex instructions.
    5. If a match exists, it returns 409 Conflict. Otherwise, it saves the trimmed title in updateData.

    As written, the duplicate search covers all cases. For example, "My Case" and "my case" count as duplicates even if different users created them.
    */

    if (Object.prototype.hasOwnProperty.call(updateData, 'title')) {
      if (typeof updateData.title !== 'string') {
        return res.status(400).json({
          message: 'Case title must be a string'
        });
      }

      const normalizedTitle = updateData.title.trim();

      if (!normalizedTitle) {
        return res.status(400).json({
          message: 'Case title cannot be empty'
        });
      }


      // Check for duplicate title (case-insensitive) excluding current case

      const duplicateCase = await Case.findOne({
        _id: { $ne: id },
        title: {
          $regex: `^${escapeRegExp(normalizedTitle)}$`,
          $options: 'i'
        }
      });

      if (duplicateCase) {
        return res.status(409).json({
          message: `A case titled "${normalizedTitle}" already exists`
        });
      }

      updateData.title = normalizedTitle;
    }

    /* ----------------------------------- */

    /* //TODO: Remove this when update is complete 
    * This code updates a case and returns the updated case to the frontend.
    * findByIdAndUpdate(id, updateData, ...) finds the case by its ID and applies the allowed changes.
    * new: true makes Mongoose return the case after the update. runValidators: true checks the updated fields against the schema rules.
    * .populate('assignedTo', 'name email role image') replaces the user IDs in assignedTo with user data containing those fields. The second populate does the same for agents, selecting name, title, and image.
    * If no case has that ID, the query returns null, so the API responds with 404. Otherwise it responds with 200 and the updated case as JSON. */

    const updatedCase = await Case.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    )
      .populate('assignedTo', 'name email role image')
      .populate('assignedAgents', 'name title image');

    if (!updatedCase) {
      return res.status(404).json({ message: 'Case not found' });
    }

    return res.status(200).json(updatedCase);

  } catch (error) {
    return res.status(400).json({
      message: 'Error updating case',
      error: error.message
    });
  }
}


/* ----------------------------------- */
/* ---------- DELETE CASE ------------ */
/* ----------------------------------- */
/**
 * Deletes a case and removes its id from every user's assigned cases list.
 */
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

/* ----------------------------------- */
/* ------- ASSIGN CASE TO USER ------- */
/* ----------------------------------- */
/**
 * Assigns a case to a user and keeps both sides of the relationship in sync.
 */
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
      .populate('assignedTo', 'name email role image')
      .populate('assignedAgents', 'name title image');
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

/* ----------------------------------- */
/* ---- REMOVE CASE FROM USER -------- */
/* ----------------------------------- */
/**
 * Removes a user from a case and keeps both sides of the relationship in sync.
 */
const removeCaseFromUser = async (req, res) => {
  try {
    const { caseId, userId } = req.params;

    const caseToUpdate = await Case.findById(caseId);
    if (!caseToUpdate) {
      return res.status(404).json({ message: 'Case not found' });
    }

    const userToUpdate = await User.findById(userId);
    if (!userToUpdate) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updatedCase = await Case.findByIdAndUpdate(
      caseId,
      { $pull: { assignedTo: userId } },
      { new: true }
    )
      .populate('assignedTo', 'name email role image')
      .populate('assignedAgents', 'name title image');

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $pull: { assignedCases: caseId } },
      { new: true }
    );

    return res.status(200).json({
      message: 'Case removed from user successfully',
      case: updatedCase,
      user: updatedUser
    });
  } catch (error) {
    return res.status(400).json({ message: 'Error removing case from user', error: error.message });
  }
}

/* ----------------------------------- */
/* ---- ASSIGN CASE TO AGENT --------- */
/* ----------------------------------- */
/**
 * Assigns a case to an agent and keeps the case document updated.
 */
const assignCaseToAgent = async (req, res) => {
  try {
    const { caseId, agentId } = req.params;

    const caseToAssign = await Case.findById(caseId);
    if (!caseToAssign) {
      return res.status(404).json({ message: 'Case not found' });
    }

    const agentToAssign = await Agent.findById(agentId);
    if (!agentToAssign) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    const updatedCase = await Case.findByIdAndUpdate(
      caseId,
      { $addToSet: { assignedAgents: agentId } },
      { new: true }
    )
      .populate('assignedTo', 'name email role image')
      .populate('assignedAgents', 'name title image');

    return res.status(200).json({
      message: 'Case assigned to agent successfully',
      case: updatedCase
    });
  } catch (error) {
    return res.status(400).json({ message: 'Error assigning case to agent', error: error.message });
  }
}

/* ----------------------------------- */
/* ---- REMOVE CASE FROM AGENT ------- */
/* ----------------------------------- */
/**
 * Removes an agent from a case.
 */
const removeCaseFromAgent = async (req, res) => {
  try {
    const { caseId, agentId } = req.params;

    const caseToUpdate = await Case.findById(caseId);
    if (!caseToUpdate) {
      return res.status(404).json({ message: 'Case not found' });
    }

    const agentToUpdate = await Agent.findById(agentId);
    if (!agentToUpdate) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    const updatedCase = await Case.findByIdAndUpdate(
      caseId,
      { $pull: { assignedAgents: agentId } },
      { new: true }
    )
      .populate('assignedTo', 'name email role image')
      .populate('assignedAgents', 'name title image');

    return res.status(200).json({
      message: 'Case removed from agent successfully',
      case: updatedCase
    });
  } catch (error) {
    return res.status(400).json({ message: 'Error removing case from agent', error: error.message });
  }
}

/* ----------------------------------- */

module.exports = {
  getCases,
  getCase,
  postCase,
  updateCase,
  deleteCase,
  assignCaseToUser,
  removeCaseFromUser,
  assignCaseToAgent,
  removeCaseFromAgent
};