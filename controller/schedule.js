const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../utils/auth");
const Project = require("../model/project");
const Role = require("../model/role");
const Backlog = require("../model/productBacklog");
const Sprint = require("../model/sprint");

router.get("/", ensureAuthenticated, async (req, res) => {
  function today() {
    var d = new Date();
    d.setDate(d.getDate());
    return d.toISOString();
  }
  let projectIdWithActiveSprint = [];
  const activeSprintsProjectId = await Sprint.find({ startDate: { $lte: today() }, finishDate: { $gte: today() } }).select("projectId");
  activeSprintsProjectId.forEach((e) => {
    projectIdWithActiveSprint?.push(e.projectId);
  });
  const projectAsPO = await Project.find({ projectId: { $in: projectIdWithActiveSprint }, productOwner: req.user.username });
  const projectNotAsPO = await Project.find({ projectId: { $in: projectIdWithActiveSprint } }).elemMatch("members", { username: req.user.username });
  const projects = [...projectAsPO, ...projectNotAsPO];
  res.render("schedule", {
    user: req.user,
    title: "Project dashboard",
    layout: "layout/main-layout",
    projects,
    page: "Schedule",
  });
});

module.exports = router;
