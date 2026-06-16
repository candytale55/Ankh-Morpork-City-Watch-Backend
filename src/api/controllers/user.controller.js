const User = require('../models/User'); 

const registerUser = async (req, res) => { 
    try {
        const newUser = new User(req.body);
        const savedUser = await newUser.save();
        return res.status(201).json({
            message: "User created successfully",
            user: savedUser
        });
    } catch (error) {
        return res.status(400).json("Error: Couldn't create user")
    }
};

const loginUser = async (req, res) => { 
    try {
        return res.status(200).json("Login route working");
    } catch (error) {
        return res.status(400).json("Login Error")
    }
};


module.exports = {
    registerUser,
    loginUser
};