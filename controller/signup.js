const express = require("express");
const router = express.Router();
const User = require("../model/user");
// const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const flash = require("connect-flash");
const { body, validationResult, check } = require("express-validator");

router.get("/", (req, res) => {
  res.render("signup", {
    errAlert: undefined,
    errPwRequirement: undefined,
    errPwConfirm: undefined,
    errUsername: undefined,
    errEmail: undefined,
    title: "Sign Up",
    layout: "layout/main-layout",
    cssName: "signup",
    destination: !req.query.dest ? null : req.query.dest,
  });
});

router.post(
  "/",
  [
    check("password", "Password atleast 6 character").isLength({ min: 6 }),
    body("password2").custom((value, { req, loc, path }) => {
      if (value !== req.body.password) {
        // trow error if passwords do not match
        throw new Error("Passwords don't match");
      } else {
        return value;
      }
    }),
    body("email").custom(async (value) => {
      const user = await User.findOne({ email: value });
      if (user) {
        throw new Error("Email already registered");
      }
    }),
    body("username").custom(async (value) => {
      const user = await User.findOne({ username: value });
      if (user) {
        throw new Error("Username already registered");
      }
    }),
  ],
  (req, res) => {
    const errors = validationResult(req).mapped();
    const { fName, lName, username, email, password, password2 } = req.body;
    let errAlert = "";

    if (!fName || !lName || !username || !email || !password || !password2) {
      errAlert = "Please fill in all fields";
    }
    if (errors.length !== 0) {
      const errPwRequirement = errors.password?.msg;
      const errPwConfirm = errors.password2?.msg;
      const errUsername = errors.username?.msg;
      const errEmail = errors.email?.msg;
      res.render("signup", {
        errAlert,
        errPwRequirement,
        errPwConfirm,
        errUsername,
        errEmail,
        fName,
        lName,
        username,
        email,
        password,
        password2,
        title: "Sign Up",
        layout: "layout/main-layout",
        cssName: "signup",
        destination: !req.query.dest ? null : req.query.dest,
      });
      console.log(errors.password.msg);
    } else {
      const newUser = new User({
        fName,
        lName,
        username,
        email: email,
        password: password,
      });
      //hash password
      bcrypt.genSalt(10, (err, salt) =>
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          //save pass to hash
          newUser.password = hash;
          //save user
          newUser
            .save()
            .then((value) => {
              console.log(value);
              req.flash("success_msg", "You have now registered!");
              res.redirect(!req.query.dest ? "/signin" : `/signin?dest=${req.query.dest}`);
            })
            .catch((value) => console.log(value));
        })
      );
    }
  }
);

module.exports = router;
