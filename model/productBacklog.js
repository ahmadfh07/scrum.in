const mongoose = require("mongoose");
const BacklogSchema = new mongoose.Schema({
  projectId: {
    type: String,
    required: true,
  },
  sprintId: {
    type: String,
  },
  backlogName: {
    type: String,
    required: true,
  },
  storyPoint: {
    type: Number,
    required: true,
  },
  definitionOfDone: {
    type: String,
    required: true,
  },
  sprintId: {
    type: String,
    default: "",
  },
  date: {
    type: Date,
    default: Date.now,
  },
  backlogStatus: {
    type: String,
    default: "To Do",
  },
  assignedTo: [
    {
      username: String,
      email: String,
    },
  ],
});
const productBacklog = mongoose.model("productBacklog", BacklogSchema);

module.exports = productBacklog;
