const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const User = new Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  groups: [{ type: Schema.Types.ObjectId, ref: "group" }]
});

User.methods.verifyPassword = function(password) {
  return this.password === password;
};

User.statics.findAll = function() {
  return this.find({});
};

User.statics.findByUsername = function(username) {
  return this.findOne({ username });
};

module.exports = mongoose.model("user", User);
