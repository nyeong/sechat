const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Group = new Schema({
  name: { type: String, required: true },
  users: [{ type: Schema.Types.ObjectId, ref: "user" }]
});

module.exports = mongoose.model("group", Group);
