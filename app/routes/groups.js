const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Group = require("../models/group");
const utils = require("../utils");

router.use(utils.sessionChcker);

// 모든 그룹 조회
router.get("/", (req, res) => {
  res.json(req.session.user.groups.map(id => Group.findById(id)));
});

// 새 그룹 만들기
router.post("/", (req, res) => {
  const group = new Group();
  group.name = req.body.name;
  group.users.push(req.session.userid);
  group.users = group.users.concat(req.body.users);

  group.save(err => {
    if (err) {
      throw err;
    }
    res.json({ success: true, group_id: group._id });
  });
});

// 특정 그룹 조회
router.get("/:group_id", (req, res) => {
  Group.findById(req.params.group_id, (err, group) => {
    if (err) {
      throw err;
    }
    if (!group) return res.status(404).json({ error: "Group Not Found" });
    res.json(group);
  });
});

module.exports = router;
