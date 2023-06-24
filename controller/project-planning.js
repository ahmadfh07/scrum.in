const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../utils/auth");
const Project = require("../model/project");
const Backlog = require("../model/productBacklog");
const Role = require("../model/role");
const Sprint = require("../model/sprint");
const { body, validationResult, check } = require("express-validator");
const ShortUniqueId = require("short-unique-id");
const mongoose = require("mongoose");

router.post(
  "/create-backlog",
  [
    check("backlogName", "Backlog name already been used").custom(async (value, { req, location, path }) => {
      const backlog = await Backlog.findOne({ backlogName: value }).and({ projectId: req.projectId });
      if (backlog) {
        throw new Error("Backlog name already been used");
      }
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req).mapped();
    if (Object.keys(errors).length !== 0) {
      res.send({ status: `error`, data: errors });
    } else {
      try {
        const project = await Project.findOne({ projectId: req.projectId });
        const backlog = await Backlog.insertMany({ projectId: req.projectId, backlogName: req.body.backlogName, storyPoint: req.body.storyPoint, definitionOfDone: req.body.definitionOfDone });
        res.send({ status: "success", data: backlog });
      } catch (err) {
        res.send({ status: "error", data: err.message });
      }
    }
  }
);

router.post(
  "/update-backlog",
  [
    check("backlogName", "Backlog name already been used").custom(async (value, { req, location, path }) => {
      const dupe = await Backlog.findOne({ backlogName: value }).and({ projectId: req.projectId });
      const oldBacklog = await Backlog.findById(req.query.id);
      if (dupe && value != oldBacklog.backlogName) {
        throw new Error("Backlog name already been used");
      }
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req).mapped();
    if (Object.keys(errors).length !== 0) {
      res.send({ status: `error`, data: errors });
    } else {
      try {
        const updatedBacklog = await Backlog.findByIdAndUpdate(req.query.id, { projectId: req.projectId, backlogName: req.body.backlogName, storyPoint: req.body.storyPoint, definitionOfDone: req.body.dod });
        res.send({ status: "success", data: updatedBacklog });
      } catch (err) {
        res.send({ status: "error", data: err.message });
      }
    }
  }
);

router.post("/delete-backlog", async (req, res) => {
  try {
    const deletedBacklog = await Backlog.findByIdAndDelete(req.query.id);
    res.send({ status: "success", data: deletedBacklog });
  } catch (err) {
    res.send({ status: "error", data: err.message });
  }
});

router.get("/get-backlog", async (req, res) => {
  try {
    const backlog = await Backlog.findById(req.query.id);
    res.send({ status: "success", data: backlog });
  } catch (err) {
    res.send({ status: "error", data: err.message });
  }
});

router.post(
  "/create-sprint",
  [
    body("projectId").custom(async (value, { req, location, path }) => {
      const dupe = await Project.findOne({ projectId: value });
      if (dupe) {
        throw new Error("Project Id cant be found");
      }
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req).mapped();
    if (Object.keys(errors).length !== 0) {
      res.send({ status: `error`, errors });
    } else {
      try {
        const sprint = await Sprint.insertMany({ projectId: req.projectId, startDate: req.body.startDate, finishDate: req.body.finishDate });
        res.send("success", sprint);
      } catch (err) {
        res.send(err.message).status("403");
      }
    }
  }
);
module.exports = router;
