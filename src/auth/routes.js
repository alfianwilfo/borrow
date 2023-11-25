const express = require("express");
const app = express();
const controller = require("./controllers");

app.post("/register", controller.register).post("/login", controller.login);
module.exports = app;
