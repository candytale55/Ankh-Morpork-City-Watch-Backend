const usersRouter = require('express').Router();
const { requireRole } = require('../../middlewares/requireRole');
const { uploadUser } = require('../../middlewares/file');
const { register, login, getUsers, getUser, deleteUser, updateUser } = require('../controllers/user.controller');
const { isAuth } = require('../../middlewares/isAuth');

usersRouter.post('/register', uploadUser.single('image'), register);
usersRouter.post('/login', login);
usersRouter.get('/', isAuth, getUsers);
usersRouter.get('/:id', isAuth, getUser);
usersRouter.put('/:id', isAuth, uploadUser.single('image'), updateUser);
usersRouter.delete('/:id', isAuth, deleteUser); // Un usuario puede eliminar su propia cuenta, pero no la de otros usuarios. La lógica para verificar que es el mismo usuario se implementará en el controlador.

module.exports = usersRouter;
