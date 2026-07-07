const User = require('../models/User');
const bcrypt = require('bcrypt');
const { generateToken } = require('../../utils/jwt');
const { deleteFile } = require('../../utils/deleteFile');

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
            return res.status(400).json("Error: User already exists");
        }

        const savedUser = await newUser.save();

        return res.status(201).json({
            message: "User created successfully",
            user: savedUser
        });
    } catch (error) {
        return res.status(400).json("Error: Couldn't create user: " + error.message);
    }
};

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
            return res.status(200).json({token, user});

        } else {
            return res.status(400).json("Error: Invalid email or password");
        }

    } catch (error) {
        return res.status(400).json("Login Error: " + error.message);
    }
};

const getUsers = async (req, res) => {
    try {
        const users = await User.find();
        return res.status(200).json(users);
    } catch (error) {
        return res.status(400).json("Error in getting Users: " + error.message);
    }
};

const getUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json("Error: User not found");
        }

        return res.status(200).json(user);
    } catch (error) {
        return res.status(400).json("Error in getting User: " + error.message);
    }
};

const getMe = async (req, res) => {
    try {
        return res.status(200).json(req.user);

    } catch (error) {
        return res.status(400).json("Error in getting current User: " + error.message);
    }
};


const updateUser = async (req, res) => {
    try {
        const { id } = req.params;

        const isAdmin = req.user.role === 'admin';
        const isSameUser = req.user._id.toString() === id;

        if (!isAdmin && !isSameUser) {
            return res.status(403).json("Error: Forbidden - Users can only update their own account");
        }

        if (req.body.role && !isAdmin) {
            return res.status(403).json("Error: Forbidden - Users cannot change roles");
        }

        delete req.body.role; // Remove role from the request body to prevent unauthorized role changes

        const updatedUser = await User.findByIdAndUpdate(
            id,
            req.body,
            { new: true }
        );
        
        if (!updatedUser) {
            return res.status(404).json("Error: User not found");
        }

        return res.status(200).json({ message: "User updated successfully", user: updatedUser });
    } catch (error) {
        return res.status(400).json("Error in updating User: " + error.message);
    }
};

const updateUserRole = async (req, res) => { 
    try {
        const { id } = req.params;
        const { role } = req.body;
        
        const updatedUser = await User.findByIdAndUpdate(
            id,
            { role },
            { new: true }
        );

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
    


const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const isAdmin = req.user.role === 'admin';
        const isSameUser = req.user._id.toString() === id;

        if (!isAdmin && !isSameUser) {
            return res.status(403).json("Error: Forbidden - Users can only delete their own account");
        }

        const deletedUser = await User.findById(id);

        if (!deletedUser) {
            return res.status(404).json("Error: User not found");
        }

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

