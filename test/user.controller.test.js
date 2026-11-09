// Tests that public user registration accepts only the intended fields.
const assert = require('node:assert/strict');
const test = require('node:test');

const userModelPath = require.resolve('../src/api/models/User');
const caseModelPath = require.resolve('../src/api/models/Case');
const deleteFilePath = require.resolve('../src/utils/deleteFile');
const emailPath = require.resolve('../src/utils/sendResetPasswordEmail');

let constructorData;
let userToDelete;
let caseUpdateCall;
let shouldFailImageDeletion = false;

// Mimics the User model methods used by the registration controller.
function User(data) {
    constructorData = { ...data };
    Object.assign(this, data);
    this.save = async () => this;
}

User.findOne = async () => null;
User.findById = () => ({
    select: async () => userToDelete
});

require.cache[userModelPath] = { exports: User };
require.cache[caseModelPath] = {
    exports: {
        updateMany: async (...args) => {
            caseUpdateCall = args;
        }
    }
};
// Lets deletion tests simulate a Cloudinary cleanup failure.
const deleteFile = async () => {
    if (shouldFailImageDeletion) {
        throw new Error('Cloudinary file not found');
    }
};
require.cache[deleteFilePath] = { exports: { deleteFile } };
require.cache[emailPath] = { exports: { sendResetPasswordEmail: async () => {} } };

const { register, deleteUser } = require('../src/api/controllers/user.controller');

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

test('deletes the account and unlinks cases when Cloudinary cleanup fails', async () => {
    let accountWasDeleted = false;
    userToDelete = {
        image: 'https://res.cloudinary.com/demo/image/upload/v1/user.jpg',
        deleteOne: async () => {
            accountWasDeleted = true;
        }
    };
    caseUpdateCall = null;
    shouldFailImageDeletion = true;
    const originalWarn = console.warn;
    console.warn = () => {};

    try {
        const res = createResponse();
        await deleteUser({
            params: { id: 'user-id' },
            user: { _id: 'user-id', role: 'user' }
        }, res);

        assert.equal(res.statusCode, 200);
        assert.equal(accountWasDeleted, true);
        assert.deepEqual(caseUpdateCall, [
            { assignedTo: 'user-id' },
            { $pull: { assignedTo: 'user-id' } }
        ]);
    } finally {
        shouldFailImageDeletion = false;
        console.warn = originalWarn;
    }
});
