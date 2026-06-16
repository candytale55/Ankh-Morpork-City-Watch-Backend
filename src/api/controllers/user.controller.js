const User = require('../models/User');

const register = async (req, res) => {
    try {
        const newUser = new User(req.body);

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
        return res.status(400).json("Error: Couldn't create user")
    }
};

const login = async (req, res) => {
    try {
        return res.status(200).json("Login route working");
    } catch (error) {
        return res.status(400).json("Login Error")
    }
};

const getUsers = async (req, res) => {
    try {
        const users = await User.find();
        return res.status(200).json(users);
    } catch (error) {
        return res.status(400).json("Error in getting Users")
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

        return res.status(200).json("User deleted successfully", deletedUser);
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