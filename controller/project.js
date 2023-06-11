const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../utils/auth");
const Project = require("../model/project");
const Role = require("../model/role");
const { body, validationResult, check } = require("express-validator");
const ShortUniqueId = require("short-unique-id");

router.get("/dashboard", ensureAuthenticated, (req, res) => {
  res.render("project-dashboard", {
    user: req.user,
    title: "Project dashboard",
    layout: "layout/main-layout",
  });
});

router.get("/join-existing", ensureAuthenticated, (req, res) => {
  res.render("project-join", {
    user: req.user,
    title: "Join project",
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
      res.send({ status: `error`, errors });
    } else {
      const uuidProject = new ShortUniqueId();
      let projectId = uuidProject();
      const project = await Project.insertMany({
        projectId,
        projectName: req.body.projectName,
        projectDesc: req.body.projectDesc,
        productOwner: req.body.productOwner,
      });
      req.body.rolesNeeded.forEach(async (value, index) => {
        const uuidRole = new ShortUniqueId();
        let roleId = uuidRole();
        const role = await Role.insertMany({
          projectId,
          roleId,
          roleName: value,
        });
      });
      res.send({ status: `success`, projectId });
    }
  }
);

router.get("/get-target-role", async (req, res) => {
  try {
    const targetRoles = await Role.findOne({ projectId: req.query.projectId }).and({ roleId: req.query.roleId });
    if (!targetRoles) {
      throw new Error("undefined");
    }
    res.send({ status: "success", data: targetRoles });
  } catch (err) {
    res.send({ status: "error", data: err.message });
  }
});

router.get("/:id", ensureAuthenticated, async (req, res) => {
  let userRole;
  const project = await Project.findOne({ projectId: req.params.id });
  const roles = await Role.find({ projectId: req.params.id });
  const aggregate = Role.aggregate();
  const rolesAndHolder = await aggregate.unwind("$holders").match({ projectId: req.params.id });
  if (project) {
    if (req.user.username === project.productOwner) {
      userRole = "product owner";
    } else {
      const targetRole = await Role.find({ projectId: req.params.id }).elemMatch("holders", { username: req.user.username });
      userRole = targetRole.length == 0 ? "intruder" : targetRole[0]?.roleName;
    }
    res.render("project-overview", {
      userRole,
      project,
      roles,
      rolesAndHolder,
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

router.get("/:id/join", ensureAuthenticated, async (req, res) => {
  const project = await Project.findOne({ projectId: req.params.id });
  const dupeRole = await Role.find({ projectId: req.params.id }).elemMatch("holders", { username: req.user.username });
  const wantedRole = await Role.find({ projectId: req.params.id }).and({ roleId: req.query.role });
  console.log(req.params.id);
  const { username, email } = req.user;
  try {
    if (wantedRole.length == 0) {
      throw new Error(`Role yang diinginkan tidak dapat ditemukan`);
    }
    if (dupeRole.length != 0) {
      throw new Error(`Anda sudah terdaftar sebagai ${dupeRole[0].roleName}`);
    }
    if (username === project.productOwner) {
      throw new Error(`Anda sudah terdaftar sebagai product owner`);
    }
    const updatedRole = await Role.findOneAndUpdate({ projectId: req.params.id, roleId: req.query.role }, { $push: { holders: { username, email } } });
    res.send({ status: "sucess", data: req.params.id });
  } catch (err) {
    console.log(project);
    res.send({ status: "error", msg: err.message });
  }
});

router.use(
  "/:id/planning",
  (req, res, next) => {
    req.projectId = req.params.id;
    next();
  },
  require("../controller/project-planning")
);

module.exports = router;
