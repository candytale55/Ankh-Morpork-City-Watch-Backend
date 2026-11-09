// Tests that public user registration accepts only the intended fields.
const assert = require('node:assert/strict');
const test = require('node:test');

const userModelPath = require.resolve('../src/api/models/User');
const caseModelPath = require.resolve('../src/api/models/Case');
const deleteFilePath = require.resolve('../src/utils/deleteFile');
const emailPath = require.resolve('../src/utils/sendResetPasswordEmail');

let constructorData;

// Mimics the User model methods used by the registration controller.
function User(data) {
    constructorData = { ...data };
    Object.assign(this, data);
    this.save = async () => this;
}

User.findOne = async () => null;

require.cache[userModelPath] = { exports: User };
require.cache[caseModelPath] = { exports: {} };
require.cache[deleteFilePath] = { exports: { deleteFile: async () => {} } };
require.cache[emailPath] = { exports: { sendResetPasswordEmail: async () => {} } };

const { register } = require('../src/api/controllers/user.controller');

// Creates the minimal Express response object needed by the controller.
const createResponse = () => ({
    statusCode: null,
    body: null,
    status(code) {
        this.statusCode = code;
        return this;
    },
    json(body) {
        this.body = body;
        return this;
    }
});

test('register ignores role and case assignments supplied by the client', async () => {
    const res = createResponse();

    await register({
        body: {
            name: 'New User',
            email: ' New.User@Example.com ',
            password: 'secure-password',
            role: 'admin',
            assignedCases: ['case-id'],
            resetPasswordToken: 'malicious-token'
        }
    }, res);

    assert.equal(res.statusCode, 201);
    assert.deepEqual(constructorData, {
        name: 'New User',
        email: 'new.user@example.com',
        password: 'secure-password',
        role: 'user',
        assignedCases: []
    });
});
