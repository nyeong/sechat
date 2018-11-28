const express = require("express");
const router = express.Router();
const utils = require("../utils");
const User = require("../models/user");
const Group = require("../models/user");

router.use(utils.sessionChcker);

router.get("/", (req, res) => {
  User.findById(req.session.user.id)
    .populate("groups")
    .exec((err, user) => {
      if (err) throw err;
      res.render("home", {
        title: "title",
        groups: user.groups
      });
    });
});

module.exports = router;
