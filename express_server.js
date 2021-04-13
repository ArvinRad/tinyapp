const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

// Creating short url database:
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// Creating the route page:
app.get("/", (req, res) => {
  res.send("Hello!");
});

//Creating additional endpoint:
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//Creating server listener:
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});