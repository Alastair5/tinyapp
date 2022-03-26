const { assert } = require('chai');
const { getUserByEmail, urlsForUser } = require("../helpers");


const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "purple-monkey-dinosaur"
  }
};

const testURLS = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "userRandomID"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "userRandomID"
  }
};

describe('checkUserEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail(testUsers, "user@example.com");
    const expectedUserID = "userRandomID";
    assert.equal(user.id, expectedUserID);
  });
  it('should return undefined if email invalid', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = undefined;
    assert.equal(user, expectedUserID);
  });
  it('should return URLs that belong to a user', function() {
    const user = urlsForUser("userRandomID", testURLS);
    const expectedResult = {
      b6UTxQ: {
        longURL: "https://www.tsn.ca",
        userID: "userRandomID"
      },
      i3BoGr: {
        longURL: "https://www.google.ca",
        userID: "userRandomID"
      }
    };
    assert.deepEqual(user, expectedResult);
  });
  it('should return no URLs', function() {
    const user = urlsForUser("randomID", testUsers);
    assert.deepEqual(user, {});
  });
});
