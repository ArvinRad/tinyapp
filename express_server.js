const express = require("express");
const bcrypt = require('bcrypt');
const helpers = require('./helpers')





const cookieSession = require('cookie-session');
const app = express();
const PORT = 8080; // default port 8080

//Adding the middleware:
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

//Adding ejs engine
app.set("view engine", "ejs");

// Creating short url database:
const users = {};
const userIdStore = [];
const urlDatabase = {};

// Creating the route page:
app.get("/", (req, res) => {
  res.render("home");
});


//   Registration Page  //

app.get("/register", (req, res) => {
  res.render("register");
});


//   Registration Handler //

app.post("/register", (req, res) => {
  if (req.body.email.includes("@") && !JSON.stringify(users).includes(req.body.email)) {
    const userId = helpers.userIdGen(userIdStore);
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
    users[req.body.username] = { "id": userId, "email": req.body.email, "password": hashedPassword};
    req.session.user_id = userId;
    req.session.user_name = req.body.username;
    res.redirect("/urls");
  } else {
  res.send("Error 400: Email address or password is not valid or already used. Using your browser bottom, please return to the register page or go to sign in page if you have already an account.");
  }
});
//   Sign In Page  //

app.get("/login", (req, res) => {
  res.render("login");
});

// Sign In Handler
app.post("/login", (req, res) => {
  if (JSON.stringify(users).includes(req.body.email)) {
    let user = helpers.getUserByEmail(req.body.email, users);
    if (user && bcrypt.compareSync(req.body.password, user[1].password)) {
      req.session.user_id = user[1].id;
      req.session.user_name = user[0];
      res.redirect("/urls");
    } else res.send("Error 403: Username or password is not valid. Please return to login page using your browser bottom.");
  } else res.send("Error 403: Username or password is not valid. Please return to login page using your browser bottom.");
});

//   Log Out Handler //

app.post("/logout", (req, res) => {
  req.session.user_id = null;
  req.session.user_name = null;
  res.redirect("/login");
});


//Creating route handler for "/urls":
app.get("/urls", (req, res) => {
  if (req.session.user_name) {
    let myUrlDatabase = helpers.urlForUser(urlDatabase, req.session.user_id)
    const templateVars = {
      username: req.session.user_name,
      urls: myUrlDatabase };
    res.render("urls_index", templateVars);
  } else res.redirect("/");
});

// Presenting the form of creating Short URL to the user
app.get("/urls/new", (req, res) => {
  if (req.session.user_name) {
    const templateVars = {
    username: req.session.user_name,
  };
  res.render("urls_new", templateVars);
  } else res.redirect("/login");
});

//Creating page handler for short urls:
app.get("/urls/:shortURL", (req, res) => {
  if (req.session.user_name) {
    if (urlDatabase[req.params.shortURL].userID === req.session.user_id) {
      const templateVars = {
        username: req.session.user_name,
        shortURL: req.params.shortURL,
        longURL: urlDatabase[req.params.shortURL].longURL
      };
      res.render("urls_show", templateVars);
    } else res.send("Either this short URL doesn't exist or you don't own it");
  } else res.redirect("/")
});

//Adding a Post handler for new short URLs:
app.post("/urls", (req, res) => {
  if (req.session.user_name) {
    const shortURL = helpers.generateRandomString();
    const longURL = req.body["longURL"]
    urlDatabase[shortURL] = {
      longURL: longURL,
      userID: req.session.user_id
    };
    res.redirect(`/urls/${shortURL}`);
  } else res.redirect("/login");
});

// Redirecting to URLS using short URLS:
app.get("/u/:shortURL", (req, res) => {
  if (req.params.shortURL && urlDatabase[req.params.shortURL]) {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
  } else {
    res.send("This short URL does NOT exist. Please return to sign in page using browser key.")
  }
});

//Creating a POST Request for Editing a URL:

app.post("/urls/:shortURL/Edit", (req, res) => {
  if (req.session.user_name) {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    if (urlDatabase[req.params.shortURL].userID === req.session.user_id) {
      delete urlDatabase[req.params.shortURL];
      const shortURL = helpers.generateRandomString();
      urlDatabase[shortURL] = {"longURL": longURL, "userID": req.session.user_id};
      const templateVars = {
        username: req.session.user_name,
        shortURL: shortURL,
        longURL: longURL
      };
      res.render("urls_show", templateVars);
    } else res.send("Only owners can edit their short URLs!");
  } else res.redirect("/login");
});

//Creating a POST Request for deleting a URL:
app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.session.user_name) {
    if (urlDatabase[req.params.shortURL].userID === req.session.user_id) {
      delete urlDatabase[req.params.shortURL];
      let myUrlDatabase = helpers.urlForUser(urlDatabase, req.session.user_id)
      const templateVars = {
        username: req.session.user_name,
        urls: myUrlDatabase
      };
      res.render("urls_index", templateVars);
    } else res.send("Only owners can delete their short URLs!");
  } else res.redirect("/login");
});

//Creating server listener:
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});