const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../utils/auth");
const Project = require("../model/project");
const Role = require("../model/role");
const Backlog = require("../model/productBacklog");
const Sprint = require("../model/sprint");
const Comment = require("../model/comment");
const { body, validationResult, check } = require("express-validator");
const ShortUniqueId = require("short-unique-id");
const uuidRole = new ShortUniqueId();

router.get("/dashboard", ensureAuthenticated, async (req, res) => {
  const projectAsPO = await Project.find({ productOwner: req.user.username });
  const projectNotAsPO = await Project.find({}).elemMatch("members", { username: req.user.username });
  const projects = [...projectAsPO, ...projectNotAsPO];
  res.render("project-dashboard", {
    user: req.user,
    title: "Project dashboard",
    layout: "layout/main-layout",
    projects,
    page: "Project",
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

router.get("/:id/overview", ensureAuthenticated, async (req, res) => {
  let userRole;
  const project = await Project.findOne({ projectId: req.params.id });
  const roles = await Role.find({ projectId: req.params.id });
  const aggregate = Role.aggregate();
  const rolesAndHolder = await aggregate.unwind("$holders").match({ projectId: req.params.id });
  const backlogs = await Backlog.find({ projectId: req.params.id });
  const sprints = await Sprint.find({ projectId: req.params.id });
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
      backlogs,
      sprints,
      rolesAndHolder,
      page: "Project",
      subPage: "Overview",
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
    const updatedProject = await Project.findOneAndUpdate({ projectId: req.params.id }, { $push: { members: { username: req.user.username, email: req.user.email } } });
    res.send({ status: "sucess", data: req.params.id });
  } catch (err) {
    console.log(project);
    res.send({ status: "error", msg: err.message });
  }
});

router.post(
  "/:id/update-project",
  [
    check("projectName", "Project name already been used").custom(async (value, { req, location, path }) => {
      const dupe = await Project.findOne({ projectName: value });
      const oldProject = await Project.findOne({ projectId: req.params.id });
      if (dupe && value != oldProject.projectName) {
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
      const project = await Project.findOneAndUpdate(
        { projectId: req.params.id },
        {
          projectName: req.body.projectName,
          projectDesc: req.body.projectDesc,
        }
      );
      req.body.rolesNeeded.forEach(async (value, index) => {
        let roleId = uuidRole();
        const role = await Role.findOneAndUpdate(
          { roleId: value.roleId },
          {
            projectId: req.params.id,
            roleId: value.roleId,
            roleName: value.inputValue,
          }
        );
        if (!role) {
          const newRole = await Role.insertMany({
            projectId: req.params.id,
            roleId,
            roleName: value.inputValue,
          });
        }
      });
      res.send({ status: `success`, project });
    }
  }
);

router.post(
  "/:id/create-role",
  [
    body("roleName").custom(async (value, { req, location, path }) => {
      const dupe = await Role.findOne({ roleName: value }).and({ projectId: req.params.id });
      if (dupe) {
        throw new Error("Role Name already been used");
      }
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req).mapped();
    if (Object.keys(errors).length !== 0) {
      res.send(errors).status(400);
    } else {
      try {
        let roleId = uuidRole();
        const role = await Role.insertMany({ projectId: req.params.id, roleId, roleName: req.body.roleName });
        res.send("success");
      } catch (err) {
        res.send(err.message).status(400);
      }
    }
  }
);

router.post("/:id/delete", async (req, res) => {
  try {
    const deletedProject = await Project.findOneAndDelete({ projectId: req.params.id });
    const deletedSprints = await Sprint.deleteMany({ projectId: req.params.id });
    const deletedComments = await Comment.deleteMany({ projectId: req.params.id });
    const deletedBacklogs = await Backlog.deleteMany({ projectId: req.params.id });
    const deletedRole = await Role.deleteMany({ projectId: req.params.id });
    res.send({ status: "success" });
  } catch (err) {
    res.send({ status: "error", data: err.message });
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

router.use(
  "/:id/timeline",
  (req, res, next) => {
    req.projectId = req.params.id;
    next();
  },
  require("../controller/project-timeline")
);

module.exports = router;
