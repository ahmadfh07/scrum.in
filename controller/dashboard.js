const express = require("express");
const router = express.Router();
const Project = require("../model/project");
const Role = require("../model/role");
const Backlog = require("../model/productBacklog");
const Sprint = require("../model/sprint");
const { ensureAuthenticated } = require("../utils/auth");

router.get("/", ensureAuthenticated, async (req, res) => {
  const projectAsPO = await Project.find({ productOwner: req.user.username });
  const projectNotAsPO = await Project.find({}).elemMatch("members", { username: req.user.username });
  const tasks = await Backlog.find({}).elemMatch("assignedTo", { username: req.user.username });
  const tasksToDoCount = await Backlog.find({ backlogStatus: "To Do" }).elemMatch("assignedTo", { username: req.user.username }).count();
  const tasksDoingCount = await Backlog.find({ backlogStatus: "Doing" }).elemMatch("assignedTo", { username: req.user.username }).count();
  const tasksDoneCount = await Backlog.find({ backlogStatus: "Done" }).elemMatch("assignedTo", { username: req.user.username }).count();
  const projects = [...projectAsPO, ...projectNotAsPO];
  res.render("dashboard", {
    projects,
    tasks,
    tasksToDoCount,
    tasksDoingCount,
    tasksDoneCount,
    user: req.user,
    title: "Overview",
    page: "Overview",
    layout: "layout/main-layout",
  });
  console.log(req.user.username);
  console.log(tasks);
});

module.exports = router;
