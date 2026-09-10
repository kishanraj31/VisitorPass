const authService = require("../services/authService");

const createStaff = async (req, res, next) => {
  try {
    const { name, email, password, role, phone } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "name, email, password, and role are required." });
    }
    if (!["host", "frontdesk"].includes(role)) {
      return res.status(400).json({ message: "Only host or frontdesk roles can be created via this endpoint." });
    }
    const result = await authService.registerUser({ name, email, password, role, phone });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required." });
    }
    const result = await authService.loginUser({ email, password, role });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await authService.getUserById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json(user);
  } catch (error) {
    next(error);
  }
};

const getHosts = async (req, res, next) => {
  try {
    const hosts = await authService.getAllHosts();
    res.json(hosts);
  } catch (error) {
    next(error);
  }
};

const getStaff = async (req, res, next) => {
  try {
    const staff = await authService.getAllStaff();
    res.json(staff);
  } catch (error) {
    next(error);
  }
};

module.exports = { createStaff, login, getMe, getHosts, getStaff };
