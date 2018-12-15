const express = require("express");
const router = express.Router();
const Group = require("../models/group");
const User = require("../models/user");
const utils = require("../utils");

router.use(utils.sessionChcker);

router.get("/group/:group_id/invite", utils.authChecker, (req, res) => {
  User.find({})
    .populate("groups", "_id")
    .then(users_ => {
      let users = users_.map(u => {
        u["alreadyMember"] = u.groups.some(
          ({ _id }) => _id == req.params.group_id
        );
        u["groups"] = undefined;
        u["password"] = undefined;
        return u;
      });
      res.render("invite", { users: users, groupId: req.params.group_id });
    });
});

router.post("/api/group/:group_id/invite", utils.authChecker, (req, res) => {
  let users = req.body["users[]"];
  let groupId = req.params.group_id;
  console.log(req.body);
  User.find()
    .where("_id")
    .in(users)
    .exec((err, users) => {
      if (err) throw err;
      Group.findById(groupId, (err, group) => {
        if (err) throw err;
        users.forEach(user => {
          group.users.push(user._id);
          user.groups.push(groupId);
          user.save();
        });
        group.save().then(_ => res.json({ success: `/group/${groupId}` }));
      });
    });
});

module.exports = router;
