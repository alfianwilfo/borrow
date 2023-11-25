const express = require("express");
const app = express();
const port = 3000;
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/user", require("./src/auth/routes"));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
