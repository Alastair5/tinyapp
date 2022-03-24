const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");


app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }), cookieParser());

//generate a new random ID
const generateRandomString = function() {
  return Math.random().toString(32).substring(2, 8);
};

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "user1"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "user2"
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

// check if email is in database
const checkEmail = function(database, email) {
  for (let user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
  return false;
};

// const keys = Object.keys(urlDatabase);
// view user created urls
const urlsForUser = function(id) {
  const result = {};
  for (let shortURL in urlDatabase) {
    const url = urlDatabase[shortURL];
    if (url.userID === id) {
      result[shortURL] = url;
    }
  }
  return result;
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
  const user = users[req.cookies.user_id];
  if (user) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls", (req, res) => {
  const userID = req.cookies.user_id;
  const user = users[userID];
  if (user) {
    const urls = urlsForUser(userID);
    console.log("home", urls);
    const templateVars = { username: users[req.cookies.user_id], urls: urls};
    res.render("urls_index", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.post("/urls", (req, res) => {
  const userID = req.cookies.user_id;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {userID: userID, longURL: req.body.longURL };
  res.redirect(`/urls/${shortURL}`);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { username: users[req.cookies.user_id], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL};
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

app.get("/login", (req, res) => {
  const templateVars = { username: users[req.cookies.user_id]};
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  let password = req.body.password;
  let email = req.body.email;
  let user = checkEmail(users, email);
  if (user === false) {
    res.status(403);
    res.send("User does not exist");
    return;
  } else if (user.password !== password) {
    res.status(403);
    res.send("The password is not valid");
    return;
  } else {
    res.cookie("user_id", user.id);
    res.redirect("/urls");
  }
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
app.post("/register", (req, res) => {
  let password = req.body.password;
  let email = req.body.email;
  let userId = generateRandomString();
  console.log("Anything");
  if (checkEmail(users, email) !== false) {
    res.status(400);
    res.send("This email already exists");
    return;
  } else if (!email || !password) {
    res.status(400);
    res.send("The email or password was not valid");
    return;
  } else {
    users[userId] = {
      id: userId,
      email: email,
      password: password
    };
  }
  console.log(users);
  res.cookie("user_id", userId);
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});