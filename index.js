if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const { connectDB, mongoose, sessionStore } = require("./model/dbConnect");
// const Document = require("./model/document");
// const Category = require("./model/category");
const { ensureAuthenticated, isAdmin } = require("./utils/auth");

const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const bodyParser = require("body-parser");
const path = require("path");
const flash = require("connect-flash");
const session = require("express-session");
const passport = require("passport");
// const Grid = require("gridfs-stream");
const cookieParser = require("cookie-parser");

const port = 3000;
const app = express();
// let gfs, gridfsBucket;

require("./utils/passport")(passport);
app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("trust proxy", 1);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(expressLayouts);

app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
  })
);
app.use(passport.initialize());
app.use(passport.session());
//use flash
app.use(flash());
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

// routes
app.use("/signup", require("./controller/signup"));
app.use("/signin", require("./controller/signin"));
app.use("/dashboard", require("./controller/dashboard"));

app.get("/", (req, res) => {
  res.redirect("/signin");
});

app.get("/signout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.flash("success_msg", "Now logged out");
    res.redirect("/signin");
  });
});

app.use((req, res) => {
  res.status(404);
  res.render("404", {
    title: "404",
    layout: "layout/main-layout",
  });
});

connectDB().then((conn) => {
  conn.once("open", async () => {
    app.listen(process.env.PORT || port, () => {
      console.log(`Express server listening on port ${port} in ${app.settings.env} mode`);
    });
  });
});
