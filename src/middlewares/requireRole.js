
// Builds authorization middleware for routes that require a specific role.

/**
 * Returns middleware that rejects requests from users without the required role.
 */
const requireRole = (requiredRole) => {
    /**
     * Compares the authenticated user's role against the allowed role.
     */
    return (req, res, next) => {
        // Si no existe un usuario autenticado o el rol del usuario no coincide con el rol requerido, se devuelve un error 403 (Forbidden)
        if (!req.user || req.user.role !== requiredRole) {
            return res.status(403).json({ message: "Forbidden", error: "You do not have the required role to access this resource." });
        }
        next();
    };
};

module.exports = { requireRole };