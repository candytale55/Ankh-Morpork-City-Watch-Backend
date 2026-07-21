// Declares the HTTP routes for agent CRUD operations.

const express = require('express');
const fs = require('fs');
const path = require('path');
const { isAuth } = require('../../middlewares/isAuth');
const { requireRole } = require('../../middlewares/requireRole');
const { uploadAgent } = require('../../middlewares/file');
const {
	getAgents,
	getAgentByName,
	postAgent,
	updateAgent,
	deleteAgent,
} = require('../controllers/agent.controller');


const agentsRouter = express.Router();
const agentsDebugLogPath = path.join(__dirname, '../../../docs/agents-debug.log');

// Temporary debug logger for agent routes while diagnosing duplicate creations.
agentsRouter.use((req, res, next) => {
	const params = JSON.stringify(req.params || {});
	const query = JSON.stringify(req.query || {});
	const line = `[AGENTS_DEBUG] ${new Date().toISOString()} | ${req.method} ${req.originalUrl} | params=${params} | query=${query}`;

	res.set('X-Agents-Debug', `${req.method} ${req.originalUrl}`);
	console.log(line);

	try {
		fs.appendFileSync(agentsDebugLogPath, `${line}\n`, 'utf8');
	} catch (error) {
		console.error('Could not write agents debug log file', error.message);
	}

	next();
});

agentsRouter.get('/', getAgents);
agentsRouter.get('/search', getAgentByName);
agentsRouter.post('/', isAuth, requireRole('admin'), uploadAgent.single('image'), postAgent);
agentsRouter.put('/:id', isAuth, requireRole('admin'), uploadAgent.single('image'), updateAgent);
agentsRouter.delete('/:id', isAuth, requireRole('admin'), deleteAgent);

module.exports = agentsRouter;
