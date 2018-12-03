const express = require("express");
const router = express.Router();
const utils = require("../utils");
const Group = require("../models/group");
const User = require("../models/user");

router.use(utils.sessionChcker);

router.get("/", (req, res) => {
  User.find({}).then(users => {
    User.findById(req.session.user.id)
      .populate("groups")
      .exec((err, user) => {
        if (err) throw err;
        res.render("home", {
          title: "title",
          groups: user.groups,
          username: user.username,
          users: users
        });
      });
  });
});

router.get("/new_group/", (req, res) => {
  Group.create(
    {
      name: "이름 없는 새 그룹",
      users: [req.session.user.id]
    },
    (err, group) => {
      if (err) throw err;
      User.findById(req.session.user.id).then(user => {
        user.groups.push(group);
        user.save().then(_ => res.redirect("/group/" + group._id));
      });
    }
  );
});

module.exports = router;
