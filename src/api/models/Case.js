// Defines the MongoDB schema for police cases and their relations.

const mongoose = require('mongoose');
const {
    speciesEnum,
    caseTypeEnum,
    caseStatusEnum,
    casePriorityEnum
} = require('../../utils/enums');

const caseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: caseTypeEnum,
        default: 'case'
    },
    status: {
        type: String,
        enum: caseStatusEnum,
        default: 'open'
    },
    priority: {
        type: String,
        enum: casePriorityEnum,
        default: 'medium'
    },
    location: {
        type: String,
        required: true,
        trim: true
    },
    reportedBy: {
        type: String,
        trim: true
    },
    suspectName: {
        type: String,
        trim: true
    },
    suspectSpecies: {
        type: String,
        enum: speciesEnum
    },
    assignedAgents: [{
        type: mongoose.Types.ObjectId,
        ref: 'Agent'
    }],
    assignedTo: [{
        type: mongoose.Types.ObjectId,
        ref: 'User'
    }],
    createdBy: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

const Case = mongoose.model('Case', caseSchema, 'cases');

module.exports = Case;
