const usersRouter = require('express').Router();
const { register, login, getUsers, getUser, deleteUser } = require('../controllers/user.controller');

usersRouter.post('/register', register);
usersRouter.post('/login', login);
usersRouter.get('/', getUsers);
usersRouter.get('/:id', getUser);
usersRouter.delete('/:id', deleteUser);

module.exports = usersRouter;
