const express = require("express");
const router = express.Router();
const passport = require("passport");

router.get("/", (req, res) => {
  res.render("signin", {
    title: "Sign In",
    layout: "layout/main-layout",
    destination: !req.query.dest ? null : req.query.dest,
  });
});

router.post("/", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: !req.query.dest ? "/dashboard" : req.query.dest,
    failureRedirect: "/signin",
    failureFlash: true,
  })(req, res, next);
});

module.exports = router;
