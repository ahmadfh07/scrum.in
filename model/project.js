const mongoose = require("mongoose");
const ProjectSchema = new mongoose.Schema({
  projectId: {
    type: String,
    required: true,
  },
  projectName: {
    type: String,
    required: true,
  },
  projectDesc: {
    type: String,
    required: true,
  },
  productOwner: {
    type: String,
    required: true,
  },
  members: [
    {
      username: String,
      email: String,
    },
  ],
  roles: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});
const Project = mongoose.model("Project", ProjectSchema);

module.exports = Project;
