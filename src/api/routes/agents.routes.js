const express = require('express');
const upload = require('../../middlewares/file');
const {
	getAgents,
	postAgent,
	updateAgent,
	deleteAgent,
} = require('../controllers/agent.controller');

const agentsRouter = express.Router();

agentsRouter.get('/', getAgents);
agentsRouter.post('/', upload.single('img'), postAgent);
agentsRouter.put('/:id', upload.single('img'), updateAgent);
agentsRouter.delete('/:id', deleteAgent);

module.exports = agentsRouter;
