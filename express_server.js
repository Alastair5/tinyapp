const express = require("express");
const app = express();
const PORT = 8080;
const cookieSession = require("cookie-session");
const bodyParser = require("body-parser");
const bcrypt = require('bcryptjs');
const { generateRandomString, getUserByEmail, urlsForUser } = require("./helpers");


app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['key'],

  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

// Users database
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

// Databse for URLs created by each user
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "userRandomID"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "user2RandomID"
  }
};

// Redirect to login page
app.get("/", (req, res) => {
  res.redirect("/login");
});

// Treat database as valid JSON
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// If logged in show user created URLS, if not logged in redirect to login page
app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  const urls = urlsForUser(userID, urlDatabase);
  const templateVars = { urls: urls, user: users[userID]};
  if (!userID) {
    res.redirect("/login");
    return;
  }
  res.render("urls_index", templateVars);
});

// URLs page show URLs created by user
app.post("/urls", (req, res) => {
  const userID = req.session.user_id;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {userID: userID, longURL: req.body.longURL };
  res.redirect(`/urls`);
});

// Create URLs while logged in as a user, if not logged in redirect to login page
app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.session.user_id]};
  const user = users[req.session.user_id];
  if (user) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

// Access short URL links weither you're logged in or not
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  if (!longURL) {
    res.status(404).send("You dont have access");
  }
  res.redirect(longURL.longURL);
});

// Show information about individual URLs
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { user: users[req.session.user_id], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL};
  res.render("urls_show", templateVars);
});

// Edit a URL if user is logged in or send an error
app.post("/urls/:shortURL/edit", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  const loggedInUser = req.session.user_id;
  if (!loggedInUser) {
    return res.status(401).res.send("Can not edit other people links");
  }
  urlDatabase[shortURL].longURL = longURL;
  res.redirect("/urls");
});

// Logged in user can delete their created URLs, if not logged in show an error
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL].userID === req.session.user_id) {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  } else {
    res.status(401).send("Can not delete other people links");
  }
});

// Shows the login page
app.get("/login", (req, res) => {
  const templateVars = { user: users[req.session.user_id]};
  res.render("login", templateVars);
});

// Checks for email and password in database, if not found show an error
app.post("/login", (req, res) => {
  const password = req.body.password;
  const email = req.body.email;
  const user = getUserByEmail(users, email);
  if (email === "" || password === "") {
    res.send("test login");
    return;
  }
  if (!user || !bcrypt.compareSync(password, user.password)) {
    res.status(403).send("Username or password does not match");
    return;
  } else {
    // eslint-disable-next-line camelcase
    req.session.user_id = user.id;
    res.redirect("/urls");
  }
});

// Deletes session cookie and redirects to the URLs page
app.post("/logout", (req, res) => {
  res.clearCookie("session");
  res.redirect("/login");
});

// Shows the registration page
app.get("/register", (req, res) => {
  const templateVars = { user: users[req.session.user_id]};
  res.render("register", templateVars);
});

// Checks email and password input against the database, if user does not exist and input is valid, register a new user
app.post("/register", (req, res) => {
  let password = req.body.password;
  const email = req.body.email;
  const user = generateRandomString();
  if (email === "" || password === "") {
    res.status(400).send("Please provide an email or password");
    return;
  }
  if (!getUserByEmail(users, email)) {
    password = bcrypt.hashSync(req.body.password, 10);
    users[user] = {
      id: user,
      email,
      password
    };
    // eslint-disable-next-line camelcase
    req.session.user_id = user;
    res.redirect('/urls');
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});