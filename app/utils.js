exports.sessionChcker = (req, res, next) => {
  if (exports.isUserLoggedIn(req.session)) next();
  else res.redirect("/login");
};

exports.isUserLoggedIn = session => {
  return session.user !== undefined;
};
