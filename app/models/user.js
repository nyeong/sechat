const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Group = require("./group");

const User = new Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  groups: [Schema.Types.ObjectId]
});

User.methods.verifyPassword = function(password) {
  return this.password === password;
};

User.methods.getGroups = function() {
  return this.groups.map(id => Group.findById(id));
};

User.statics.findAll = function() {
  return this.find({});
};

User.statics.findByUsername = function(username) {
  return this.findOne({ username });
};

module.exports = mongoose.model("user", User);
