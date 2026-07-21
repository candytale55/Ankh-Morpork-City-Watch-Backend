// Declares the HTTP routes for agent CRUD operations.

const express = require('express');
const { isAuth } = require('../../middlewares/isAuth');
const { requireRole } = require('../../middlewares/requireRole');
const { uploadAgent } = require('../../middlewares/file');
const {
	getAgents,
	postAgent,
	updateAgent,
	deleteAgent,
} = require('../controllers/agent.controller');


const agentsRouter = express.Router();

agentsRouter.get('/', getAgents);
agentsRouter.post('/', isAuth, requireRole('admin'), uploadAgent.single('image'), postAgent);
agentsRouter.put('/:id', isAuth, requireRole('admin'), uploadAgent.single('image'), updateAgent);
agentsRouter.delete('/:id', isAuth, requireRole('admin'), deleteAgent);

module.exports = agentsRouter;
