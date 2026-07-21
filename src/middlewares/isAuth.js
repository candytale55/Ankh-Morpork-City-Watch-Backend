// Verifies bearer tokens and loads the authenticated user into the request.

const { verifyToken } = require('../utils/jwt');
const User = require('../api/models/User');

/**
 * Checks the Authorization header, validates the token, and attaches the user.
 */
const isAuth = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1]; // Obtener el token sin Bearer
        console.log("Token:", token);
        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { id } = verifyToken(token);
        const user = await User.findById(id); // Buscar el usuario en la base de datos utilizando el ID del token

        if (!user) {
            return res.status(401).json({ message: "Invalid token" });
        }

        user.password = null; // Eliminar la contraseña del objeto de usuario antes de enviarlo en la respuesta
        req.user = user; // Agregar el usuario al objeto de solicitud para que esté disponible en las rutas protegidas
        next(); // Continuar con la siguiente función de middleware o ruta

    } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
    }
};

module.exports = { isAuth };
