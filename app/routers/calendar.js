const express = require("express");
const router = express.Router();
const Group = require("../models/group");
const Event = require("../models/event");
const utils = require("../utils");

router.use(utils.sessionChcker);

router.get("/group/:group_id/calendar", utils.authChecker, (req, res) => {
  Group.findById(req.params.group_id)
    .populate("events")
    .then(group => {
      res.render("calendar", { group: group });
    });
});

router.get(
  "/group/:group_id/calendar/events",
  utils.authChecker,
  (req, res) => {
    Group.findById(req.params.group_id)
      .populate("events")
      .then(group => {
        res.json({ events: group.events });
      });
  }
);

router.post(
  "/api/group/:group_id/calendar/event",
  utils.authChecker,
  (req, res) => {
    Group.findById(req.params.group_id).then(group => {
      let event = new Event();
      event.date = req.body.date;
      event.body = req.body.body;
      event.group = group._id;
      event.save().then(event => {
        group.events.push(event._id);
        group.save().then(_ => res.json({ success: event }));
      });
    });
  }
);

router.delete(
  "/api/group/:group_id/calendar/event/:event_id",
  utils.authChecker,
  (req, res) => {
    console.log(req.params);
    const eventId = req.params.event_id;
    const groupId = req.params.group_id;
    Group.findById(groupId).then(group => {
      group.events.splice(group.events.indexOf(eventId), 1);
      group
        .save()
        .then(_ =>
          Event.findByIdAndDelete(eventId).then(_ =>
            res.json({ success: true })
          )
        );
    });
  }
);

module.exports = router;
