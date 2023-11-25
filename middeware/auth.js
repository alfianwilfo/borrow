var jwt = require("jsonwebtoken");
exports.checkAuth = async (req, res, next) => {
  let { token } = req.headers;
  if (token) {
    var decoded = jwt.verify(token, "shhhhh, its a secret");
    req.session = { user_id: decoded.id };
    next();
  } else {
    res.status(401).json({
      code: 401,
      status: "error",
      message: "Unauthorized",
      result: [],
    });
  }
};
