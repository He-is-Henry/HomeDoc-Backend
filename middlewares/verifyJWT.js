const jwt = require("jsonwebtoken");
const User = require("../models/User");

const verifyJWT = async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  console.log(authHeader);
  if (!authHeader?.startsWith("Bearer "))
    return res.status(401).json({ error: "Unauthorized" });

  const token = authHeader.split(" ")[1];
  console.log(token);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded.id);
    const user = await User.findOne({
      _id: decoded.id,
    });

    if (!user) {
      return res.status(403).json({ error: "Session invalid or expired" });
    }
    const match = user.sessions.find(
      (session) => session.accessToken === token
    );
    if (!match) {
      return res.status(403).json({ error: "Session invalid or expired" });
    }
    // Attach user to request
    req.user = {
      id: user._id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (err) {
    console.log(err);
    return res.status(403).json({ error: "Forbidden" });
  }
};

module.exports = verifyJWT;
