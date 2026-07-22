// Handles user registration, authentication, profile access, and admin actions.

const User = require('../models/User');
const Case = require('../models/Case');
const bcrypt = require('bcrypt');
const { generateToken } = require('../../utils/jwt');
const { deleteFile } = require('../../utils/deleteFile');

/**
 * Deletes a newly uploaded user image when an operation fails.
 */
const rollbackUploadedUserImage = async (file) => {
    if (!file?.path) {
        return;
    }

    try {
        await deleteFile(file.path);
    } catch (cleanupError) {
        console.error('Uploaded user image could not be rolled back', cleanupError.message);
    }
};

/**
 * Registers a new user and returns the created profile without the password.
 */
const register = async (req, res) => {
    try {
        const newUser = new User(req.body);

        // Force the role to 'user' to prevent users from registering as admins
        newUser.role = 'user';

        if (req.file) {
            newUser.image = req.file.path;
        }

        const userDuplicated = await User.findOne({ email: newUser.email });
        if (userDuplicated) {
            await rollbackUploadedUserImage(req.file);
            return res.status(400).json("Error: User already exists");
        }

        const savedUser = await newUser.save();
        savedUser.password = undefined; // Remove password from the user object before sending it in the response

        return res.status(201).json({
            message: "User created successfully",
            user: savedUser
        });
    } catch (error) {
        await rollbackUploadedUserImage(req.file);
        return res.status(400).json("Error: Couldn't create user: " + error.message);
    }
};

/**
 * Validates credentials and returns a signed token plus the user profile.
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json("Error: Invalid email or password");
        }

        /* Si llega aquí, es que el usuario existe y hay que comprobar la contraseña */
        if (bcrypt.compareSync(password, user.password)) {
            const token = generateToken(user._id);
            user.password = undefined; // Remove password from the user object before sending it in the response
            return res.status(200).json({ token, user });

        } else {
            return res.status(400).json("Error: Invalid email or password");
        }

    } catch (error) {
        return res.status(400).json("Login Error: " + error.message);
    }
};

/**
 * Returns all users without their password hashes.
 */
const getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').populate('assignedCases', 'title status priority');
        return res.status(200).json(users);
    } catch (error) {
        return res.status(400).json("Error in getting Users: " + error.message);
    }
};

/**
 * Returns one user by id without its password hash.
 */
const getUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id).select('-password').populate('assignedCases', 'title status priority');

        if (!user) {
            return res.status(404).json("Error: User not found");
        }

        return res.status(200).json(user);
    } catch (error) {
        return res.status(400).json("Error in getting User: " + error.message);
    }
};

/**
 * Returns the authenticated user stored by the auth middleware.
 */
const getMe = async (req, res) => {
    try {
        return res.status(200).json(req.user);
        //funciona porque isAuth ya pone el usuario en req.user
    } catch (error) {
        return res.status(400).json("Error in getting current User: " + error.message);
    }
};


/**
 * Updates the current user or an admin-managed user while protecting sensitive fields.
 */
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;

        const isAdmin = req.user.role === 'admin';
        const isSameUser = req.user._id.toString() === id;

        if (!isAdmin && !isSameUser) {
            return res.status(403).json("Error: Forbidden - Users can only update their own account");
        }

        if (req.body.role && !isAdmin) {
            await rollbackUploadedUserImage(req.file);
            return res.status(403).json("Error: Forbidden - Users cannot change roles");
        }

        const currentUser = await User.findById(id).select('-password');
        if (!currentUser) {
            await rollbackUploadedUserImage(req.file);
            return res.status(404).json("Error: User not found");
        }

        const updateData = { ...req.body };
        delete updateData.role; // Remove role from the request body to prevent unauthorized role changes
        delete updateData.assignedCases; // Prevent users from assigning cases to themselves or others (Only Admins can assign cases)
        delete updateData.password; // Prevent users from changing their password through this endpoint (Password change should be handled separately)

        if (req.file) {
            updateData.image = req.file.path;
        }

        const updatedUser = await User.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true } // Ensure the updated data adheres to the schema
        ).select('-password');

        if (req.file && currentUser.image && currentUser.image !== updatedUser.image) {
            try {
                await deleteFile(currentUser.image);
            } catch (deleteError) {
                console.error('Old user image could not be deleted', deleteError.message);
            }
        }

        return res.status(200).json({ message: "User updated successfully", user: updatedUser });
    } catch (error) {
        await rollbackUploadedUserImage(req.file);
        return res.status(400).json("Error in updating User: " + error.message);
    }
};

/**
 * Updates only the role field of a user.
 */
const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            id,
            { role },
            { new: true, runValidators: true } // Ensure the new role is valid according to the schema
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json("Error: User not found");
        }

        return res.status(200).json({
            message: "User role updated successfully",
            user: updatedUser
        });

    } catch (error) {
        return res.status(400).json("Error in updating User role - Only an admin can update roles: " + error.message);
    }
};



/**
 * Deletes a user and removes their references from assigned cases.
 */
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const isAdmin = req.user.role === 'admin';
        const isSameUser = req.user._id.toString() === id;

        if (!isAdmin && !isSameUser) {
            return res.status(403).json("Error: Forbidden - Users can only delete their own account");
        }

        const deletedUser = await User.findById(id).select('-password');

        if (!deletedUser) {
            return res.status(404).json("Error: User not found");
        }

        await Case.updateMany(
            { assignedTo: id },
            { $pull: { assignedTo: id } }
        ); // Remove the user from assignedTo array in all cases

        await deleteFile(deletedUser.image); // Eliminar la imagen del usuario si existe

        await deletedUser.deleteOne(); // Eliminar el usuario de la base de datos


        return res.status(200).json({ message: "User deleted successfully", user: deletedUser });

    } catch (error) {
        return res.status(400).json("Error in deleting User: " + error.message);
    }
};

module.exports = {
    register,
    login,
    getUsers,
    getUser,
    getMe,
    updateUser,
    updateUserRole,
    deleteUser
};

