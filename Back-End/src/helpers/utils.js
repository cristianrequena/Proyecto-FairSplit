const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  const payload = {
    id: user.user_id,
    email: user.email,
  };

  const secret = process.env.SECRET_KEY || "default_secret";

  return jwt.sign(payload, secret, {
    expiresIn: "24h",
  });
};

module.exports = {
  generateToken,
};