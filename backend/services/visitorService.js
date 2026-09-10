const Visitor = require("../models/Visitor");

const createVisitor = async (data) => {
  return Visitor.create(data);
};

const getAllVisitors = async (filter = {}) => {
  return Visitor.find(filter).populate("hostId", "name email").sort({ createdAt: -1 });
};

const getVisitorById = async (id) => {
  return Visitor.findById(id).populate("hostId", "name email");
};

const updateVisitor = async (id, data) => {
  return Visitor.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};

module.exports = { createVisitor, getAllVisitors, getVisitorById, updateVisitor };
