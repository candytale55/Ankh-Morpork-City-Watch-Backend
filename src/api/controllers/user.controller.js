const User = require('../models/User');
const bcrypt = require('bcrypt');
const { generateToken } = require('../../utils/jwt');
const { deleteFile } = require('../../utils/deleteFile');

const register = async (req, res) => {
    try {
        const newUser = new User(req.body);

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
        return res.status(400).json("Error in getting User");
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedUser = await User.findByIdAndDelete(id);

        if (!deletedUser) {
            return res.status(404).json("Error: User not found");
        }

        await deleteFile(deletedUser.image);
        await deletedUser.deleteOne();

        return res.status(200).json({ message: "User deleted successfully", user: deletedUser });
    } catch (error) {
        return res.status(400).json("Error in deleting User");
    }
};


module.exports = {
    register,
    login,
    getUsers,
    getUser,
    deleteUser
};
