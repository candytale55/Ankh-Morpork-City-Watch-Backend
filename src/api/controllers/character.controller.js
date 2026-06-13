// CRUD - Create, Read, Update, Delete
const express = require("express");
const Character = require("../models/Character");



const getCharacter = async (req, res) => { 
    try {
        const characters = await Character.find();
        return res.status(200).json(characters);

    } catch (error) {
        return res.status(400).json("Error in getting Characters")
    }
};

const postCharacter = async (req, res) => {
    try {
        const newCharacter = new Character(req.body);
        const savedCharacter = await newCharacter.save();
        return res.status(201).json(savedCharacter);
    } catch (error) {
        return res.status(400).json("Error in posting Character")
    }
}

const updateCharacter = async (req, res) => {
    try {
        const { id } = req.params;
        const newCharacter = new Character(req.body);
        newCharacter._id = id;
        const updatedCharacter = await Character.findByIdAndUpdate(id, newCharacter, { new: true });
        return res.status(200).json(updatedCharacter);
    } catch (error) {
        return res.status(400).json("Error in updating Character")
    }
}

const deleteCharacter = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedCharacter = await Character.findByIdAndDelete(id);
        return res.status(200).json({ message: "Character deleted successfully", element: deletedCharacter });
    } catch (error) {
        return res.status(400).json("Error in deleting Character")
    }
}

module.exports = {
    getCharacter,
    postCharacter,
    updateCharacter,
    deleteCharacter
};