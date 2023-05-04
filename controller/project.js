const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../utils/auth");
const Project = require("../model/project");
const Role = require("../model/role");
const { body, validationResult, check } = require("express-validator");
const ShortUniqueId = require("short-unique-id");

router.get("/create-new", ensureAuthenticated, (req, res) => {
  res.render("createNew", {
    title: "New Project",
    layout: "layout/main-layout",
  });
});

router.post(
  "/create-new",
  [
    body("projectName").custom(async (value) => {
      const project = await Project.findOne({ projectName: value });
      if (project) {
        throw new Error("Project name already been used");
      }
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req).mapped();
    if (Object.keys(errors).length !== 0) {
      res.render("createNew", {
        title: "New Project",
        layout: "layout/main-layout",
        errProjectName: errors?.projectname?.msg,
      });
    } else {
      const uuid = new ShortUniqueId();
      let projectId = uuid();
      Project.insertMany({
        projectId,
        projectName: req.body.projectName,
        productOwner: req.user.username,
      });
      req.body.rolesNeeded.forEach((value, index) => {
        Role.insertMany({
          projectId,
          roleName: value,
          qtyRole: +req.body.qtyRole[index],
        });
      });
      res.redirect("/dashboard");
    }
  }
);

router.get("/:id", ensureAuthenticated, async (req, res) => {
  const project = await Project.findOne({ projectId: req.params.id });
  res.render("project", {
    title: project.projectName,
    layout: "layout/main-layout",
  });
});

module.exports = router;
