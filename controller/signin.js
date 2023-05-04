const express = require("express");
const router = express.Router();
const passport = require("passport");

router.get("/", (req, res) => {
  res.render("signin", {
    title: "Sign In",
    layout: "layout/signin-signout",
    destination: !req.query.dest ? null : req.query.dest,
  });
});

router.post("/", (req, res, next) => {
  const creds = req.body;
  passport.authenticate(
    "local",
    (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.render("signin", {
          alertMsg: info.message,
          usernameMsg: info.message?.usernameMsg,
          pwMsg: info.message?.pwMsg,
          creds,
          title: "Sign In",
          layout: "layout/signin-signout",
          destination: !req.query.dest ? null : req.query.dest,
        });
      }
      req.logIn(user, function (err) {
        if (err) {
          return next(err);
        }
        return res.redirect(!req.query.dest ? "/dashboard" : req.query.dest);
      });
    },
    {
      failureFlash: true,
    }
  )(req, res, next);
});

module.exports = router;
