const express = require("express");
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

//Adding the middleware:
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

//Adding ejs engine
app.set("view engine", "ejs");

// Creating short url database:
const users = {};
const userIdStore = [];
const urlDatabase = {
  "b2xVn2": {longURL:"http://www.lighthouselabs.ca", userID: 10},
  "9sm5xK": {longURL: "http://www.google.com", userID: 10}
};

//Creating Functions needed:
function generateRandomString() {
  let alphaNumericString = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvxyz";
  let randomString = [];
  for (let i = 0; i < 6; i++) {
    randomString.push(alphaNumericString.charAt(Math.trunc(alphaNumericString.length * Math.random())));
  }
  return randomString.join('');
}

const getUserByEmail = (email2, database) => {
  let myUsers = Object.entries(database);
  let theUser;
  for (let i = 0; i < myUsers.length; i++) {
    if (myUsers[i][1].email === email2) {
      theUser = myUsers[i];
    }
  }
  return theUser;
}

const urlForUser = (urlDatabase, userId) => {
  let myArr = {};
  let myVal = Object.keys(urlDatabase);
  for (let key of myVal) {
      if (urlDatabase[key].userID === userId) {
        myArr[key] = urlDatabase[key];
      };
  }
  return myArr;
}

const userIdGen = bank => {
  let id = Math.trunc(1000 * Math.random());
  bank.includes(id) ? id = userIdGen(bank) : bank.push(id);
  return id;
}

//   Registration Page  //

app.get("/register", (req, res) => {
  res.render("register");
});


//   Registration Handler //

app.post("/register", (req, res) => {
  if (req.body.email.includes("@") && !JSON.stringify(users).includes(req.body.email)) {
    const userId = userIdGen(userIdStore);
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
    users[req.body.username] = { "id": userId, "email": req.body.email, "password": hashedPassword};
    res.redirect("/login");
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
    if (bcrypt.compareSync(req.body.password, getUserByEmail(req.body.email, users)[1].password)) {
      res.cookie("user_id", getUserByEmail(req.body.email, users)[1].id)
      res.cookie("user_name", getUserByEmail(req.body.email, users)[0])
      res.redirect("/urls");
    } else res.send("Error 403: Username or password is not valid. Please return to login page using your browser bottom.");
  } else res.send("Error 403: Username or password is not valid. Please return to login page using your browser bottom.");

});

//   Log Out Handler //

app.post("/logout", (req, res) => {
  res.clearCookie("user_id")
  res.clearCookie("user_name")
  res.redirect("/login");
});

// Creating the route page:
app.get("/", (req, res) => {
  res.send("This App facilitates your short URLs. Please be autheticated here!");
});

//Creating route handler for "/urls":
app.get("/urls", (req, res) => {
  if (req.cookies.user_name) {
    let myUrlDatabase = urlForUser(urlDatabase, req.cookies.user_id)
    const templateVars = {
      username: req.cookies.user_name,
      urls: myUrlDatabase };
    res.render("urls_index", templateVars);
  } else res.redirect("/login");
});

// Presenting the form of creating Short URL to the user
app.get("/urls/new", (req, res) => {
  if (req.cookies.user_name) {
    const templateVars = {
    username: req.cookies.user_name,
    urls: urlDatabase };
  res.render("urls_new", templateVars);
  } else res.redirect("/login");
});

//Creating page handler for short urls:
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { username: req.cookies.user_name,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL] };
  res.redirect(longURL);;
});

//Adding a Post handler:
app.post("/urls", (req, res) => {
  if (req.cookies.user_name) {
    const shortURL = generateRandomString();
    const longURL = req.body["longURL"]
    urlDatabase[shortURL] = {"longURL": longURL, userID: req.cookies.user_id};  // Log the POST request body to the console
    const templateVars = {
      username: req.cookies.user_name,
      shortURL: shortURL,
      longURL: longURL };
    res.render("urls_show", templateVars);
  } else res.redirect("/login");
});

// Redirecting to URLS using short URLS:
app.get("/u/:shortURL", (req, res) => {
  if (req.params.shortURL) {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
  }
});

//Creating a POST Request for Editing a URL:

app.post("/urls/:shortURL/Edit", (req, res) => {
  if (req.cookies.user_name) {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    if (urlDatabase[req.params.shortURL].userID === req.cookies.user_id) {
      delete urlDatabase[req.params.shortURL];
      const shortURL = generateRandomString();
      urlDatabase[shortURL] = {"longURL": longURL, "userID": req.cookies.user_id};
      const templateVars = {
        username: req.cookies.user_name,
        shortURL: shortURL,
        longURL: longURL
      };
      res.render("urls_show", templateVars);
    } else res.send("Only owners can edit their short URLs!");
  } else res.redirect("/login");
});

//Creating a POST Request for deleting a URL:
app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.cookies.user_name) {
    if (urlDatabase[req.params.shortURL].userID === req.cookies.user_id) {
      delete urlDatabase[req.params.shortURL];
      const templateVars = {
        username: req.cookies.user_name,
        urls: urlDatabase };
      res.render("urls_index", templateVars);
    } else res.send("Only owners can delete their short URLs!");
  } else res.redirect("/login");
});

//Creating server listener:
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});