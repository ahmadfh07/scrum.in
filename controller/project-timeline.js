const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../utils/auth");
const Project = require("../model/project");
const Backlog = require("../model/productBacklog");
const Role = require("../model/role");
const Sprint = require("../model/sprint");
const { body, validationResult, check } = require("express-validator");

router.get("/", async (req, res) => {
  const project = await Project.findOne({ projectId: req.projectId });
  const roles = await Role.find({ projectId: req.projectId });
  res.render("project-timeline", {
    project,
    roles,
    page: "Project",
    subPage: "Timeline",
    user: req.user,
    title: project.projectName,
    layout: "layout/main-layout",
  });
});

module.exports = router;
