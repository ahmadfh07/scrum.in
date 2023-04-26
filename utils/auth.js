module.exports = {
  ensureAuthenticated: function (req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash("error_msg", "Please Sign In to see tis resources");
    res.redirect(`/signin?dest=${req._parsedOriginalUrl.href}`);
  },
  isAdmin: function (req, res, next) {
    if (req.user?.role !== "Admin") {
      res.status(401);
      res.render("unauthorized", {
        title: "401",
        layout: "layout/main-layout",
      });
    } else {
      return next();
    }
    // req.flash("error_msg", "please signin as admin to view this resource");
  },
};
