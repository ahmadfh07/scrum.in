const mongoose = require("mongoose");
const CommentSchema = new mongoose.Schema({
  projectId: {
    type: String,
    required: true,
  },
  sprintId: {
    type: String,
  },
  backlogId: {
    type: String,
    required: true,
  },
  commenter: {
    type: String,
    required: true,
  },
  comment: {
    type: String,
    required: true,
  },
});
const commentBacklog = mongoose.model("commentBacklog", CommentSchema);

module.exports = commentBacklog;
