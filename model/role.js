const mongoose = require("mongoose");
const RoleSchema = new mongoose.Schema({
  projectId: {
    type: String,
    required: true,
  },
  roleName: {
    type: String,
    required: true,
  },
  qtyRole: {
    type: Number,
    required: true,
  },
  holders: [
    {
      username: String,
      email: String,
    },
  ],
  date: {
    type: Date,
    default: Date.now,
  },
});
const Role = mongoose.model("role", RoleSchema);

module.exports = Role;
