const express = require('express');
const { isAuth } = require('../../middlewares/isAuth');
const { requireRole } = require('../../middlewares/requireRole');

const {
    getCases,
    postCase,
    updateCase,
    deleteCase,
    assignCaseToUser
} = require('../controllers/case.controller');

const casesRouter = express.Router();

casesRouter.get('/', isAuth, getCases);
casesRouter.post('/', isAuth, postCase);
casesRouter.put('/:id', isAuth, updateCase);
casesRouter.delete('/:id', isAuth, requireRole('admin'), deleteCase);
casesRouter.patch(
    '/:caseId/assign/:userId',
    isAuth,
    requireRole('admin'),
    assignCaseToUser
);


module.exports = casesRouter;


