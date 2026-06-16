const User = require('../models/User'); 

const registerUser = async (req, res) => { 
    try {
        const newUser = new User(req.body);
        const savedUser = await newUser.save();
        return res.status(201).json(savedUser);
        
    } catch (error) {
        return res.status(400).json("Error: Couldn't create user")
    }
};

const loginUser = async (req, res) => { 
    try {
        
    } catch (error) {
        return res.status(400).json("Login Error")
    }
};


module.exports = {
    registerUser,
    loginUser
};