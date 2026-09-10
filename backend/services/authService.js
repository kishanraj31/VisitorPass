const User = require("../models/User");
const generateToken = require("../utils/generateToken");

const registerUser = async ({ name, email, password, role, phone }) => {
  const existing = await User.findOne({ email });
  if (existing) {
    const err = new Error("Email already in use.");
    err.statusCode = 400;
    throw err;
  }
  const user = await User.create({ name, email, password, role, phone });
  const token = generateToken(user);
  return { user: { id: user._id, name: user.name, email: user.email, role: user.role }, token };
};

const loginUser = async ({ email, password, role }) => {
  const user = await User.findOne({ email });
  if (!user) {
    const err = new Error("Invalid email or password.");
    err.statusCode = 401;
    throw err;
  }
  if (role && user.role !== role) {
    const err = new Error(`Account is not authorized for ${role} access.`);
    err.statusCode = 401;
    throw err;
  }
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const err = new Error("Invalid email or password.");
    err.statusCode = 401;
    throw err;
  }
  const token = generateToken(user);
  return { user: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone }, token };
};

const getUserById = async (id) => {
  return User.findById(id).select("-password");
};

const getAllHosts = async () => {
  return User.find({ role: "host" }).select("name email phone");
};

const getAllStaff = async () => {
  return User.find({ role: { $in: ["host", "frontdesk"] } }).select("-password");
};

module.exports = { registerUser, loginUser, getUserById, getAllHosts, getAllStaff };
