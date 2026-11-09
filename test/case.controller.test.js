// Tests the authorization and update-field restrictions for case updates.
const assert = require('node:assert/strict');
const test = require('node:test');

const caseModelPath = require.resolve('../src/api/models/Case');
const agentModelPath = require.resolve('../src/api/models/Agent');
const userModelPath = require.resolve('../src/api/models/User');

const caseModel = {
  findById: async () => null,
  findOne: async () => null,
  findByIdAndUpdate: () => null
};

require.cache[caseModelPath] = { exports: caseModel };
require.cache[agentModelPath] = { exports: {} };
require.cache[userModelPath] = { exports: {} };

const { updateCase } = require('../src/api/controllers/case.controller');

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

// Simulates the chainable and awaitable Mongoose update query.
const createUpdatedCaseQuery = (updatedCase) => ({
  populate() {
    return this;
  },
  then(resolve, reject) {
    return Promise.resolve(updatedCase).then(resolve, reject);
  }
});

test('rejects an update from a user who did not create the case', async () => {
  let updateWasCalled = false;
  caseModel.findById = async () => ({
    createdBy: { toString: () => 'case-creator' }
  });
  caseModel.findByIdAndUpdate = () => {
    updateWasCalled = true;
  };

  const res = createResponse();
  await updateCase({
    params: { id: 'case-id' },
    user: { _id: 'another-user', role: 'user' },
    body: { status: 'closed' }
  }, res);

  assert.equal(res.statusCode, 403);
  assert.equal(updateWasCalled, false);
});

test('allows the creator to update only allowlisted case fields', async () => {
  let receivedUpdate;
  caseModel.findById = async () => ({
    createdBy: { toString: () => 'case-creator' }
  });
  caseModel.findOne = async () => null;
  caseModel.findByIdAndUpdate = (id, updateData, options) => {
    receivedUpdate = { id, updateData, options };
    return createUpdatedCaseQuery({ _id: id, ...updateData });
  };

  const res = createResponse();
  await updateCase({
    params: { id: 'case-id' },
    user: { _id: 'case-creator', role: 'user' },
    body: {
      title: '  Updated title  ',
      description: 'Updated description',
      assignedTo: ['user-id'],
      assignedAgents: ['agent-id'],
      createdBy: 'another-user',
      arbitraryField: 'ignored'
    }
  }, res);

  assert.equal(res.statusCode, 200);
  assert.deepEqual(receivedUpdate, {
    id: 'case-id',
    updateData: {
      title: 'Updated title',
      description: 'Updated description'
    },
    options: { new: true, runValidators: true }
  });
});

test('allows an administrator to update a case created by another user', async () => {
  let receivedUpdate;
  caseModel.findById = async () => ({
    createdBy: { toString: () => 'case-creator' }
  });
  caseModel.findByIdAndUpdate = (id, updateData) => {
    receivedUpdate = { id, updateData };
    return createUpdatedCaseQuery({ _id: id, ...updateData });
  };

  const res = createResponse();
  await updateCase({
    params: { id: 'case-id' },
    user: { _id: 'admin-user', role: 'admin' },
    body: { priority: 'high' }
  }, res);

  assert.equal(res.statusCode, 200);
  assert.deepEqual(receivedUpdate, {
    id: 'case-id',
    updateData: { priority: 'high' }
  });
});
