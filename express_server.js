const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

//Adding the middleware:
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

//Adding ejs engine
app.set("view engine", "ejs");

// Creating short url database:
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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

// Creating the route page:
app.get("/", (req, res) => {
  res.send("Hello!");
});

//Creating route handler for "/urls":
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// Presenting the form of creating Short URL to the user
app.get("/urls/new", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_new", templateVars);
});

//Creating page handler for short urls:
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.redirect(longURL);;
});

//Adding a Post handler:
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body["longURL"]
  urlDatabase[shortURL] = longURL;  // Log the POST request body to the console
  const templateVars = { shortURL: shortURL, longURL: longURL };
  res.render("urls_show", templateVars);
});

// Redirecting to URLS using short URLS:
app.get("/u/:shortURL", (req, res) => {
  if (req.params.shortURL) {
    const longURL = urlDatabase[req.params.shortURL];
    res.redirect(longURL);
  }
});

//Creating a POST Request for Editing a URL:

app.post("/urls/:shortURL/Edit", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  delete urlDatabase[req.params.shortURL];
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  const templateVars = { shortURL: shortURL, longURL: longURL };
  res.render("urls_show", templateVars);
});

//Creating a POST Request for deleting a URL:
app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.params.shortURL) {
    delete urlDatabase[req.params.shortURL];
  }
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//Creating server listener:
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});