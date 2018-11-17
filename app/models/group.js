const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Group = new Schema({
  name: { type: String, required: true },
  users: [Schema.Types.ObjectId]
});

module.exports = mongoose.model("group", Group);
