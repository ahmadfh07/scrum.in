const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../utils/auth");
const Project = require("../model/project");
const Role = require("../model/role");
const { body, validationResult, check } = require("express-validator");
const ShortUniqueId = require("short-unique-id");

router.get("/create-new", ensureAuthenticated, (req, res) => {
  res.render("createNew", {
    user: req.user,
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
        user: req.user,
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
  let userRole;
  const project = await Project.findOne({ projectId: req.params.id });
  if (project) {
    const projectRoles = await Role.find({ projectId: req.params.id });
    if (req.user.username === project.productOwner) {
      userRole = "product owner";
    } else {
      const role = projectRoles.filter((v) => v.holders.every((c) => c.username == req.user.username));
      if (role) {
        userRole = role[0].roleName;
      }
      userRole = "intruder";
    }
    res.render("project", {
      userRole,
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

module.exports = router;
