
const generateRandomString = function() {
  return Math.random().toString(32).substring(2, 8);
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