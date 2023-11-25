const express = require("express");
const app = express();
const controller = require("./controllers");

app.get("/list", controller.list).post("/store", controller.store);

module.exports = app;
