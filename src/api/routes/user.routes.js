// Declares the HTTP routes for registration, login, and user management.

const usersRouter = require('express').Router();
const { requireRole } = require('../../middlewares/requireRole');
const { isAuth } = require('../../middlewares/isAuth');
const { uploadUser } = require('../../middlewares/file');
const {
    register,
    login,
    getUsers,
    getUser,
    getMe,
    deleteUser,
    updateUser,
    updateUserRole
} = require('../controllers/user.controller');


usersRouter.post('/register', uploadUser.single('image'), register);
usersRouter.post('/login', login);
usersRouter.get('/me', isAuth, getMe); // Ruta para obtener los datos del usuario autenticado - funciona porque isAuth ya pone el usuario en req.user (ver controller)
usersRouter.get('/', isAuth, requireRole('admin'), getUsers);
usersRouter.get('/:id', isAuth, requireRole('admin'), getUser);
usersRouter.put('/:id', isAuth, uploadUser.single('image'), updateUser);
usersRouter.patch('/:id/role', isAuth, requireRole('admin'), updateUserRole);
usersRouter.delete('/:id', isAuth, deleteUser); // Un usuario puede eliminar su propia cuenta, pero no la de otros usuarios. La lógica para verificar que es el mismo usuario se implementará en el controlador.

module.exports = usersRouter;
