const express = require("express");
const router = express.Router();
const User = require("../models/user");
const utils = require("../utils");

// Login
router.get("/login", (req, res) => {
  if (utils.isUserLoggedIn(req.session)) res.redirect("/");
  else res.render("login");
});

// login api
router.post("/api/login", (req, res) => {
  if (utils.isUserLoggedIn(req.session))
    res.status(401).json({ error: "이미 로그인했습니다" });
  User.findOne({ username: req.body.username }, (err, user) => {
    if (err) throw err;
    if (!user) return res.status(404).json({ error: "해당 유저가 없습니다." });
    if (!user.verifyPassword(req.body.password))
      return res
        .status(401)
        .json({ error: "아이디와 비밀번호가 맞지 않습니다." });
    if (user.loggedIn)
      return res.status(401).json({ error: "이미 로그인 한 사용자입니다!" });
    user.loggedIn = true;
    req.session.user = { id: user._id, name: user.username };
    user.save().then(() =>
      res.json({
        success: true
      })
    );
  });
});

// Logout
router.get("/logout", (req, res) => {
  if (!utils.isUserLoggedIn(req.session)) return res.redirect("/");
  User.findById(req.session.user.id).then(user => {
    user.loggedIn = false;
    user.save().then(_ => {
      req.session.destroy(err => {
        if (err) throw err;
      });

      return res.redirect("/login");
    });
  });
});

module.exports = router;
