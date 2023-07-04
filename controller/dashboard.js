const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../utils/auth");

router.get("/", ensureAuthenticated, (req, res) => {
  res.render("dashboard", {
    user: req.user,
    title: "Overview",
    page: "Overview",
    layout: "layout/main-layout",
  });
});

module.exports = router;
