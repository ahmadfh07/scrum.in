const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../utils/auth");

router.get("/", ensureAuthenticated, (req, res) => {
  res.render("createNew", {
    title: "New Project",
    layout: "layout/main-layout",
  });
});

router.post("/", (req, res) => {});

module.exports = router;
