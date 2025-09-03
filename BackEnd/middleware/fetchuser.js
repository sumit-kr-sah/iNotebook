const jwt = require("jsonwebtoken");

const fetchuser = (req, res, next) => {
  const token = req.header("auth-token");
  if (!token) {
    return res.status(401).send({ error: "enter valid token" });
  }

  try {
    const jwt_secret = "adarshiscoder";
    const data = jwt.verify(token, jwt_secret);
    req.user = data.user;
    next();
  } catch (error) {
    return res.status(401).send({ error: "enter valid token" });
  }
};
module.exports = fetchuser;
