// Declares the HTTP routes for case CRUD and assignment operations.

const express = require('express');
const { isAuth } = require('../../middlewares/isAuth');
const { requireRole } = require('../../middlewares/requireRole');

const {
    getCases,
    getCase,
    postCase,
    updateCase,
    deleteCase,
    assignCaseToUser,
    assignCaseToAgent
} = require('../controllers/case.controller');

const casesRouter = express.Router();

casesRouter.get('/', isAuth, getCases);
casesRouter.get('/:id', isAuth, getCase);
casesRouter.post('/', isAuth, postCase);
casesRouter.patch('/:id', isAuth, updateCase);
casesRouter.delete('/:id', isAuth, requireRole('admin'), deleteCase);
casesRouter.put(
    '/:caseId/assign/:userId',
    isAuth,
    requireRole('admin'),
    assignCaseToUser
);

casesRouter.put(
    '/:caseId/assign-agent/:agentId',
    isAuth,
    requireRole('admin'),
    assignCaseToAgent
);


module.exports = casesRouter;


