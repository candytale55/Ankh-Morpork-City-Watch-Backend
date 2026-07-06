const usersRouter = require('express').Router();
const upload = require('../../middlewares/file');
const { register, login, getUsers, getUser, deleteUser } = require('../controllers/user.controller');
const { isAuth } = require('../../middlewares/isAuth');

usersRouter.post('/register', upload.single('img'), register);
usersRouter.post('/login', login);
usersRouter.get('/', isAuth, getUsers);
usersRouter.get('/:id', isAuth, getUser);
usersRouter.delete('/:id', isAuth, deleteUser);

module.exports = usersRouter;
