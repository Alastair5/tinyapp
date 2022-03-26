
const generateRandomString = function() {
  return Math.random().toString(32).substring(2, 8);
};

const users = {
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

// check if email is in database
const getUserByEmail = function(database, email) {
  for (let user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
  return undefined;
};

// view user created urls
const urlsForUser = function(id, database) {
  const result = {};
  for (let shortURL in database) {
    if (database[shortURL].userID === id) {
      result[shortURL] = database[shortURL];
    }
  }
  return result;
};


module.exports = { generateRandomString, getUserByEmail, urlsForUser };