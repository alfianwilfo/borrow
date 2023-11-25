const express = require("express");
const app = express();
const controller = require("./controllers");
const { checkAuth } = require("../../middeware/auth");
app
  .get("/list", controller.list)
  .post("/store", controller.store)
  .post("/borrow", checkAuth, controller.borrow)
  .post("/return", checkAuth, controller.return);

module.exports = app;
