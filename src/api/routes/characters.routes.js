const express = require('express');
const upload = require('../../middlewares/file');
const {
	getCharacter,
	postCharacter,
	updateCharacter,
	deleteCharacter,
} = require('../controllers/character.controller');

const charactersRouter = express.Router();

charactersRouter.get('/', getCharacter);
charactersRouter.post('/', upload.single('img'), postCharacter);
charactersRouter.put('/:id', upload.single('img'), updateCharacter);
charactersRouter.delete('/:id', deleteCharacter);

module.exports = charactersRouter;