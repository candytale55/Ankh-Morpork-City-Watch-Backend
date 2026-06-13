const express = require('express');
const {
	getCharacter,
	postCharacter,
	updateCharacter,
	deleteCharacter,
} = require('../controllers/character.controller');

const charactersRouter = express.Router();

charactersRouter.get('/', getCharacter);
charactersRouter.post('/', postCharacter);
charactersRouter.put('/:id', updateCharacter);
charactersRouter.delete('/:id', deleteCharacter);

module.exports = charactersRouter;