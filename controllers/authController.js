const User = require("../models/User");
const { getClientInfo } = require("../utils/getClientInfo");
const jwt = require("jsonwebtoken");

const signup = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: "All fields are required" });

  try {
    const existing = await User.findOne({ email });
    if (existing)
      return res.status(409).json({ error: "Email already in use" });

    const user = await User.create({ name, email, password });
    res.status(201).json({
      message: "Signup successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    if (!users.length) return res.json({ message: "No users to show" });
    res.json(users);
  } catch (err) {
    console.log(err);
  }
};
const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "30d";

const login = async (req, res) => {
  const SESSION_LIMIT = 5;
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email and password are required" });
  let message = "Success, ";
  try {
    // Step 1: Check for existing token in cookie
    const existingToken = req.cookies?.jwt;
    console.log(existingToken);
    let tokenUserId = null;

    if (existingToken) {
      try {
        const decoded = jwt.verify(existingToken, process.env.JWT_SECRET);
        tokenUserId = decoded?.id;
        const existingUser = await User.findById(tokenUserId);
        if (existingUser) {
          existingUser.sessions = existingUser.sessions.filter(
            (s) => s.refreshToken !== existingToken
          );
          await existingUser.save();
        }
      } catch (err) {
        console.log("Invalid or expired token, skipping cleanup.");
      }
    }

    // Step 2: Check credentials
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ error: "Invalid credentials" });

    // Step 3: Enforce session limit
    if (user.sessions.length >= SESSION_LIMIT) {
      user.sessions.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
      user.sessions.shift(); // remove oldest
    }

    // Step 4: Create tokens
    const payload = { id: user._id, email: user.email };
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRY,
    });
    const refreshToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRY,
    });

    // Step 5: Store session
    const client = getClientInfo(req);
    user.sessions.push({
      refreshToken,
      accessToken,
      createdAt: new Date(),
      ...client,
    });
    await user.save();

    // Step 6: Send response with cookie
    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "Lax" : "Strict",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message,
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const handleRefresh = async (req, res) => {
  const token = req?.cookies?.jwt;
  if (!token) return res.status(401).json({ error: "No token found" });
  try {
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      console.log("!user");
      return res.status(403).json({ error: "Token invalid or expired" });
    }
    console.log(token);
    console.log(user.sessions.map((session) => session.refreshToken));
    const match = user.sessions.find(
      (session) => session.refreshToken === token
    );
    if (!match) {
      console.log("!match");
      return res.status(403).json({ error: "Token invalid or expired" });
    }
    user.sessions = user.sessions.filter(
      (session) => session.refreshToken !== token
    );
    const payload = { id: user._id, email: user.email };
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRY,
    });
    const refreshToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRY,
    });
    const { createdAt, ...client } = getClientInfo(req);
    user.sessions.push({
      refreshToken,
      accessToken,
      createdAt: match.createdAt,
      lastUsed: Date.now(),
      ...client,
    });
    await user.save();
    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken, user: { id: user._id, name: user.name } });
  } catch (err) {
    console.log(err);
  }
};

const getSessions = async (req, res) => {
  try {
    const user = await User.findById(req?.user?.id);
    if (!user)
      return res.status(500).json({ error: "Invalid token", user: req.user });
    const sessions = user.sessions;
    res.json(sessions);
  } catch (err) {
    console.log(err);
  }
};

const logout = async (req, res) => {
  try {
    const token = req?.cookies?.jwt;
    console.log(req.cookies);
    if (!token)
      return res
        .status(400)
        .json({ error: "Token not found, you're not currently logged in" });
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    const id = decoded.id;
    const user = await User.findById(id);
    if (!user)
      return res.status(500).json({ error: "Invalid token", user: req.user });

    user.sessions = user.sessions.filter(
      (session) => session.refreshToken !== token
    );
    await user.save();
    res
      .clearCookie("jwt", { httpOnly: true })
      .json({ message: "Successfully logged out" });
  } catch (err) {
    console.log(err);
  }
};

const revokeSessions = async (req, res) => {
  const idArray = req?.body;
  if (!idArray?.length)
    return res.status(400).json({ error: "Session id(s) are required" });
  try {
    const user = await User.findById(req?.user?.id);
    if (!user)
      return res.status(500).json({ error: "Invalid token", user: req.user });
    const sessions = user.sessions;
    idArray.map((id) => {
      user.sessions = user.sessions.filter(
        (session) => session._id.toString() !== id
      );
    });

    console.log(user.sessions.length, "from ", sessions.length);
    await user.save();
    res.json({ message: "Sessions revoked" });
  } catch (err) {
    console.log(err);
  }
};

const getProfile = async (req, res) => {
  const { id } = req.user;
  console.log(id);
  try {
    const user = await User.findById(id).select("-password");
    res.json(user);
  } catch (err) {
    console.log(err);
  }
};

const editUser = async (req, res) => {
  try {
    const userId = req?.user?.id;

    // get existing user
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const { sessions, passwoord, ...body } = req.body;
    // merge incoming fields into user = req.body;
    Object.assign(user, req.body);

    // let your schema validations run on save
    await user.save();

    res.json({ message: "Profile updated", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  signup,
  getAllUsers,
  login,
  handleRefresh,
  getSessions,
  logout,
  revokeSessions,
  getProfile,
  editUser,
};
