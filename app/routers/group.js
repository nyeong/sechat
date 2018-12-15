const express = require("express");
const router = express.Router();
const Message = require("../models/message");
const Group = require("../models/group");
const User = require("../models/user");
const utils = require("../utils");

router.use(utils.sessionChcker);

router.get("/group/:group_id", utils.authChecker, (req, res) => {
  Group.findById(req.params.group_id)
    .populate("users")
    .exec((err, group) => {
      if (err) throw err;
      if (!group) return res.redirect("/");
      Message.find({ group: group._id })
        .populate("user")
        .then(messages => {
          res.render("group", {
            group: group,
            user: req.session.user,
            messages: messages
          });
        });
    });
});

router.get("/api/group/:group_id/users", utils.authChecker, (req, res) => {
  Group.findById(req.params.group_id)
    .populate("users")
    .exec((err, group) => {
      if (err) throw err;
      if (!group) return res.status(404).json({ error: "Group Not Found" });
      const users = group.users.map(user => {
        user.password = undefined;
        delete user.password;
        return user;
      });
      res.json({
        users: users
      });
    });
});

router.post("/api/group/:group_id/rename", utils.authChecker, (req, res) => {
  Group.findById(req.params.group_id, (err, group) => {
    if (!group) return res.status(404).json({ error: "not found" });
    group.name = req.body.new_name;
    group.save().then(_ =>
      res.json({
        success: req.body.new_name
      })
    );
  });
});

router.post("/api/group/:group_id/groupOut", utils.authChecker, (req, res) => {
  let groupId = req.params.group_id;
  let userId = req.session.user.id;
  Group.findById(groupId, (err, group) => {
    if (err) throw err;
    if (!group) return res.status(404).json({ error: "not found" });
    group.users.splice(group.users.indexOf(userId), 1);
    User.findById(userId, (err, user) => {
      user.groups.splice(user.groups.indexOf(groupId), 1);
      user.save();
    });
    group.save();
  });
  return res.json({ success: true });
});

module.exports = router;
