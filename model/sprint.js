const mongoose = require("mongoose");
const SprintSchema = new mongoose.Schema({
  projectId: {
    type: String,
    required: true,
  },
  sprintGoal: {
    type: String,
    required: true,
    default: "",
  },
  startDate: {
    type: Date,
    default: "",
  },
  finishDate: {
    type: Date,
    default: "",
  },
  date: {
    type: Date,
    default: Date.now,
  },
});
const Sprint = mongoose.model("sprint", SprintSchema);

module.exports = Sprint;
