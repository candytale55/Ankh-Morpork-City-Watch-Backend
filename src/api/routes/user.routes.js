const usersRouter = require('express').Router();
const { uploadUser } = require('../../middlewares/file');
const { register, login, getUsers, getUser, deleteUser, updateUser } = require('../controllers/user.controller');
const { isAuth } = require('../../middlewares/isAuth');

usersRouter.post('/register', uploadUser.single('image'), register);
usersRouter.post('/login', login);
usersRouter.get('/', isAuth, getUsers);
usersRouter.get('/:id', isAuth, getUser);
usersRouter.put('/:id', isAuth, uploadUser.single('image'), updateUser);
usersRouter.delete('/:id', isAuth, deleteUser);

module.exports = usersRouter;
