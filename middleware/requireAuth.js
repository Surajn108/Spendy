module.exports = function requireAuth(req, res, next) {
  if (!req.session.userId) {
    req.session.flash = { type: "error", text: "Sign in to continue." };
    return res.redirect("/login");
  }
  next();
};
