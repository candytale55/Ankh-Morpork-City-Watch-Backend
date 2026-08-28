// Declares the HTTP routes for registration, login, and user management.

const usersRouter = require('express').Router();
const { requireRole } = require('../../middlewares/requireRole');
const { isAuth } = require('../../middlewares/isAuth');
const { uploadUser } = require('../../middlewares/file');
const { validateObjectId } = require('../../middlewares/validateObjectId');
const {
    register,
    login,
    forgotPassword,
    changePassword,
    resetPassword,
    getUsers,
    getUser,
    getMe,
    deleteUser,
    updateUser,
    updateUserRole
} = require('../controllers/user.controller');


// User registration route with image upload
usersRouter.post(
    '/register',
    uploadUser.single('image'),
    register
);

// User login route
usersRouter.post(
    '/login',
    login
);

// Route to request a password reset via email
usersRouter.post(
    '/forgot-password',
    forgotPassword
);

usersRouter.patch(
    '/reset-password/:token',
    resetPassword);
// Ruta para restablecer la contraseña del usuario mediante un token de restablecimiento de contraseña

usersRouter.get(
    '/me',
    isAuth,
    getMe);
// Ruta para obtener los datos del usuario autenticado - funciona porque isAuth ya pone el usuario en req.user (ver controller)

usersRouter.patch(
    '/me/password',
    isAuth,
    changePassword);
// Ruta para cambiar la contraseña del usuario autenticado





usersRouter.get('/', isAuth, requireRole('admin'), getUsers);
usersRouter.get('/:id', isAuth, requireRole('admin'), validateObjectId('id'), getUser);
usersRouter.put('/:id', isAuth, validateObjectId('id'), uploadUser.single('image'), updateUser);
usersRouter.patch('/:id/role', isAuth, requireRole('admin'), validateObjectId('id'), updateUserRole);
usersRouter.delete('/:id', isAuth, validateObjectId('id'), deleteUser);

module.exports = usersRouter;
