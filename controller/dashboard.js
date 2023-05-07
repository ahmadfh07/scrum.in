const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../utils/auth");

router.get("/", ensureAuthenticated, (req, res) => {
  res.render("dashboard", {
    user: req.user,
    title: "Dashboard",
    layout: "layout/main-layout",
  });
});

module.exports = router;
