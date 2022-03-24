const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookie = require("cookie-parser");
const bodyParser = require("body-parser");


app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }), cookie());

//generate a new random ID
const generateRandomString = function() {
  return Math.random().toString(32).substring(2, 8);
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
const checkEmail = function(database, email) {
  for (let user in database) {
    if (database[user].email === email) {
      return email;
    }
  }
  return false;
};



app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/new", (req, res) => {
  const templateVars = { username: users[req.cookies.user_id]};
  res.render("urls_new", templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = { username: users[req.cookies.user_id], urls: urlDatabase};
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = { longURL: urlDatabase[req.params.shortURL]};
  res.redirect(longURL.longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { username: users[req.cookies.user_id], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL/edit", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const value = req.body.username;
  res.cookie("user_id", value);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  const templateVars = { username: users[req.cookies.user_id]};
  res.render("register", templateVars);
});

// added errors for blank input and already registered
app.post('/register', (req, res) => {
  if (checkEmail(users, req.body.email) !== false) {
    res.status(400);
    res.send("This email already exists");
    return;
  }
  if (!req.body.email || !req.body.password) {
    res.status(400);
    res.send("The email or password was not valid");
    return;
  }
  const userID = generateRandomString();
  users[userID] = {
    id: userID,
    email: req.body.email,
    password: req.body.password
  };
  console.log(users);
  res.cookie('user_id', userID);
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});