const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Group = require("../models/group");
const utils = require("../utils");

router.use(utils.sessionChcker);

router.get("/group/:group_id", (req, res) => {
  Group.findById(req.params.group_id)
    .populate("users")
    .exec((err, group) => {
      if (err) throw err;
      if (!group) return res.redirect("/");
      res.render("group", {
        group: group
      });
    });
});

router.get("/api/group/:group_id/users", (req, res) => {
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

module.exports = router;
