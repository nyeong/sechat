const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Event = new Schema({
  body: { type: String, required: true },
  date: { type: Date, required: true },
  group: { type: Schema.Types.ObjectId, required: true, ref: "group" }
});

module.exports = mongoose.model("event", Event);
