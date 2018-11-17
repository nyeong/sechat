const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Group = require("../models/group");
const utils = require("../utils");

router.use(utils.sessionChcker);

// 모든 그룹 조회
router.get("/", (req, res) => {
  res.render("home", {
    title: "Home",
    user: req.session.user
  });
});

module.exports = router;
