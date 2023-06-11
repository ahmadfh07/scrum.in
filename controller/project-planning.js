const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../utils/auth");
const Project = require("../model/project");
const Backlog = require("../model/productBacklog");
const Role = require("../model/role");
const { body, validationResult, check } = require("express-validator");
const ShortUniqueId = require("short-unique-id");

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
      res.send({ status: `error`, errors });
    } else {
      try {
        const project = await Project.findOne({ projectId: req.projectId });
        const backlog = await Backlog.insertMany({ projectId: req.projectId, backlogName: req.body.backlogName, storyPoint: req.body.storyPoint, definitionOfDone: req.body.dod });
        res.send(`the code is ${req.projectId}, the body contains : ${req.body}`);
      } catch (err) {
        res.send(err.message);
      }
    }
  }
);
module.exports = router;
