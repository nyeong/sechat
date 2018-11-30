const Group = require("./models/group");
const User = require("./models/user");

exports.sessionChcker = (req, res, next) => {
  if (exports.isUserLoggedIn(req.session)) next();
  else res.redirect("/login");
};

exports.isUserLoggedIn = session => {
  return session.user !== undefined;
};

exports.authChecker = (req, res, next) => {
  Group.findById(req.params.group_id, (err, group) => {
    if (err) throw err;
    if (group.users.some(id => id.toString() == req.session.user.id.toString()))
      return next();
    else return res.redirect("/");
  });
};
