const express = require("express");
const router = express.Router();
const User = require("../models/user");

// Login
router.get("/login", (req, res) => {
  res.render("login");
});

// login api
router.post("/api/sessions/login", (req, res) => {
  User.findOne({ username: req.body.username }, (err, user) => {
    if (err) throw err;
    if (!user) return res.status(404).json({ error: "해당 유저가 없습니다." });
    if (!user.verifyPassword(req.body.password))
      return res
        .status(401)
        .json({ error: "아이디와 비밀번호가 맞지 않습니다." });
    req.session.user = user;
    res.json({
      success: true
    });
  });
});

// Logout
router.post("/logout", (req, res) => {
  if (!req.session.username)
    return res.status(418).json({ error: "YOU ARE NOT LOGGED IN" });
  req.session.destroy(err => {
    if (err) throw err;
  });
  return res.json({ success: true });
});

module.exports = router;
