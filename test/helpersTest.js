const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
    // Write your assert statement here
    assert.equal(user[1].id, expectedOutput);
  });
});
describe('getUserByEmailver', function() {
  it('should return null for an invalid user email', function() {
    const user = getUserByEmail("user3@example.com", testUsers)
    const expectedOutput = null;
    assert.equal(user, expectedOutput);
  });
});