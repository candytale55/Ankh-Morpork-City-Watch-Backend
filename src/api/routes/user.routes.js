const usersRouter = require('express').Router();
const { registerUser, loginUser } = require('../controllers/user.controller');

usersRouter.post('/register', registerUser);
usersRouter.post('/login', loginUser);

module.exports = usersRouter;
