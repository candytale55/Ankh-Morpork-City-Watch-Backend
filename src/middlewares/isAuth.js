const { verifyToken } = require('../utils/jwt');

const isAuth = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1]; // Obtener el token del encabezado de autorización (Bearer token) 
        console.log("Token:", token); // Agregar un console.log para verificar el valor del token
        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { userId } = verifyToken(token); 
        const user = await User.findById(userId); // Buscar el usuario en la base de datos utilizando el ID del token
        user.password = null; // Eliminar la contraseña del objeto de usuario antes de enviarlo en la respuesta
        req.user = user; // Agregar el usuario al objeto de solicitud para que esté disponible en las rutas protegidas
        next(); // Continuar con la siguiente función de middleware o ruta

    } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
    }
};

module.exports = { isAuth };