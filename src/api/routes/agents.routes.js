const express = require('express');
const { uploadAgent } = require('../../middlewares/file');
const {
	getAgents,
	postAgent,
	updateAgent,
	deleteAgent,
} = require('../controllers/agent.controller');

const agentsRouter = express.Router();

agentsRouter.get('/', getAgents);
agentsRouter.post('/', uploadAgent.single('image'), postAgent);
agentsRouter.put('/:id', uploadAgent.single('image'), updateAgent);
agentsRouter.delete('/:id', deleteAgent);

module.exports = agentsRouter;
