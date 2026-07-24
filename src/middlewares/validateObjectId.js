/**
 * Validates that the specified route parameters
 * contain valid MongoDB ObjectIds.
 */

const mongoose = require('mongoose');

const validateObjectId = (...params) => {
    // Middleware factory: lets each route declare which params should be treated as Mongo ObjectIds.
    return (req, res, next) => {
        for (const param of params) {
            const id = req.params[param];

            // Fail fast: stop here if the id format is wrong, instead of letting Mongoose reach the query and throw a CastError later.
            if (!mongoose.isObjectIdOrHexString(id)) {
                return res.status(400).json({
                    message: `Invalid '${param}' format`
                });
            }
        }
        next();
    }
}

module.exports = { validateObjectId };

    