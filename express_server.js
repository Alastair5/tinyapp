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


app.get("/", (req, res) => {
  res.redirect("/login");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    res.redirect("/login");
  }
  const urls = urlsForUser(userID, urlDatabase);
  const templateVars = { urls: urls, user: users[userID]};
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const userID = req.session.user_id;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {userID: userID, longURL: req.body.longURL };
  res.redirect(`/urls`);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.session.user_id]};
  const user = users[req.session.user_id];
  if (user) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  if (!longURL) {
    res.status(404).send("You dont have access");
  }
  res.redirect(longURL.longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { user: users[req.session.user_id], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL};
  res.render("urls_show", templateVars);
});

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

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL].userID === req.session.user_id) {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  } else {
    res.status(401);
    res.send("Can not delete other people links");
    res.redirect("/login");
  }
});

app.get("/login", (req, res) => {
  const templateVars = { user: users[req.session.user_id]};
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  let password = req.body.password;
  let email = req.body.email;
  let user = getUserByEmail(users, email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    res.status(403);
    res.send("Username or password does not match");
    return;
  } else {
    // eslint-disable-next-line camelcase
    req.session.user_id = user.id;
    res.redirect("/urls");
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("session");
  res.cookie('session.sig');
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  const templateVars = { user: users[req.session.user_id]};
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  let password = bcrypt.hashSync(req.body.password, 10);
  let email = req.body.email;
  let user = generateRandomString();
  if (getUserByEmail(users, email) !== undefined || !email || !password) {
    res.status(400);
    res.send("This email or password can nopt be used");
    return;
  } else {
    users[user] = {
      id: user,
      email: email,
      password: password
    };
  }
  res.cookie("user_id", user);
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});