const express = require('express');
const { isAuth } = require('../../middlewares/isAuth');

const {
    getCases,
    postCase,
    updateCase,
    deleteCase } = require('../controllers/case.controller');

const casesRouter = express.Router();

casesRouter.get('/', isAuth, getCases);
casesRouter.post('/', isAuth, postCase);
casesRouter.put('/:id', isAuth, updateCase);
casesRouter.delete('/:id', isAuth, deleteCase);

module.exports = casesRouter;


