var app = require("express")();
var http = require("http").Server(app);
var io = require("socket.io")(http);

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", function(socket) {
  socket.emit(
    "ACK",
    {
      socket_id: socket.id
    },
    room => {
      socket.join(room);
      console.log(">> " + socket.id + " joined " + room);
    }
  );

  socket.on("join", room => {
    socket.leaveAll();
    socket.join(room);
    console.log(">> " + socket.id + " joined " + room);
  });

  socket.on("logdata", function(data) {
    // console.log("[logdata]", data);
    Object.keys(socket.rooms).forEach(room => {
      io.to("_" + room).emit("message", data);
    });
  });

  socket.on("disconnected", function() {
    console.log(socket.id, "disconnected");
  });
});

http.listen(7777, function() {
  console.log("listening on *:7777");
});
