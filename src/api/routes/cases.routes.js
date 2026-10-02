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
    removeCaseFromUser,
    assignCaseToAgent,
    removeCaseFromAgent
} = require('../controllers/case.controller');

const casesRouter = express.Router();

casesRouter.get('/', isAuth, getCases);
casesRouter.get('/:id', isAuth, getCase);
casesRouter.post('/', isAuth, postCase);

// TODO: Fix the updateCase route to properly check for creator or admin and whitelist allowed fields.
/*  
PATCH /cases/:id (cases.routes.js) solo pasa por isAuth, así que cualquier usuario logueado puede editar cualquier caso, aunque no lo haya creado él. Además, en updateCase quitas assignedTo y createdBy del body pero no assignedAgents, por lo que un usuario normal puede asignar agentes mandándolos en el body y saltarse la ruta assign-agent, que es solo de admin. Lo suyo sería comprobar que es el creador o admin y trabajar con una lista blanca de campos permitidos. */
casesRouter.patch('/:id', isAuth, updateCase);



casesRouter.delete('/:id', isAuth, requireRole('admin'), deleteCase);

casesRouter.put(
    '/:caseId/assign/:userId',
    isAuth,
    requireRole('admin'),
    assignCaseToUser
);

casesRouter.put(
    '/:caseId/unassign/:userId',
    isAuth,
    requireRole('admin'),
    removeCaseFromUser
);

casesRouter.put(
    '/:caseId/assign-agent/:agentId',
    isAuth,
    requireRole('admin'),
    assignCaseToAgent
);

casesRouter.put(
    '/:caseId/unassign-agent/:agentId',
    isAuth,
    requireRole('admin'),
    removeCaseFromAgent
);


module.exports = casesRouter;


