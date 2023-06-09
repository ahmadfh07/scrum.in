const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../utils/auth");
const Project = require("../model/project");
const Backlog = require("../model/productBacklog");
const Role = require("../model/role");
const Comment = require("../model/comment");
const Sprint = require("../model/sprint");
const { body, validationResult, check } = require("express-validator");

router.get("/", async (req, res) => {
  function today() {
    var d = new Date();
    d.setDate(d.getDate());
    return d.toISOString();
  }
  let userRole;
  const project = await Project.findOne({ projectId: req.projectId });
  const roles = await Role.find({ projectId: req.projectId });
  const aggregate = Role.aggregate();
  const rolesAndHolder = await aggregate.unwind("$holders").match({ projectId: req.projectId });
  const comments = await Comment.find({ projectId: req.projectId });
  const targetSprint = await Sprint.findOne({ startDate: { $lte: today() }, finishDate: { $gte: today() }, projectId: req.projectId }).select("_id");
  const targetSprintValue = targetSprint?._id.toHexString();
  const backlogs = await Backlog.find({ sprintId: targetSprintValue });
  if (project) {
    if (req.user.username === project.productOwner) {
      userRole = "product owner";
    } else {
      const targetRole = await Role.find({ projectId: req.projectId }).elemMatch("holders", { username: req.user.username });
      userRole = targetRole.length == 0 ? "intruder" : targetRole[0]?.roleName;
    }
    res.render("project-timeline", {
      project,
      targetSprint,
      roles,
      backlogs,
      comments,
      rolesAndHolder,
      userRole,
      page: "Project",
      subPage: "Timeline",
      user: req.user,
      title: project.projectName,
      layout: "layout/main-layout",
    });
  } else {
    res.status(404);
    res.render("404", {
      title: "404",
      layout: "layout/signin-signout",
    });
  }
});

router.post("/planning-backlog", async (req, res) => {
  try {
    const plannedBacklog = await Backlog.findByIdAndUpdate(req.query.id, { assignedTo: req.body.assignedTo });
    if (!!req.body.comment) {
      const comment = await Comment.insertMany({ projectId: req.projectId, sprintId: req.body.sprintId, backlogId: req.body.backlogId, commenter: req.user.username, comment: req.body.comment });
    }
    res.send({ status: "success", data: { plannedBacklog } });
  } catch (err) {
    console.log(err);
    res.send({ status: "error", data: err.message });
  }
});

router.post("/insert-backlog-to-kanban-topic", async (req, res) => {
  try {
    const updatedBacklog = await Backlog.findByIdAndUpdate(req.body.backlogId, { backlogStatus: !req.body.backlogStatus ? "To DO" : req.body.backlogStatus });
    console.log(req.body.backlogStatus);
    console.log(updatedBacklog);
  } catch (err) {
    console.log(err.message);
    res.send({ status: "error", data: err.message });
  }
});

router.get("/get-comments", async (req, res) => {
  try {
    const backlogComments = await Comment.find({ backlogId: req.query.backlogId });
    res.send({ status: "success", data: backlogComments });
  } catch (err) {
    res.send({ status: "error", data: err.message });
  }
});
module.exports = router;
