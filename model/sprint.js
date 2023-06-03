const mongoose = require("mongoose");
const SprintSchema = new mongoose.Schema({
  projectId: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    default: Date.now,
    required: true,
  },
  finishDate: {
    type: Date,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});
const Sprint = mongoose.model("sprint", SprintSchema);

module.exports = Sprint;
