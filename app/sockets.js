const Group = require("./models/group");
const User = require("./models/user");
const Message = require("./models/message");

let usernames = {};

module.exports = function(io) {
  io.sockets.on("connection", socket => {
    socket.on("add user", (userId, groupId) => {
      console.log(userId, groupId);
      socket.userId = userId;
      socket.groupId = groupId;
      usernames[userId] = userId;
      socket.join(groupId);
    });

    socket.on("send message", data => {
      Message.create({
        group: socket.groupId,
        user: socket.userId,
        body: data,
        type: "text"
      }).then(message =>
        Message.populate(message, { path: "user" }, (err, msg) =>
          io.sockets.in(socket.groupId).emit("update messages", msg)
        )
      );
    });
  });
};
