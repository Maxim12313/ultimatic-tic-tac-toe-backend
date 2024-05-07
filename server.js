import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const port = 8080;
const app = express(); 
const server = createServer(app); 

const development = "http://localhost:3000";
const production = "https://ultimate-tic-tac-toe-git-main-maxims-projects-cd9423de.vercel.app";
const frontEnd = process.env.NODE_ENV == "development" ? development : production;

const io = new Server(server, { 
  connectonStateRecovery: {},
  cors : {
    origin: frontEnd
  }
});

let queue = [];

io.on("connection", (socket) => {
  if (queue.length == 0) queue.push(socket);
  else {
    const other = queue.pop();
    const gameId = socket.id + other.id;
    socket.gameId = other.gameId = gameId;

    socket.join(gameId);
    other.join(gameId);

    socket.emit("join");
    other.emit("join");

    socket.emit("setX");
  }
  
  socket.on("name", (name) => {
    socket.broadcast.to(socket.gameId).emit("name", name);
  })

  socket.on("disconnect", () => {
    queue = queue.filter((x) => {
      return x.id != socket.id;
    });
    if (socket.gameId != null) {
      io.to(socket.gameId).emit("player disconnect");
    }
  });

  socket.on("msg", (msg, id) => {
    io.to(socket.gameId).emit("msg", msg, id);
  });
  socket.on("play again", (name) => {
    io.to(socket.gameId).emit("play again", name);
  })
  socket.on("play", (bigIdx, i) => {
    socket.broadcast.to(socket.gameId).emit("play", bigIdx, i);
  })
  socket.on("reset", () => {
    socket.broadcast.to(socket.gameId).emit("reset");
  }) 

});

server.listen(port, () => {
  console.log("listening on " + port);
});